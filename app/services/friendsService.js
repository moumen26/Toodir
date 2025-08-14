  // services/friendsService.js - Updated with additional methods
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

    // Get received friend requests
    getReceivedFriendRequests: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        const response = await apiClient.get(`/friend/requests/received?${queryParams.toString()}`);
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Get sent friend requests
    getSentFriendRequests: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        const response = await apiClient.get(`/friend/requests/sent?${queryParams.toString()}`);
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Respond to friend request (accept/decline)
    respondToFriendRequest: async (requestId, action) => {
      try {
        const response = await apiClient.patch(`/friend/requests/${requestId}/respond`, {
          action: action, // 'accept' or 'decline'
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Cancel sent friend request
    cancelFriendRequest: async (requestId) => {
      try {
        const response = await apiClient.delete(`/friend/requests/${requestId}`);
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Remove a friend
    removeFriend: async (friendId) => {
      try {
        const response = await apiClient.delete(`/friend/${friendId}`);
        return response;
      } catch (error) {
        throw error;
      }
    },
  };

  export default friendsService;