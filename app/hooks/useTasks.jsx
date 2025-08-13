// hooks/useTasks.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import taskService from "../services/taskService";
import { useDebounce } from "../util/performance";

// Query keys factory
export const taskKeys = {
  all: ["tasks"],
  lists: () => [...taskKeys.all, "list"],
  list: (filters) => [...taskKeys.lists(), filters],
  details: () => [...taskKeys.all, "detail"],
  detail: (id) => [...taskKeys.details(), id],
  stats: (projectId) => [...taskKeys.all, "stats", projectId],
  search: (query) => [...taskKeys.all, "search", query],
  byProject: (projectId) => [...taskKeys.all, "project", projectId],
  byUser: () => [...taskKeys.all, "user"],
};

// Hook for fetching tasks by project
export const useTasksByProject = (projectId, params = {}) => {
  const query = useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => taskService.getTasksByProject(projectId, params),
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    keepPreviousData: true,
  });

  const tasks = useMemo(() => query.data?.data || [], [query.data]);

  return {
    ...query,
    tasks,
  };
};

// Hook for fetching user's tasks
export const useTasksByUser = (params = {}) => {
  const query = useQuery({
    queryKey: taskKeys.byUser(),
    queryFn: () => taskService.getTasksByUser(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    keepPreviousData: true,
  });

  const tasks = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    tasks,
    pagination,
  };
};

// Hook for infinite scrolling tasks
export const useInfiniteTasks = (params = {}) => {
  return useInfiniteQuery({
    queryKey: [...taskKeys.lists(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      taskService.getTasksByUser({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination || {};
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for fetching a single task
export const useTask = (taskId, options = {}) => {
  const { enabled = true, refetchOnMount = false } = options;

  const query = useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(taskId),
    enabled: enabled && !!taskId,
    staleTime: 3 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnMount,
  });

  const task = useMemo(() => query.data?.data || null, [query.data]);

  return {
    ...query,
    task,
  };
};

// Hook for task statistics
export const useTaskStats = (projectId = null, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: taskKeys.stats(projectId),
    queryFn: () => taskService.getTaskStats(projectId),
    enabled: enabled,
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

// Hook for creating a task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskData, attachments }) =>
      await taskService.createTask(taskData, attachments),
    onSuccess: (data, variables) => {
      // Invalidate and refetch task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.byUser() });
      
      // If task belongs to a project, invalidate project tasks
      if (variables.taskData.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: taskKeys.byProject(variables.taskData.project_id) 
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
    },
  });
};

// Hook for updating a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, taskData, attachments }) =>
      taskService.updateTask(taskId, taskData, attachments),
    onMutate: async ({ taskId, taskData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: taskKeys.detail(taskId),
      });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(taskId));

      // Optimistically update
      if (previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), {
          ...previousTask,
          data: { ...previousTask.data, ...taskData },
        });
      }

      return { previousTask };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(
          taskKeys.detail(variables.taskId),
          context.previousTask
        );
      }
    },
    onSuccess: (data, { taskId, taskData }) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(taskId), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.byUser() });
      
      // If task belongs to a project, invalidate project tasks
      if (taskData.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: taskKeys.byProject(taskData.project_id) 
        });
      }

      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};

// Hook for deleting a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onMutate: async (taskId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: taskKeys.detail(taskId),
      });

      // Snapshot the previous values
      const previousTask = queryClient.getQueryData(taskKeys.detail(taskId));
      const previousUserTasks = queryClient.getQueriesData({
        queryKey: taskKeys.byUser(),
      });

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });

      return { previousTask, previousUserTasks };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask);
      }

      context?.previousUserTasks.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSuccess: (data, taskId) => {
      // Ensure removal from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.byUser() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};

// Hook for assigning user to task
export const useAssignUserToTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }) =>
      taskService.assignUserToTask(taskId, userId),
    onSuccess: (data, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.byUser() });
    },
  });
};

// Hook for unassigning user from task
export const useUnassignUserFromTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }) =>
      taskService.unassignUserFromTask(taskId, userId),
    onSuccess: (data, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.byUser() });
    },
  });
};

// Hook for task search with debouncing
export const useTaskSearch = (searchQuery, delay = 300) => {
  const debouncedQuery = useDebounce(searchQuery, delay);

  return useQuery({
    queryKey: taskKeys.search(debouncedQuery),
    queryFn: () => taskService.getTasksByUser({ search: debouncedQuery }),
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook for prefetching tasks
export const usePrefetchTask = () => {
  const queryClient = useQueryClient();

  const prefetchTask = useCallback(
    (taskId) => {
      queryClient.prefetchQuery({
        queryKey: taskKeys.detail(taskId),
        queryFn: () => taskService.getTask(taskId),
        staleTime: 3 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return prefetchTask;
};

// Hook for batch operations
export const useBatchTaskOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdate = useMutation({
    mutationFn: (updates) => taskService.batchUpdateTasks(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });

  return {
    batchUpdate,
  };
};

// Hook for optimistic updates
export const useOptimisticTaskUpdate = () => {
  const queryClient = useQueryClient();

  const updateTask = useCallback(
    (taskId, updater) => {
      queryClient.setQueryData(taskKeys.detail(taskId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: typeof updater === "function" ? updater(oldData.data) : updater,
        };
      });
    },
    [queryClient]
  );

  return updateTask;
};

// Hook for task filtering and sorting
export const useTaskFilters = (tasks, filters = {}) => {
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    let filtered = [...tasks];

    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter(task => task.project_id === filters.projectId);
    }

    // Filter by assigned user
    if (filters.assignedUserId) {
      filtered = filtered.filter(task => 
        task.assignedUsers && task.assignedUsers.some(user => user.id === filters.assignedUserId)
      );
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.project && task.project.title && task.project.title.toLowerCase().includes(searchLower))
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(task => 
        new Date(task.start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(task => 
        new Date(task.end_date) <= new Date(filters.endDate)
      );
    }

    // Sort tasks
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const direction = filters.sortDirection === 'desc' ? -1 : 1;
        
        switch (filters.sortBy) {
          case 'title':
            return direction * a.title.localeCompare(b.title);
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return direction * (priorityOrder[a.priority] - priorityOrder[b.priority]);
          case 'start_date':
            return direction * (new Date(a.start_date) - new Date(b.start_date));
          case 'end_date':
            return direction * (new Date(a.end_date) - new Date(b.end_date));
          case 'created_at':
            return direction * (new Date(a.created_at) - new Date(b.created_at));
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [tasks, filters]);

  const taskStats = useMemo(() => {
    if (!filteredTasks.length) return {};

    const stats = {
      total: filteredTasks.length,
      byStatus: {},
      byPriority: {},
      overdue: 0,
      upcoming: 0,
    };

    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7); // Next 7 days

    filteredTasks.forEach(task => {
      // Count by status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      
      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      
      // Count overdue
      if (new Date(task.end_date) < now) {
        stats.overdue++;
      }
      
      // Count upcoming
      if (new Date(task.start_date) <= upcoming && new Date(task.start_date) >= now) {
        stats.upcoming++;
      }
    });

    return stats;
  }, [filteredTasks]);

  return {
    filteredTasks,
    taskStats,
  };
};