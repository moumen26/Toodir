import { apiClient } from './authService';

const taskService = {
  // Get tasks with filters and pagination
  getTasks: async (params = {}) => {
    const response = await apiClient.get('/task/user', { params });
    return response;
  },

  // Get single task by ID
  getTask: async (taskId) => {
    const response = await apiClient.get(`/task/${taskId}`);
    return response;
  },

  // Get tasks by project
  getTasksByProject: async (projectId) => {
    const response = await apiClient.get(`/task/project/${projectId}`);
    return response;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await apiClient.post('/task/create', taskData);
    return response;
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    const response = await apiClient.patch(`/task/${taskId}`, taskData);
    return response;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await apiClient.delete(`/task/${taskId}`);
    return response;
  },

  // Close/Complete task
  closeTask: async (taskId, data = { closed: true }) => {
    const response = await apiClient.patch(`/task/${taskId}/close`, data);
    return response;
  },

  // Assign user to task
  assignUserToTask: async (taskId, userId) => {
    const response = await apiClient.post(`/task/assign/${taskId}`, { user_id: userId });
    return response;
  },

  // Unassign user from task
  unassignUserFromTask: async (taskId, userId) => {
    const response = await apiClient.delete(`/task/${taskId}/unassign/${userId}`);
    return response;
  },

  // Get task statistics
  getTaskStats: async (params = {}) => {
    const response = await apiClient.get('/task/stats/v1', { params });
    return response;
  },

  // Task comments
  getTaskComments: async (taskId, params = {}) => {
    const response = await apiClient.get(`/task/${taskId}/comments`, { params });
    return response;
  },

  createTaskComment: async (taskId, commentData) => {
    const response = await apiClient.post(`/task/${taskId}/comments`, commentData);
    return response;
  },

  updateTaskComment: async (commentId, commentData) => {
    const response = await apiClient.patch(`/comments/${commentId}`, commentData);
    return response;
  },

  deleteTaskComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response;
  },

  getTaskCommentStats: async (taskId) => {
    const response = await apiClient.get(`/task/${taskId}/comments/stats`);
    return response;
  },
};

export default taskService;