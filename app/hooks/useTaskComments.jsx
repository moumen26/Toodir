import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo, useCallback, useState } from "react";
import taskCommentService from "../services/taskCommentService";

// Query keys factory
export const commentKeys = {
  all: ["comments"],
  lists: () => [...commentKeys.all, "list"],
  list: (taskId, filters) => [...commentKeys.lists(), taskId, filters],
  details: () => [...commentKeys.all, "detail"],
  detail: (id) => [...commentKeys.details(), id],
  stats: (taskId) => [...commentKeys.all, "stats", taskId],
  replies: (commentId) => [...commentKeys.all, "replies", commentId],
  byTask: (taskId) => [...commentKeys.all, "task", taskId],
};

// Hook for fetching comments by task
export const useTaskComments = (taskId, params = {}) => {
  const query = useQuery({
    queryKey: commentKeys.byTask(taskId),
    queryFn: () => taskCommentService.getCommentsByTask(taskId, params),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    keepPreviousData: true,
  });

  const comments = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    comments,
    pagination,
  };
};

// Hook for infinite scrolling comments
export const useInfiniteTaskComments = (taskId, params = {}) => {
  return useInfiniteQuery({
    queryKey: [...commentKeys.lists(), "infinite", taskId, params],
    queryFn: ({ pageParam = 1 }) =>
      taskCommentService.getCommentsByTask(taskId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination || {};
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook for fetching a single comment
export const useComment = (commentId, options = {}) => {
  const { enabled = true, refetchOnMount = false } = options;

  const query = useQuery({
    queryKey: commentKeys.detail(commentId),
    queryFn: () => taskCommentService.getComment(commentId),
    enabled: enabled && !!commentId,
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnMount,
  });

  const comment = useMemo(() => query.data?.data || null, [query.data]);

  return {
    ...query,
    comment,
  };
};

// Hook for comment statistics
export const useCommentStats = (taskId, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: commentKeys.stats(taskId),
    queryFn: () => taskCommentService.getCommentStats(taskId),
    enabled: enabled && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    cacheTime: 5 * 60 * 1000,
    retry: 1,
  });

  const stats = useMemo(() => query.data?.data || null, [query.data]);

  return {
    ...query,
    stats,
  };
};

// Hook for creating a comment with optimistic updates
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const [optimisticComments, setOptimisticComments] = useState(new Map());

  return useMutation({
    mutationFn: ({ taskId, commentData }) =>
      taskCommentService.createComment(taskId, commentData),
    onMutate: async ({ taskId, commentData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: commentKeys.byTask(taskId),
      });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(commentKeys.byTask(taskId));

      // Create optimistic comment
      const optimisticComment = {
        id: `temp_${Date.now()}`,
        content: commentData.content,
        task_id: taskId,
        author: {
          id: 'current_user',
          full_name: 'You',
          email: ''
        },
        created_at: new Date().toISOString(),
        replies: [],
        isOptimistic: true
      };

      // Add to optimistic state
      setOptimisticComments(prev => new Map(prev).set(optimisticComment.id, optimisticComment));

      // Optimistically update cache
      if (previousComments) {
        queryClient.setQueryData(commentKeys.byTask(taskId), {
          ...previousComments,
          data: [optimisticComment, ...previousComments.data]
        });
      }

      return { previousComments, optimisticComment };
    },
    onError: (err, { taskId }, context) => {
      // Remove optimistic comment
      if (context?.optimisticComment) {
        setOptimisticComments(prev => {
          const newMap = new Map(prev);
          newMap.delete(context.optimisticComment.id);
          return newMap;
        });
      }

      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(commentKeys.byTask(taskId), context.previousComments);
      }
    },
    onSuccess: (data, { taskId }, context) => {
      // Remove optimistic comment
      if (context?.optimisticComment) {
        setOptimisticComments(prev => {
          const newMap = new Map(prev);
          newMap.delete(context.optimisticComment.id);
          return newMap;
        });
      }

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.stats(taskId) });
    },
  });
};

// Hook for updating a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, commentData }) =>
      taskCommentService.updateComment(commentId, commentData),
    onMutate: async ({ commentId, commentData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: commentKeys.detail(commentId),
      });

      // Snapshot the previous value
      const previousComment = queryClient.getQueryData(commentKeys.detail(commentId));

      // Optimistically update
      if (previousComment) {
        queryClient.setQueryData(commentKeys.detail(commentId), {
          ...previousComment,
          data: { ...previousComment.data, ...commentData, updated_at: new Date().toISOString() },
        });
      }

      return { previousComment };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComment) {
        queryClient.setQueryData(
          commentKeys.detail(variables.commentId),
          context.previousComment
        );
      }
    },
    onSuccess: (data, { commentId }) => {
      // Update the comment in cache
      queryClient.setQueryData(commentKeys.detail(commentId), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
};

// Hook for deleting a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) => taskCommentService.deleteComment(commentId),
    onMutate: async (commentId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: commentKeys.detail(commentId),
      });

      // Snapshot the previous values
      const previousComment = queryClient.getQueryData(commentKeys.detail(commentId));
      const previousCommentLists = queryClient.getQueriesData({
        queryKey: commentKeys.lists(),
      });

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: commentKeys.detail(commentId) });

      return { previousComment, previousCommentLists };
    },
    onError: (err, commentId, context) => {
      // Rollback on error
      if (context?.previousComment) {
        queryClient.setQueryData(commentKeys.detail(commentId), context.previousComment);
      }

      context?.previousCommentLists.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSuccess: (data, commentId) => {
      // Ensure removal from cache
      queryClient.removeQueries({ queryKey: commentKeys.detail(commentId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
};

// Hook for comment replies
export const useCommentReplies = (commentId, params = {}) => {
  const query = useQuery({
    queryKey: commentKeys.replies(commentId),
    queryFn: () => taskCommentService.getCommentReplies(commentId, params),
    enabled: !!commentId,
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
  });

  const replies = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    replies,
    pagination,
  };
};

// Hook for managing comment threading
export const useCommentThreading = (comments) => {
  const threadedComments = useMemo(() => {
    if (!comments || !Array.isArray(comments)) return [];

    // Organize comments into threads
    const threaded = comments.map(comment => ({
      ...comment,
      replies: comment.replies || [],
      isExpanded: false,
    }));

    return threaded;
  }, [comments]);

  const [expandedComments, setExpandedComments] = useState(new Set());

  const toggleCommentExpansion = useCallback((commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const isCommentExpanded = useCallback((commentId) => {
    return expandedComments.has(commentId);
  }, [expandedComments]);

  return {
    threadedComments,
    expandedComments,
    toggleCommentExpansion,
    isCommentExpanded,
  };
};

// Hook for comment form state management
export const useCommentForm = (onSubmit) => {
  const [formState, setFormState] = useState({
    content: '',
    isSubmitting: false,
    error: null,
    replyingTo: null,
  });

  const updateContent = useCallback((content) => {
    setFormState(prev => ({ ...prev, content, error: null }));
  }, []);

  const setReplyingTo = useCallback((comment) => {
    setFormState(prev => ({ 
      ...prev, 
      replyingTo: comment,
      content: comment ? `@${comment.author.full_name} ` : ''
    }));
  }, []);

  const clearReply = useCallback(() => {
    setFormState(prev => ({ ...prev, replyingTo: null, content: '' }));
  }, []);

  const submitComment = useCallback(async (taskId) => {
    if (!formState.content.trim()) {
      setFormState(prev => ({ ...prev, error: 'Comment cannot be empty' }));
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const commentData = {
        content: formState.content.trim(),
        parent_comment_id: formState.replyingTo?.id || null,
      };

      await onSubmit(taskId, commentData);

      // Reset form
      setFormState(prev => ({
        ...prev,
        content: '',
        isSubmitting: false,
        replyingTo: null,
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message || 'Failed to submit comment',
      }));
    }
  }, [formState.content, formState.replyingTo, onSubmit]);

  return {
    formState,
    updateContent,
    setReplyingTo,
    clearReply,
    submitComment,
  };
};

// Hook for comment reactions/likes (if implemented later)
export const useCommentReactions = () => {
  const [reactions, setReactions] = useState(new Map());

  const toggleLike = useCallback((commentId) => {
    setReactions(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(commentId) || { liked: false, count: 0 };
      newMap.set(commentId, {
        liked: !current.liked,
        count: current.liked ? current.count - 1 : current.count + 1,
      });
      return newMap;
    });
  }, []);

  const getReaction = useCallback((commentId) => {
    return reactions.get(commentId) || { liked: false, count: 0 };
  }, [reactions]);

  return {
    toggleLike,
    getReaction,
  };
};