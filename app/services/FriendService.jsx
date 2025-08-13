// services/friendService.js
import { apiClient } from './authService';

class FriendService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.CACHE_DURATION = 3 * 60 * 1000; // 3 minutes for friends data
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

  // Search for users to add as friends
  async searchUsers(params = {}) {
    try {
      const cacheKey = `user_search_${JSON.stringify(params)}`;
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

      const url = `/friend/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      // Cache search results for shorter time
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      throw this.handleError(error);
    }
  }

  // Send friend request
  async sendFriendRequest(addresseeId) {
    try {
      const response = await apiClient.post('/friend/request', {
        addressee_id: addresseeId
      });

      // Clear related caches
      this.clearFriendRequestsCache();
      this.clearUserSearchCache();
      
      return response;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw this.handleError(error);
    }
  }

  // Get received friend requests
  async getReceivedFriendRequests(params = {}) {
    try {
      const cacheKey = `received_requests_${JSON.stringify(params)}`;
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

      const url = `/friend/requests/received${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching received friend requests:', error);
      throw this.handleError(error);
    }
  }

  // Get sent friend requests
  async getSentFriendRequests(params = {}) {
    try {
      const cacheKey = `sent_requests_${JSON.stringify(params)}`;
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

      const url = `/friend/requests/sent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching sent friend requests:', error);
      throw this.handleError(error);
    }
  }

  // Respond to friend request (accept/decline)
  async respondToFriendRequest(requestId, action) {
    try {
      const response = await apiClient.patch(`/friend/requests/${requestId}/respond`, {
        action
      });

      // Clear related caches
      this.clearFriendRequestsCache();
      if (action === 'accept') {
        this.clearFriendsCache();
      }
      
      return response;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw this.handleError(error);
    }
  }

  // Cancel sent friend request
  async cancelFriendRequest(requestId) {
    try {
      const response = await apiClient.delete(`/friend/requests/${requestId}`);
      
      // Clear related caches
      this.clearFriendRequestsCache();
      this.clearUserSearchCache();
      
      return response;
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      throw this.handleError(error);
    }
  }

  // Get friends list
  async getFriends(params = {}) {
    try {
      const cacheKey = `friends_${JSON.stringify(params)}`;
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

      const url = `/friend${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw this.handleError(error);
    }
  }

  // Remove friend
  async removeFriend(friendId) {
    try {
      const response = await apiClient.delete(`/friend/${friendId}`);
      
      // Clear related caches
      this.clearFriendsCache();
      
      return response;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw this.handleError(error);
    }
  }

  // Project member invitation methods
  async inviteFriendToProject(friendId, projectId) {
    try {
      const response = await apiClient.post('/project-member/invite-friend', {
        friend_id: friendId,
        project_id: projectId
      });

      // Clear related caches
      this.clearProjectInvitationsCache();
      
      return response;
    } catch (error) {
      console.error('Error inviting friend to project:', error);
      throw this.handleError(error);
    }
  }

  // Get received project invitations
  async getReceivedProjectInvitations(params = {}) {
    try {
      const cacheKey = `received_project_invitations_${JSON.stringify(params)}`;
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

      const url = `/project-member/invitations/received${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching received project invitations:', error);
      throw this.handleError(error);
    }
  }

  // Get sent project invitations
  async getSentProjectInvitations(params = {}) {
    try {
      const cacheKey = `sent_project_invitations_${JSON.stringify(params)}`;
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

      const url = `/project-member/invitations/sent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching sent project invitations:', error);
      throw this.handleError(error);
    }
  }

  // Respond to project invitation
  async respondToProjectInvitation(invitationId, action) {
    try {
      const response = await apiClient.patch(`/project-member/invitations/${invitationId}/respond`, {
        action
      });

      // Clear related caches
      this.clearProjectInvitationsCache();
      
      return response;
    } catch (error) {
      console.error('Error responding to project invitation:', error);
      throw this.handleError(error);
    }
  }

  // Cancel project invitation
  async cancelProjectInvitation(invitationId) {
    try {
      const response = await apiClient.delete(`/project-member/invitations/${invitationId}`);
      
      // Clear related caches
      this.clearProjectInvitationsCache();
      
      return response;
    } catch (error) {
      console.error('Error cancelling project invitation:', error);
      throw this.handleError(error);
    }
  }

  // Get friend statistics
  async getFriendStats() {
    try {
      const cacheKey = 'friend_stats';
      const cachedData = this.getCache(cacheKey);
      
      if (cachedData) {
        return { ...cachedData, fromCache: true };
      }

      // This would be a custom endpoint for friend statistics
      const response = await apiClient.get('/friend/stats');
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error fetching friend statistics:', error);
      throw this.handleError(error);
    }
  }

  // Helper methods to clear specific caches
  clearFriendsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('friends_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.clearCacheEntry(key));
  }

  clearFriendRequestsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('received_requests_') || key.startsWith('sent_requests_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.clearCacheEntry(key));
  }

  clearUserSearchCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('user_search_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.clearCacheEntry(key));
  }

  clearProjectInvitationsCache() {
    const keysToDelete = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('received_project_invitations_') || key.startsWith('sent_project_invitations_')) {
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
  invalidateAllFriendData() {
    this.clearAllCache();
  }

  // Prefetch for better UX
  async prefetchFriends() {
    try {
      await this.getFriends();
    } catch (error) {
      console.warn('Failed to prefetch friends:', error);
    }
  }

  async prefetchFriendRequests() {
    try {
      await Promise.all([
        this.getReceivedFriendRequests(),
        this.getSentFriendRequests()
      ]);
    } catch (error) {
      console.warn('Failed to prefetch friend requests:', error);
    }
  }
}

// Create singleton instance
const friendService = new FriendService();

export default friendService;