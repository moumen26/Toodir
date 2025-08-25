// services/projectService.js - Updated with enhanced update functionality
import { apiClient } from './authService';

const projectService = {
  // Get projects with filtering and pagination
  getProjects: async (params = {}) => {
    const response = await apiClient.get(`/project`, { params });
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
      console.log('Project creation error details:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
      // Validate project ID
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const formData = new FormData();

      // Add text fields to form data
      const textFields = ['title', 'description', 'priority', 'start_date', 'end_date'];
      textFields.forEach(field => {
        if (projectData[field] !== undefined && projectData[field] !== null) {
          formData.append(field, projectData[field]);
        }
      });

      // Handle tags - send as JSON string if present
      if (projectData.tags !== undefined) {
        if (Array.isArray(projectData.tags) && projectData.tags.length > 0) {
          formData.append('tags', JSON.stringify(projectData.tags));
        } else {
          // Send empty array to clear tags
          formData.append('tags', JSON.stringify([]));
        }
      }

      // Handle image files if present
      if (projectData.images && Array.isArray(projectData.images) && projectData.images.length > 0) {
        projectData.images.forEach((image, index) => {
          // Validate image object
          if (!image.uri) {
            console.warn(`Image at index ${index} missing URI, skipping`);
            return;
          }

          const fileObj = {
            uri: image.uri,
            type: image.type || image.mimeType || 'image/jpeg',
            name: image.name || image.fileName || `image_${index}_${Date.now()}.jpg`,
          };

          formData.append('images', fileObj);
        });
      }

      const response = await apiClient.patch(`/project/${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 45000,
        retry: 2,
        retryDelay: 1000,
      });

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        const errorMessage = serverError?.message || 
                           serverError?.error || 
                           `Server error: ${error.response.status}`;
        
        // Handle specific validation errors
        if (error.response.status === 422 && serverError?.errors) {
          const validationErrors = Object.values(serverError.errors).flat();
          throw new Error(validationErrors.join(', '));
        }
        
        // Handle file upload errors
        if (error.response.status === 413) {
          throw new Error('Files are too large. Please reduce image sizes.');
        }
        
        if (error.response.status === 415) {
          throw new Error('Unsupported file type. Please use JPEG, PNG, or GIF images.');
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Something else went wrong
        console.log('Project update error:', error);
        throw new Error(error.message || 'Failed to update project');
      }
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
        timeout: 30000,
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

  // Validate project data before sending
  validateProjectData: (projectData) => {
    const errors = {};

    if (!projectData.title || projectData.title.trim().length === 0) {
      errors.title = 'Project title is required';
    } else if (projectData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (projectData.title.length > 255) {
      errors.title = 'Title must not exceed 255 characters';
    }

    if (projectData.description && projectData.description.length > 5000) {
      errors.description = 'Description must not exceed 5000 characters';
    }

    if (projectData.start_date && projectData.end_date) {
      const startDate = new Date(projectData.start_date);
      const endDate = new Date(projectData.end_date);
      
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (projectData.priority && !validPriorities.includes(projectData.priority)) {
      errors.priority = 'Invalid priority level';
    }

    // Validate images
    if (projectData.images && Array.isArray(projectData.images)) {
      if (projectData.images.length > 5) {
        errors.images = 'Maximum 5 images allowed';
      }
      
      // Check each image
      projectData.images.forEach((image, index) => {
        if (!image.uri) {
          errors.images = errors.images || [];
          errors.images.push(`Image ${index + 1} is missing`);
        }
        
        // Check file size if available (5MB limit)
        if (image.fileSize && image.fileSize > 5 * 1024 * 1024) {
          errors.images = errors.images || [];
          errors.images.push(`Image ${index + 1} is too large (max 5MB)`);
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Helper method to prepare update payload
  prepareUpdatePayload: (formData, originalProject) => {
    const payload = {};
    
    // Only include changed fields
    const fieldsToCheck = ['title', 'description', 'priority', 'start_date', 'end_date'];
    
    fieldsToCheck.forEach(field => {
      if (formData[field] !== originalProject[field]) {
        payload[field] = formData[field];
      }
    });

    // Handle tags separately (always include if provided)
    if (formData.tags !== undefined) {
      const originalTagIds = (originalProject.tags || []).map(tag => tag.id).sort();
      const newTagIds = (formData.tags || []).map(tag => tag.id).sort();
      
      // Compare tag arrays
      if (JSON.stringify(originalTagIds) !== JSON.stringify(newTagIds)) {
        payload.tags = formData.tags.map(tag => tag.id);
      }
    }

    // Handle images (always include new images)
    if (formData.images && formData.images.length > 0) {
      payload.images = formData.images;
    }

    return payload;
  }
};

export default projectService;