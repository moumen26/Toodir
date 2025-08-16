import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import remindersService from '../services/remindersService';

export const remindersKeys = {
  all: ['reminders'],
  lists: () => [...remindersKeys.all, 'list'],
  list: (filters) => [...remindersKeys.lists(), filters],
  detail: (id) => [...remindersKeys.all, 'detail', id],
  upcoming: (hours) => [...remindersKeys.all, 'upcoming', hours],
  overdue: () => [...remindersKeys.all, 'overdue'],
  stats: () => [...remindersKeys.all, 'stats'],
};

// Infinite reminders hook with server-side filtering
export const useInfiniteReminders = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: remindersKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      remindersService.getReminders({ 
        ...filters, 
        page: pageParam,
        limit: filters.limit || 10 
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.pagination) return undefined;
      const { current_page, total_pages } = lastPage.data.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Regular reminders hook (for smaller datasets)
export const useReminders = (filters = {}) => {
  return useQuery({
    queryKey: remindersKeys.list(filters),
    queryFn: () => remindersService.getReminders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Upcoming reminders hook
export const useUpcomingReminders = (hours = 24) => {
  return useQuery({
    queryKey: remindersKeys.upcoming(hours),
    queryFn: () => remindersService.getUpcomingReminders(hours),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for upcoming)
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Overdue reminders hook
export const useOverdueReminders = () => {
  return useQuery({
    queryKey: remindersKeys.overdue(),
    queryFn: remindersService.getOverdueReminders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Single reminder hook
export const useReminder = (reminderId) => {
  return useQuery({
    queryKey: remindersKeys.detail(reminderId),
    queryFn: () => remindersService.getReminderById(reminderId),
    enabled: !!reminderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Reminder statistics hook
export const useReminderStats = () => {
  return useQuery({
    queryKey: remindersKeys.stats(),
    queryFn: remindersService.getReminderStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Create reminder mutation
export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remindersService.createReminder,
    onSuccess: (data) => {
      // Add new reminder to cache
      queryClient.setQueryData(remindersKeys.detail(data.data.id), {
        success: true,
        data: data.data,
      });
      
      // Invalidate reminders lists to include new reminder
      queryClient.invalidateQueries({ queryKey: remindersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.stats() });
    },
    onError: (error) => {
      console.log('Create reminder error:', error);
    },
  });
};

// Update reminder mutation
export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, reminderData }) => 
      remindersService.updateReminder(reminderId, reminderData),
    onSuccess: (data, variables) => {
      // Update reminder in cache
      queryClient.setQueryData(remindersKeys.detail(variables.reminderId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: remindersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.stats() });
    },
    onError: (error) => {
      console.log('Update reminder error:', error);
    },
  });
};

// Snooze reminder mutation
export const useSnoozeReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, snoozeMinutes }) => 
      remindersService.snoozeReminder(reminderId, snoozeMinutes),
    onSuccess: (data, variables) => {
      // Update reminder status in cache
      queryClient.setQueryData(remindersKeys.detail(variables.reminderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            status: 'snoozed',
            snooze_until: data.data.snooze_until
          }
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: remindersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.stats() });
    },
    onError: (error) => {
      console.log('Snooze reminder error:', error);
    },
  });
};

// Complete reminder mutation
export const useCompleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remindersService.completeReminder,
    onSuccess: (data, reminderId) => {
      // Update reminder status in cache
      queryClient.setQueryData(remindersKeys.detail(reminderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            status: 'completed',
            completed_at: data.data.completed_at
          }
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: remindersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.stats() });
    },
    onError: (error) => {
      console.log('Complete reminder error:', error);
    },
  });
};

// Delete reminder mutation
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remindersService.deleteReminder,
    onSuccess: (data, reminderId) => {
      // Remove reminder from cache
      queryClient.removeQueries({ queryKey: remindersKeys.detail(reminderId) });
      
      // Invalidate reminders lists
      queryClient.invalidateQueries({ queryKey: remindersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: remindersKeys.stats() });
    },
    onError: (error) => {
      console.log('Delete reminder error:', error);
    },
  });
};

// Bulk update reminders mutation
export const useBulkUpdateReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderIds, action, data }) => 
      remindersService.bulkUpdateReminders(reminderIds, action, data),
    onSuccess: () => {
      // Invalidate all reminder queries after bulk update
      queryClient.invalidateQueries({ queryKey: remindersKeys.all });
    },
    onError: (error) => {
      console.log('Bulk update reminders error:', error);
    },
  });
};