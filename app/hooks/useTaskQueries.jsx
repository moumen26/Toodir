import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskService from '../services/taskService';

// Query keys
export const taskKeys = {
  all: ['tasks'],
  lists: () => [...taskKeys.all, 'list'],
  list: (filters) => [...taskKeys.lists(), filters],
  details: () => [...taskKeys.all, 'detail'],
  detail: (id) => [...taskKeys.details(), id],
  stats: () => [...taskKeys.all, 'stats'],
  projectTasks: (projectId) => [...taskKeys.all, 'project', projectId],
  comments: (taskId) => [...taskKeys.all, 'comments', taskId],
};

// Get tasks with infinite scroll
export const useInfiniteTasks = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      taskService.getTasks({ 
        ...filters, 
        page: pageParam, 
        limit: 10 
      }),
    getNextPageParam: (lastPage, allPages) => {
      const { pagination } = lastPage;
      if (pagination.current_page < pagination.total_pages) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Get single task
export const useTask = (taskId, options = {}) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(taskId),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get tasks by project
export const useProjectTasks = (projectId, options = {}) => {
  return useQuery({
    queryKey: taskKeys.projectTasks(projectId),
    queryFn: () => taskService.getTasksByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

// Get task statistics
export const useTaskStats = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...taskKeys.stats(), filters],
    queryFn: () => taskService.getTaskStats(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for stats
    cacheTime: 3 * 60 * 1000,
    ...options,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (data) => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
      
      // Add the new task to cache
      queryClient.setQueryData(taskKeys.detail(data.data.task_id), {
        success: true,
        data: data.data,
      });
    },
    onError: (error) => {
      console.log('Create task error:', error);
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, taskData }) => 
      taskService.updateTask(taskId, taskData),
    onSuccess: (data, variables) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(variables.taskId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate tasks list and stats to reflect changes
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
    onError: (error) => {
      console.log('Update task error:', error);
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (data, taskId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidate tasks list and stats
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
    onError: (error) => {
      console.log('Delete task error:', error);
    },
  });
};

// Close/Complete task mutation
export const useCloseTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, closed = true }) => 
      taskService.closeTask(taskId, { closed }),
    onSuccess: (data, variables) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(variables.taskId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate tasks list and stats to reflect changes
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
    onError: (error) => {
      console.log('Close task error:', error);
    },
  });
};

// Assign user to task mutation
export const useAssignUserToTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }) => 
      taskService.assignUserToTask(taskId, userId),
    onSuccess: (data, variables) => {
      // Invalidate task detail to refetch with new assignment
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.detail(variables.taskId) 
      });
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error) => {
      console.log('Assign user to task error:', error);
    },
  });
};

// Unassign user from task mutation
export const useUnassignUserFromTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }) => 
      taskService.unassignUserFromTask(taskId, userId),
    onSuccess: (data, variables) => {
      // Invalidate task detail to refetch without assignment
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.detail(variables.taskId) 
      });
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error) => {
      console.log('Unassign user from task error:', error);
    },
  });
};

// Task comments hooks
export const useTaskComments = (taskId, options = {}) => {
  return useQuery({
    queryKey: taskKeys.comments(taskId),
    queryFn: () => taskService.getTaskComments(taskId),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content, parentCommentId }) => 
      taskService.createTaskComment(taskId, { content, parent_comment_id: parentCommentId }),
    onSuccess: (data, variables) => {
      // Invalidate comments to refetch with new comment
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.comments(variables.taskId) 
      });
      
      // Also invalidate task detail as comment count might be displayed
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.detail(variables.taskId) 
      });
    },
    onError: (error) => {
      console.log('Create task comment error:', error);
    },
  });
};