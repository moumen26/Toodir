import { apiClient } from './authService';

const habitsService = {
  // Get user's habits with pagination
  getHabits: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
      
      const response = await apiClient.get(`/habit?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get habits for a specific date
  getHabitsForDate: async (date) => {
    try {
      const response = await apiClient.get(`/habit/date/${date}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get habit details with statistics
  getHabitDetails: async (habitId) => {
    try {
      const response = await apiClient.get(`/habit/${habitId}/details`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new habit
  createHabit: async (habitData) => {
    try {
      const response = await apiClient.post('/habit/create', habitData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update habit
  updateHabit: async (habitId, habitData) => {
    try {
      const response = await apiClient.patch(`/habit/${habitId}`, habitData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete habit
  deleteHabit: async (habitId) => {
    try {
      const response = await apiClient.delete(`/habit/${habitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark habit as done
  markHabitDone: async (habitId, data = {}) => {
    try {
      const response = await apiClient.post(`/habit/${habitId}/done`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark habit as skipped
  markHabitSkipped: async (habitId, data = {}) => {
    try {
      const response = await apiClient.post(`/habit/${habitId}/skip`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Undo habit action
  undoHabitAction: async (habitId, data = {}) => {
    try {
      const response = await apiClient.post(`/habit/${habitId}/undo`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get habit statistics
  getHabitStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      
      const response = await apiClient.get(`/habit/stats?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add tags to habit
  addTagsToHabit: async (habitId, tagIds) => {
    try {
      const response = await apiClient.post(`/habit-tag/${habitId}/tags`, { tagIds });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove tags from habit
  removeTagsFromHabit: async (habitId, tagIds) => {
    try {
      const response = await apiClient.delete(`/habit-tag/${habitId}/tags`, { 
        data: { tagIds } 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get habit tags
  getHabitTags: async (habitId) => {
    try {
      const response = await apiClient.get(`/habit-tag/${habitId}/tags`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get habits grouped by tags
  getHabitsGroupedByTags: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
      
      const response = await apiClient.get(`/habit-tag/grouped?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get tag usage statistics
  getTagUsageStats: async () => {
    try {
      const response = await apiClient.get('/habit-tag/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default habitsService;