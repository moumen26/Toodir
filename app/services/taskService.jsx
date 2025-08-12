import { apiClient } from './authService';
import { Platform } from 'react-native';

class TaskService {
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
      const fileName = `attachment_${index}.${fileExtension}`;
      
      formData.append('attachments', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        type: file.type || `application/${fileExtension}`,
        name: fileName,
      });
    });

    return formData;
  }

  // Create new task
  async createTask(taskData, attachments = []) {
    try {
      let response;
      
      if (attachments.length > 0) {
        const formData = this.createFormData(taskData, attachments);
        response = await apiClient.post('/task/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds for file uploads
        });
      } else {
        response = await apiClient.post('/task/create', taskData);
      }

      // Clear related caches
      this.clearTasksCache();
      
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw this.handleError(error);
    }
  }

  // Get tasks by project ID
  async getTasksByProject(projectId, params = {}) {
    try {
      const cacheKey = `tasks_project_${projectId}_${JSON.stringify(params)}`;
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

      const url = `/task/project/${projectId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      throw this.handleError(error);
    }
  }

  // Get all tasks for user
  async getTasksByUser(params = {}) {
    try {
      const cacheKey = `tasks_user_${JSON.stringify(params)}`;
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

      const url = `/task/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw this.handleError(error);
    }
  }

  // Get single task by ID
  async getTask(id, forceRefresh = false) {
    try {
      const cacheKey = `task_${id}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const response = await apiClient.get(`/task/${id}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw this.handleError(error);
    }
  }

  // Update task
  async updateTask(id, taskData, attachments = []) {
    try {
      let response;
      
      if (attachments.length > 0) {
        const formData = this.createFormData(taskData, attachments);
        response = await apiClient.patch(`/task/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
      } else {
        response = await apiClient.patch(`/task/${id}`, taskData);
      }

      // Clear related caches
      this.clearCacheEntry(`task_${id}`);
      this.clearTasksCache();
      
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw this.handleError(error);
    }
  }

  // Delete task
  async deleteTask(id) {
    try {
      const response = await apiClient.delete(`/task/${id}`);
      
      // Clear related caches
      this.clearCacheEntry(`task_${id}`);
      this.clearTasksCache();
      
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw this.handleError(error);
    }
  }

  // Assign user to task
  async assignUserToTask(taskId, userId) {
    try {
      const response = await apiClient.post(`/task/assign/${taskId}`, {
        user_id: userId
      });
      
      // Clear related caches
      this.clearCacheEntry(`task_${taskId}`);
      
      return response;
    } catch (error) {
      console.error('Error assigning user to task:', error);
      throw this.handleError(error);
    }
  }

  // Unassign user from task
  async unassignUserFromTask(taskId, userId) {
    try {
      const response = await apiClient.delete(`/task/${taskId}/unassign/${userId}`);
      
      // Clear related caches
      this.clearCacheEntry(`task_${taskId}`);
      
      return response;
    } catch (error) {
      console.error('Error unassigning user from task:', error);
      throw this.handleError(error);
    }
  }

  // Get task statistics
  async getTaskStats(projectId = null, forceRefresh = false) {
    try {
      const cacheKey = `task_stats_${projectId || 'all'}`;
      
      if (!forceRefresh) {
        const cachedData = this.getCache(cacheKey);
        if (cachedData) {
          return { ...cachedData, fromCache: true };
        }
      }

      const queryParams = projectId ? `?project_id=${projectId}` : '';
      const response = await apiClient.get(`/task/stats/v1${queryParams}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw this.handleError(error);
    }
  }

  // Helper method to clear tasks cache
  clearTasksCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('tasks_') || key.startsWith('task_stats_')) {
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
  invalidateTask(taskId) {
    this.clearCacheEntry(`task_${taskId}`);
  }

  invalidateAllTasks() {
    this.clearAllCache();
  }

  // Prefetch task for better UX
  async prefetchTask(taskId) {
    try {
      await this.getTask(taskId);
    } catch (error) {
      console.warn('Failed to prefetch task:', error);
    }
  }

  // Batch operations
  async batchUpdateTasks(updates) {
    const results = [];
    for (const update of updates) {
      try {
        const result = await this.updateTask(update.id, update.data, update.attachments);
        results.push({ success: true, data: result, id: update.id });
      } catch (error) {
        results.push({ success: false, error, id: update.id });
      }
    }
    return results;
  }
}

// Create singleton instance
const taskService = new TaskService();

export default taskService;