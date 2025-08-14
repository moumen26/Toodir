import { apiClient } from './authService';

const friendsService = {
  // Get user's friends list
  getFriends: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await apiClient.get(`/friend?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search users to add as friends
  searchUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await apiClient.get(`/friend/search?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send friend request
  sendFriendRequest: async (addresseeId) => {
    try {
      const response = await apiClient.post('/friend/request', {
        addressee_id: addresseeId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default friendsService;