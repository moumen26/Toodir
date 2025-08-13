// services/tagService.js
import { apiClient } from './authService';

class TagService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  isCacheValid(key) {
    const timestamp = this.cacheTimestamps.get(key);
    return timestamp && (Date.now() - timestamp) < this.CACHE_DURATION;
  }

  setCache(key, data) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    this.clearCacheEntry(key);
    return null;
  }

  clearCacheEntry(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
  }

  clearAllCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Get all tags for user
  async getTags(params = {}) {
    try {
      const cacheKey = `tags_${JSON.stringify(params)}`;
      const cachedData = this.getCache(cacheKey);
      
      if (cachedData) {
        return { ...cachedData, fromCache: true };
      }

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });

      const url = `/tag${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw this.handleError(error);
    }
  }

  // Get single tag by ID
  async getTag(id, forceRefresh = false) {
    try {
      const cacheKey = `tag_${id}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/tag/${id}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching tag:', error);
      throw this.handleError(error);
    }
  }

  // Create new tag
  async createTag(tagData) {
    try {
      const response = await apiClient.post('/tag/create', tagData);

      // Clear related caches
      this.clearTagsCache();
      
      return response;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw this.handleError(error);
    }
  }

  // Update tag
  async updateTag(id, tagData) {
    try {
      const response = await apiClient.patch(`/tag/${id}`, tagData);

      // Clear related caches
      this.clearCacheEntry(`tag_${id}`);
      this.clearTagsCache();
      
      return response;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw this.handleError(error);
    }
  }

  // Delete tag
  async deleteTag(id) {
    try {
      const response = await apiClient.delete(`/tag/${id}`);
      
      // Clear related caches
      this.clearCacheEntry(`tag_${id}`);
      this.clearTagsCache();
      
      return response;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw this.handleError(error);
    }
  }

  // Add tags to project
  async addTagsToProject(projectId, tagIds) {
    try {
      const response = await apiClient.post(`/project-tag/${projectId}/tags`, {
        tagIds
      });
      
      // Clear related caches
      this.clearCacheEntry(`project_tags_${projectId}`);
      
      return response;
    } catch (error) {
      console.error('Error adding tags to project:', error);
      throw this.handleError(error);
    }
  }

  // Remove tags from project
  async removeTagsFromProject(projectId, tagIds) {
    try {
      const response = await apiClient.delete(`/project-tag/${projectId}/tags`, {
        data: { tagIds }
      });
      
      // Clear related caches
      this.clearCacheEntry(`project_tags_${projectId}`);
      
      return response;
    } catch (error) {
      console.error('Error removing tags from project:', error);
      throw this.handleError(error);
    }
  }

  // Remove single tag from project
  async removeTagFromProject(projectId, tagId) {
    try {
      const response = await apiClient.delete(`/project-tag/${projectId}/tags/${tagId}`);
      
      // Clear related caches
      this.clearCacheEntry(`project_tags_${projectId}`);
      
      return response;
    } catch (error) {
      console.error('Error removing tag from project:', error);
      throw this.handleError(error);
    }
  }

  // Get project tags
  async getProjectTags(projectId, forceRefresh = false) {
    try {
      const cacheKey = `project_tags_${projectId}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/project-tag/${projectId}/tags`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching project tags:', error);
      throw this.handleError(error);
    }
  }

  // Helper method to clear tags cache
  clearTagsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('tags_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.clearCacheEntry(key));
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null,
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        status: -1,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Utility methods for cache invalidation
  invalidateTag(tagId) {
    this.clearCacheEntry(`tag_${tagId}`);
  }

  invalidateAllTags() {
    this.clearAllCache();
  }

  // Prefetch tag for better UX
  async prefetchTag(tagId) {
    try {
      await this.getTag(tagId);
    } catch (error) {
      console.warn('Failed to prefetch tag:', error);
    }
  }

  // Batch operations
  async batchUpdateTags(updates) {
    const results = [];
    for (const update of updates) {
      try {
        const result = await this.updateTag(update.id, update.data);
        results.push({ success: true, data: result, id: update.id });
      } catch (error) {
        results.push({ success: false, error, id: update.id });
      }
    }
    return results;
  }

  // Search tags with autocomplete
  async searchTags(query, limit = 10) {
    try {
      const params = { search: query, limit };
      return await this.getTags(params);
    } catch (error) {
      console.error('Error searching tags:', error);
      throw this.handleError(error);
    }
  }
}

// Create singleton instance
const tagService = new TagService();

export default tagService;