// hooks/useFriendsTagsQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import friendsService from '../services/friendsService';

// Query keys
export const friendsKeys = {
  all: ['friends'],
  lists: () => [...friendsKeys.all, 'list'],
  list: (filters) => [...friendsKeys.lists(), filters],
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

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: friendsService.sendFriendRequest,
    onSuccess: () => {
      // Invalidate friends lists to refresh data
      queryClient.invalidateQueries({ queryKey: friendsKeys.lists() });
    },
    onError: (error) => {
      console.error('Send friend request error:', error);
    },
  });
};