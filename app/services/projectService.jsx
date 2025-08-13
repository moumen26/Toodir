import { apiClient } from './authService';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class ProjectService {
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

  // Create FormData for file uploads
  createFormData(data, files = []) {
    const formData = new FormData();
    
    // Add regular fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key].toString());
        }
      }
    });

    // Add files
    files.forEach((file, index) => {
      const fileExtension = file.uri.split('.').pop();
      const fileName = `image_${index}.${fileExtension}`;
      
      formData.append('images', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        type: file.type || `image/${fileExtension}`,
        name: fileName,
      });
    });

    return formData;
  }

  // Get all projects for user
  async getProjects(params = {}) {
    try {
      const cacheKey = `projects_${JSON.stringify(params)}`;
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

      const url = `/project${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw this.handleError(error);
    }
  }

  // Get single project by ID
  async getProject(id, forceRefresh = false) {
    try {
      const cacheKey = `project_${id}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/project/${id}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw this.handleError(error);
    }
  }

  // Create new project
  async createProject(projectData, images = []) {
    try {
      const formData = this.createFormData(projectData, images);
      
      const response = await apiClient.post('/project/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file uploads
      });

      // Clear related caches
      this.clearProjectsCache();
      
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw this.handleError(error);
    }
  }

  // Update project
  async updateProject(id, projectData, images = []) {
    try {
      let response;
      
      if (images.length > 0) {
        const formData = this.createFormData(projectData, images);
        response = await apiClient.patch(`/project/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
      } else {
        response = await apiClient.patch(`/project/${id}`, projectData);
      }

      // Clear related caches
      this.clearCacheEntry(`project_${id}`);
      this.clearProjectsCache();
      
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      throw this.handleError(error);
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      const response = await apiClient.delete(`/project/${id}`);
      
      // Clear related caches
      this.clearCacheEntry(`project_${id}`);
      this.clearProjectsCache();
      
      return response;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw this.handleError(error);
    }
  }

  // Add images to project
  async addProjectImages(projectId, images) {
    try {
      const formData = new FormData();
      
      images.forEach((file, index) => {
        const fileExtension = file.uri.split('.').pop();
        const fileName = `image_${index}.${fileExtension}`;
        
        formData.append('images', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          type: file.type || `image/${fileExtension}`,
          name: fileName,
        });
      });

      const response = await apiClient.post(`/project/${projectId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      // Clear related caches
      this.clearCacheEntry(`project_${projectId}`);
      
      return response;
    } catch (error) {
      console.error('Error adding project images:', error);
      throw this.handleError(error);
    }
  }

  // Delete project image
  async deleteProjectImage(projectId, imageId) {
    try {
      const response = await apiClient.delete(`/project/${projectId}/images/${imageId}`);
      
      // Clear related caches
      this.clearCacheEntry(`project_${projectId}`);
      
      return response;
    } catch (error) {
      console.error('Error deleting project image:', error);
      throw this.handleError(error);
    }
  }

  // Set primary image
  async setPrimaryImage(projectId, imageId) {
    try {
      const response = await apiClient.patch(`/project/${projectId}/images/${imageId}/primary`);
      
      // Clear related caches
      this.clearCacheEntry(`project_${projectId}`);
      this.clearProjectsCache();
      
      return response;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw this.handleError(error);
    }
  }

  // Get project statistics
  async getProjectStats(projectId, forceRefresh = false) {
    try {
      const cacheKey = `project_stats_${projectId}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/project/${projectId}/stats`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw this.handleError(error);
    }
  }

  // Helper method to clear projects cache
  clearProjectsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('projects_')) {
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
  invalidateProject(projectId) {
    this.clearCacheEntry(`project_${projectId}`);
    this.clearCacheEntry(`project_stats_${projectId}`);
  }

  invalidateAllProjects() {
    this.clearAllCache();
  }

  // Prefetch project for better UX
  async prefetchProject(projectId) {
    try {
      await this.getProject(projectId);
    } catch (error) {
      console.warn('Failed to prefetch project:', error);
    }
  }

  // Batch operations
  async batchUpdateProjects(updates) {
    const results = [];
    for (const update of updates) {
      try {
        const result = await this.updateProject(update.id, update.data, update.images);
        results.push({ success: true, data: result, id: update.id });
      } catch (error) {
        results.push({ success: false, error, id: update.id });
      }
    }
    return results;
  }
}

// Create singleton instance
const projectService = new ProjectService();

export default projectService;