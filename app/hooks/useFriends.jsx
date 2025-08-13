// hooks/useFriends.js
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import friendService from "../services/FriendService";

// Query keys factory
export const friendKeys = {
  all: ["friends"],
  lists: () => [...friendKeys.all, "list"],
  list: (filters) => [...friendKeys.lists(), filters],
  requests: () => [...friendKeys.all, "requests"],
  requestsReceived: () => [...friendKeys.requests(), "received"],
  requestsSent: () => [...friendKeys.requests(), "sent"],
  search: (query) => [...friendKeys.all, "search", query],
};

// Hook for fetching friends list
export const useFriends = (params = {}) => {
  const query = useQuery({
    queryKey: friendKeys.list(params),
    queryFn: () => friendService.getFriends(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    keepPreviousData: true,
  });

  const friends = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    friends,
    pagination,
  };
};

// Hook for searching users
export const useUserSearch = (searchQuery, options = {}) => {
  const { enabled = true, delay = 300 } = options;
  const debouncedQuery = useDebounce(searchQuery, delay);

  return useQuery({
    queryKey: friendKeys.search(debouncedQuery),
    queryFn: () => friendService.searchUsers({ query: debouncedQuery }),
    enabled: enabled && !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook for sending friend requests
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addresseeId) => friendService.sendFriendRequest(addresseeId),
    onSuccess: () => {
      // Invalidate friend requests and search results
      queryClient.invalidateQueries({ queryKey: friendKeys.requestsSent() });
      queryClient.invalidateQueries({ queryKey: friendKeys.search() });
    },
    onError: (error) => {
      console.log("Error sending friend request:", error);
    },
  });
};

// Hook for getting received friend requests
export const useReceivedFriendRequests = (params = {}) => {
  const query = useQuery({
    queryKey: [...friendKeys.requestsReceived(), params],
    queryFn: () => friendService.getReceivedFriendRequests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,
    retry: 2,
  });

  const requests = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    requests,
    pagination,
  };
};

// Hook for getting sent friend requests
export const useSentFriendRequests = (params = {}) => {
  const query = useQuery({
    queryKey: [...friendKeys.requestsSent(), params],
    queryFn: () => friendService.getSentFriendRequests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,
    retry: 2,
  });

  const requests = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    requests,
    pagination,
  };
};

// Hook for responding to friend requests
export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action }) =>
      friendService.respondToFriendRequest(requestId, action),
    onSuccess: (data, { action }) => {
      // Invalidate friend requests
      queryClient.invalidateQueries({ queryKey: friendKeys.requestsReceived() });
      
      // If accepted, also invalidate friends list
      if (action === 'accept') {
        queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
      }
    },
    onError: (error) => {
      console.log("Error responding to friend request:", error);
    },
  });
};

// Hook for cancelling sent friend requests
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => friendService.cancelFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate sent requests
      queryClient.invalidateQueries({ queryKey: friendKeys.requestsSent() });
      queryClient.invalidateQueries({ queryKey: friendKeys.search() });
    },
    onError: (error) => {
      console.log("Error cancelling friend request:", error);
    },
  });
};

// Hook for removing friends
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId) => friendService.removeFriend(friendId),
    onMutate: async (friendId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: friendKeys.lists() });

      // Snapshot the previous values
      const previousFriends = queryClient.getQueriesData({
        queryKey: friendKeys.lists(),
      });

      // Optimistically remove from friends lists
      previousFriends.forEach(([queryKey, queryData]) => {
        if (queryData?.data) {
          const filteredFriends = queryData.data.filter(
            (friend) => friend.user.id !== friendId
          );
          queryClient.setQueryData(queryKey, {
            ...queryData,
            data: filteredFriends,
          });
        }
      });

      return { previousFriends };
    },
    onError: (err, friendId, context) => {
      // Rollback on error
      context?.previousFriends.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSuccess: () => {
      // Ensure removal from cache
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
    },
  });
};

// Hook for project member invitations
export const useProjectMemberInvitations = () => {
  const queryClient = useQueryClient();

  const inviteFriendToProject = useMutation({
    mutationFn: ({ friendId, projectId }) =>
      friendService.inviteFriendToProject(friendId, projectId),
    onSuccess: (data, { projectId }) => {
      // Invalidate project member queries
      queryClient.invalidateQueries({
        queryKey: ["project-members", "sent", projectId],
      });
    },
    onError: (error) => {
      console.log("Error inviting friend to project:", error);
    },
  });

  const getReceivedProjectInvitations = useQuery({
    queryKey: ["project-members", "received"],
    queryFn: () => friendService.getReceivedProjectInvitations(),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  const getSentProjectInvitations = (projectId) =>
    useQuery({
      queryKey: ["project-members", "sent", projectId],
      queryFn: () => friendService.getSentProjectInvitations({ project_id: projectId }),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    });

  const respondToProjectInvitation = useMutation({
    mutationFn: ({ invitationId, action }) =>
      friendService.respondToProjectInvitation(invitationId, action),
    onSuccess: (data, { action }) => {
      // Invalidate project invitations
      queryClient.invalidateQueries({
        queryKey: ["project-members", "received"],
      });
      
      // If accepted, also invalidate projects list
      if (action === 'accept') {
        queryClient.invalidateQueries({ queryKey: ["projects", "lists"] });
      }
    },
  });

  const cancelProjectInvitation = useMutation({
    mutationFn: (invitationId) => friendService.cancelProjectInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", "sent"],
      });
    },
  });

  return {
    inviteFriendToProject,
    getReceivedProjectInvitations,
    getSentProjectInvitations,
    respondToProjectInvitation,
    cancelProjectInvitation,
  };
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const { useEffect, useState } = require('react');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for friend statistics
export const useFriendStats = () => {
  return useQuery({
    queryKey: [...friendKeys.all, "stats"],
    queryFn: () => friendService.getFriendStats(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};