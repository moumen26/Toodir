// services/projectService.js
import { apiClient } from './authService';

const projectService = {
  // Get projects with filtering and pagination
  getProjects: async (params = {}) => {    
    const response = await apiClient.get(`/project`, {params});
    return response;
  },

  // Get single project by ID
  getProject: async (projectId) => {
    try {
      const response = await apiClient.get(`/project/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const formData = new FormData();
      
      // Add text fields first
      Object.keys(projectData).forEach(key => {
        if (key !== 'images' && key !== 'members' && key !== 'tags') {
          formData.append(key, projectData[key]);
        }
      });

      // Add arrays as JSON strings if they exist and have content
      if (projectData.members && projectData.members.length > 0) {
        formData.append('members', JSON.stringify(projectData.members));
      }
      if (projectData.tags && projectData.tags.length > 0) {
        formData.append('tags', JSON.stringify(projectData.tags));
      }

      // Add image files properly
      if (projectData.images && projectData.images.length > 0) {
        projectData.images.forEach((image, index) => {
          // Create proper file object for React Native
          const fileObj = {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `image_${index}.jpg`,
          };
          
          formData.append('images', fileObj);
        });
      }

      const response = await apiClient.post('/project/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for image uploads
      });
      
      return response;
    } catch (error) {
      console.error('Project creation error details:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(projectData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, projectData[key]);
        }
      });

      // Add image files if present
      if (projectData.images && projectData.images.length > 0) {
        projectData.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `image_${index}.jpg`,
          });
        });
      }

      const response = await apiClient.patch(`/project/${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await apiClient.delete(`/project/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async (projectId) => {
    try {
      const response = await apiClient.get(`/project/${projectId}/stats/v1`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Project image management
  addProjectImages: async (projectId, images) => {
    try {
      const formData = new FormData();
      
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${index}.jpg`,
        });
      });

      const response = await apiClient.post(`/project/${projectId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteProjectImage: async (projectId, imageId) => {
    try {
      const response = await apiClient.delete(`/project/${projectId}/images/${imageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  setPrimaryImage: async (projectId, imageId) => {
    try {
      const response = await apiClient.patch(`/project/${projectId}/images/${imageId}/primary`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default projectService;