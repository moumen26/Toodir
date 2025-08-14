import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tagsService from '../services/tagsService';

export const tagsKeys = {
  all: ['tags'],
  lists: () => [...tagsKeys.all, 'list'],
  list: (filters) => [...tagsKeys.lists(), filters],
  detail: (id) => [...tagsKeys.all, 'detail', id],
};

// Tags hooks
export const useTags = (filters = {}) => {
  return useQuery({
    queryKey: tagsKeys.list(filters),
    queryFn: () => tagsService.getTags(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsService.createTag,
    onSuccess: (data) => {
      // Add new tag to cache
      queryClient.setQueryData(tagsKeys.detail(data.data.id), {
        success: true,
        data: data.data,
      });
      
      // Invalidate tags list to include new tag
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
    },
    onError: (error) => {
      console.error('Create tag error:', error);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, tagData }) => tagsService.updateTag(tagId, tagData),
    onSuccess: (data, variables) => {
      // Update tag in cache
      queryClient.setQueryData(tagsKeys.detail(variables.tagId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
    },
    onError: (error) => {
      console.error('Update tag error:', error);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsService.deleteTag,
    onSuccess: (data, tagId) => {
      // Remove tag from cache
      queryClient.removeQueries({ queryKey: tagsKeys.detail(tagId) });
      
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
    },
    onError: (error) => {
      console.error('Delete tag error:', error);
    },
  });
};