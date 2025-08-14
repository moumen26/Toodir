// services/projectMemberService.js - Updated with proper member removal
import { apiClient } from './authService';

const projectMemberService = {
  // Invite friend to project
  inviteFriendToProject: async ({ friend_id, project_id }) => {
    try {
      const response = await apiClient.post('/project-member/invite-friend', {
        friend_id,
        project_id,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get received project invitations
  getReceivedInvitations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      
      const response = await apiClient.get(`/project-member/invitations/received?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get sent project invitations
  getSentInvitations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.project_id) queryParams.append('project_id', params.project_id);
      
      const response = await apiClient.get(`/project-member/invitations/sent?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Respond to project invitation (accept/decline)
  respondToInvitation: async (invitationId, action) => {
    try {
      const response = await apiClient.patch(`/project-member/invitations/${invitationId}/respond`, {
        action: action, // 'accept' or 'decline'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel sent project invitation
  cancelInvitation: async (invitationId) => {
    try {
      const response = await apiClient.delete(`/project-member/invitations/${invitationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove project member 
  removeProjectMember: async (memberID, projectId) => {
    try {
      const response = await apiClient.delete(`/project-member`, {
        data: {
          user_id: memberID,
          project_id: projectId
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default projectMemberService;