import { apiClient } from './authService';

const tagsService = {
  // Get user's tags
  getTags: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await apiClient.get(`/tag?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new tag
  createTag: async (tagData) => {
    try {
      const response = await apiClient.post('/tag/create', tagData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update tag
  updateTag: async (tagId, tagData) => {
    try {
      const response = await apiClient.patch(`/tag/${tagId}`, tagData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete tag
  deleteTag: async (tagId) => {
    try {
      const response = await apiClient.delete(`/tag/${tagId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default tagsService;