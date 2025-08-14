// hooks/useFriendsQueries.js - Updated with additional hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import friendsService from '../services/friendsService';

// Query keys
export const friendsKeys = {
  all: ['friends'],
  lists: () => [...friendsKeys.all, 'list'],
  list: (filters) => [...friendsKeys.lists(), filters],
  invitations: () => [...friendsKeys.all, 'invitations'],
  receivedInvitations: (filters) => [...friendsKeys.invitations(), 'received', filters],
  sentInvitations: (filters) => [...friendsKeys.invitations(), 'sent', filters],
};

// Friends hooks
export const useFriends = (filters = {}) => {
  return useQuery({
    queryKey: friendsKeys.list(filters),
    queryFn: () => friendsService.getFriends(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchUsers = (query, options = {}) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => friendsService.searchUsers({ query, limit: 20 }),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Friend request mutations
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsService.sendFriendRequest,
    onSuccess: () => {
      // Invalidate friends lists to refresh data
      queryClient.invalidateQueries({ queryKey: friendsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: friendsKeys.invitations() });
    },
    onError: (error) => {
      console.log('Send friend request error:', error);
    },
  });
};

// Friend invitation hooks
export const useReceivedFriendRequests = (filters = {}) => {
  return useQuery({
    queryKey: friendsKeys.receivedInvitations(filters),
    queryFn: () => friendsService.getReceivedFriendRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSentFriendRequests = (filters = {}) => {
  return useQuery({
    queryKey: friendsKeys.sentInvitations(filters),
    queryFn: () => friendsService.getSentFriendRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action }) => 
      friendsService.respondToFriendRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.invitations() });
      queryClient.invalidateQueries({ queryKey: friendsKeys.lists() });
    },
    onError: (error) => {
      console.log('Respond to friend request error:', error);
    },
  });
};

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsService.cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.invitations() });
    },
    onError: (error) => {
      console.log('Cancel friend request error:', error);
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsService.removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.lists() });
    },
    onError: (error) => {
      console.log('Remove friend error:', error);
    },
  });
};