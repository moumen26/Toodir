import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import habitsService from '../services/habitsService';

// Query keys for habits
export const habitsKeys = {
  all: ['habits'],
  lists: () => [...habitsKeys.all, 'list'],
  list: (filters) => [...habitsKeys.lists(), filters],
  details: () => [...habitsKeys.all, 'detail'],
  detail: (id) => [...habitsKeys.details(), id],
  stats: () => [...habitsKeys.all, 'stats'],
  forDate: (date) => [...habitsKeys.all, 'date', date],
  tags: () => [...habitsKeys.all, 'tags'],
  grouped: () => [...habitsKeys.all, 'grouped'],
};

// Get habits with infinite scroll
export const useInfiniteHabits = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: habitsKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      habitsService.getHabits({ ...filters, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data || {};
      if (pagination && pagination.current_page < pagination.total_pages) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get habits for a specific date
export const useHabitsForDate = (date) => {
  return useQuery({
    queryKey: habitsKeys.forDate(date),
    queryFn: () => habitsService.getHabitsForDate(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes for today's data
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get habit details
export const useHabitDetails = (habitId) => {
  return useQuery({
    queryKey: habitsKeys.detail(habitId),
    queryFn: () => habitsService.getHabitDetails(habitId),
    enabled: !!habitId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get habit statistics
export const useHabitStats = (period = 'week') => {
  return useQuery({
    queryKey: [...habitsKeys.stats(), period],
    queryFn: () => habitsService.getHabitStats({ period }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get habits grouped by tags
export const useHabitsGroupedByTags = (filters = {}) => {
  return useQuery({
    queryKey: [...habitsKeys.grouped(), filters],
    queryFn: () => habitsService.getHabitsGroupedByTags(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Create habit mutation
export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsService.createHabit,
    onSuccess: (data) => {
      // Invalidate and refetch habits lists
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.grouped() });
      
      // Invalidate today's habits
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(today) });
    },
    onError: (error) => {
      console.log('Create habit error:', error);
    },
  });
};

// Update habit mutation
export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, habitData }) => habitsService.updateHabit(habitId, habitData),
    onSuccess: (data, variables) => {
      // Update habit detail in cache
      queryClient.setQueryData(habitsKeys.detail(variables.habitId), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.grouped() });
      
      // Invalidate date-based queries
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(today) });
    },
    onError: (error) => {
      console.log('Update habit error:', error);
    },
  });
};

// Delete habit mutation
export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsService.deleteHabit,
    onSuccess: (data, habitId) => {
      // Remove habit from cache
      queryClient.removeQueries({ queryKey: habitsKeys.detail(habitId) });
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.grouped() });
      
      // Invalidate today's habits
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(today) });
    },
    onError: (error) => {
      console.log('Delete habit error:', error);
    },
  });
};

// Mark habit as done mutation
export const useMarkHabitDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, data }) => habitsService.markHabitDone(habitId, data),
    onSuccess: (data, variables) => {
      const date = variables.data?.date || new Date().toISOString().split('T')[0];
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(date) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
    },
    onError: (error) => {
      console.log('Mark habit done error:', error);
    },
  });
};

// Mark habit as skipped mutation
export const useMarkHabitSkipped = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, data }) => habitsService.markHabitSkipped(habitId, data),
    onSuccess: (data, variables) => {
      const date = variables.data?.date || new Date().toISOString().split('T')[0];
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(date) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
    },
    onError: (error) => {
      console.log('Mark habit skipped error:', error);
    },
  });
};

// Undo habit action mutation
export const useUndoHabitAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, data }) => habitsService.undoHabitAction(habitId, data),
    onSuccess: (data, variables) => {
      const date = variables.data?.date || new Date().toISOString().split('T')[0];
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.forDate(date) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
    },
    onError: (error) => {
      console.log('Undo habit action error:', error);
    },
  });
};

// Add tags to habit mutation
export const useAddTagsToHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, tagIds }) => habitsService.addTagsToHabit(habitId, tagIds),
    onSuccess: (data, variables) => {
      // Invalidate habit details and lists
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.grouped() });
    },
    onError: (error) => {
      console.log('Add tags to habit error:', error);
    },
  });
};

// Remove tags from habit mutation
export const useRemoveTagsFromHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, tagIds }) => habitsService.removeTagsFromHabit(habitId, tagIds),
    onSuccess: (data, variables) => {
      // Invalidate habit details and lists
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.grouped() });
    },
    onError: (error) => {
      console.log('Remove tags from habit error:', error);
    },
  });
};