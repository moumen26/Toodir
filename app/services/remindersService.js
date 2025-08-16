import { apiClient } from './authService';

const remindersService = {
  // Get user's reminders with pagination and filters
  getReminders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.tag_id) queryParams.append('tag_id', params.tag_id);
      if (params.reminder_type) queryParams.append('reminder_type', params.reminder_type);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.search) queryParams.append('search', params.search);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      
      const response = await apiClient.get(`/reminder?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming reminders
  getUpcomingReminders: async (hours = 24) => {
    try {
      const response = await apiClient.get(`/reminder/upcoming?hours=${hours}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get overdue reminders
  getOverdueReminders: async () => {
    try {
      const response = await apiClient.get('/reminder/overdue');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reminder by ID
  getReminderById: async (reminderId) => {
    try {
      const response = await apiClient.get(`/reminder/${reminderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await apiClient.post('/reminder/create', reminderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update reminder
  updateReminder: async (reminderId, reminderData) => {
    try {
      const response = await apiClient.patch(`/reminder/${reminderId}`, reminderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Snooze reminder
  snoozeReminder: async (reminderId, snoozeMinutes = 30) => {
    try {
      const response = await apiClient.patch(`/reminder/${reminderId}/snooze`, {
        snooze_minutes: snoozeMinutes
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Complete reminder
  completeReminder: async (reminderId) => {
    try {
      const response = await apiClient.patch(`/reminder/${reminderId}/complete`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete reminder
  deleteReminder: async (reminderId) => {
    try {
      const response = await apiClient.delete(`/reminder/${reminderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reminder statistics
  getReminderStats: async () => {
    try {
      const response = await apiClient.get('/reminder/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update reminders
  bulkUpdateReminders: async (reminderIds, action, data = {}) => {
    try {
      const response = await apiClient.patch('/reminder/bulk', {
        reminder_ids: reminderIds,
        action,
        data
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default remindersService;