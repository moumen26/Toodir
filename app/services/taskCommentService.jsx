import { apiClient } from './authService';

class TaskCommentService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for comments (shorter cache)
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

  // Create new comment
  async createComment(taskId, commentData) {
    try {
      const response = await apiClient.post(`/comment/create/${taskId}`, commentData);
      
      // Clear related caches
      this.clearCommentsCache(taskId);
      
      return response;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw this.handleError(error);
    }
  }

  // Get comments by task ID
  async getCommentsByTask(taskId, params = {}) {
    try {
      const cacheKey = `comments_task_${taskId}_${JSON.stringify(params)}`;
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

      const url = `/comment/task/${taskId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw this.handleError(error);
    }
  }

  // Get single comment by ID
  async getComment(id, forceRefresh = false) {
    try {
      const cacheKey = `comment_${id}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/comment/${id}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching comment:', error);
      throw this.handleError(error);
    }
  }

  // Update comment
  async updateComment(id, commentData) {
    try {
      const response = await apiClient.patch(`/comment/${id}`, commentData);
      
      // Clear related caches
      this.clearCacheEntry(`comment_${id}`);
      // Also clear task comments cache
      this.clearAllCommentsCache();
      
      return response;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw this.handleError(error);
    }
  }

  // Delete comment
  async deleteComment(id) {
    try {
      const response = await apiClient.delete(`/comment/${id}`);
      
      // Clear related caches
      this.clearCacheEntry(`comment_${id}`);
      this.clearAllCommentsCache();
      
      return response;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw this.handleError(error);
    }
  }

  // Get comment replies
  async getCommentReplies(commentId, params = {}) {
    try {
      const cacheKey = `replies_${commentId}_${JSON.stringify(params)}`;
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

      const url = `/comment/${commentId}/replies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      throw this.handleError(error);
    }
  }

  // Get comment statistics
  async getCommentStats(taskId, forceRefresh = false) {
    try {
      const cacheKey = `comment_stats_${taskId}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/comment/stats/v1?task_id=${taskId}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching comment stats:', error);
      throw this.handleError(error);
    }
  }

  // Helper methods
  clearCommentsCache(taskId) {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.includes(`task_${taskId}`) || key.startsWith('comment_stats_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.clearCacheEntry(key));
  }

  clearAllCommentsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('comments_') || key.startsWith('replies_') || key.startsWith('comment_stats_')) {
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
  invalidateComment(commentId) {
    this.clearCacheEntry(`comment_${commentId}`);
  }

  invalidateTaskComments(taskId) {
    this.clearCommentsCache(taskId);
  }

  invalidateAllComments() {
    this.clearAllCache();
  }

  // Optimistic comment creation for better UX
  async createCommentOptimistic(taskId, commentData, tempId = null) {
    const tempComment = {
      id: tempId || `temp_${Date.now()}`,
      content: commentData.content,
      task_id: taskId,
      author: {
        id: 'current_user',
        full_name: 'You',
        email: ''
      },
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    try {
      // Return temp comment immediately for UI
      const result = await this.createComment(taskId, commentData);
      return {
        ...result,
        optimisticComment: tempComment
      };
    } catch (error) {
      throw {
        ...error,
        optimisticComment: tempComment
      };
    }
  }
}

// Create singleton instance
const taskCommentService = new TaskCommentService();

export default taskCommentService;