// hooks/useProjectInvitations.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectMemberService from '../services/projectMemberService';

// Query keys
export const projectInvitationKeys = {
  all: ['projectInvitations'],
  received: (filters) => [...projectInvitationKeys.all, 'received', filters],
  sent: (filters) => [...projectInvitationKeys.all, 'sent', filters],
};

// Get received project invitations
export const useReceivedProjectInvitations = (filters = {}) => {
  return useQuery({
    queryKey: projectInvitationKeys.received(filters),
    queryFn: () => projectMemberService.getReceivedInvitations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get sent project invitations
export const useSentProjectInvitations = (filters = {}) => {
  return useQuery({
    queryKey: projectInvitationKeys.sent(filters),
    queryFn: () => projectMemberService.getSentInvitations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Respond to project invitation
export const useRespondToProjectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, action }) => 
      projectMemberService.respondToInvitation(invitationId, action),
    onSuccess: (data, variables) => {
      // Invalidate invitation queries
      queryClient.invalidateQueries({ queryKey: projectInvitationKeys.all });
      
      // Invalidate projects query to refresh project list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // If accepted, invalidate project details
      if (variables.action === 'accept') {
        queryClient.invalidateQueries({ queryKey: ['project'] });
      }
    },
    onError: (error) => {
      console.error('Respond to project invitation error:', error);
    },
  });
};

// Cancel project invitation
export const useCancelProjectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => 
      projectMemberService.cancelInvitation(invitationId),
    onSuccess: () => {
      // Invalidate invitation queries
      queryClient.invalidateQueries({ queryKey: projectInvitationKeys.all });
    },
    onError: (error) => {
      console.error('Cancel project invitation error:', error);
    },
  });
};

// Get invitation counts for badges
export const useProjectInvitationCounts = () => {
  const { data: receivedData } = useReceivedProjectInvitations({ limit: 1 });
  const { data: sentData } = useSentProjectInvitations({ limit: 1 });

  return {
    receivedCount: receivedData?.pagination?.total_items || 0,
    sentCount: sentData?.pagination?.total_items || 0,
    totalCount: (receivedData?.pagination?.total_items || 0) + (sentData?.pagination?.total_items || 0),
  };
};