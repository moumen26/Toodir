import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';

// Query keys
export const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (filters) => [...projectKeys.lists(), filters],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id) => [...projectKeys.details(), id],
  stats: (id) => [...projectKeys.all, 'stats', id],
};

// Get projects with infinite scroll
export const useInfiniteProjects = (filters = {}) => {  
  return useInfiniteQuery({
    queryKey: projectKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      projectService.getProjects({ 
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

// Get single project
export const useProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    ...options,
  });
};

// Get project statistics
export const useProjectStats = (projectId, options = {}) => {
  return useQuery({
    queryKey: projectKeys.stats(projectId),
    queryFn: () => projectService.getProjectStats(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

// Create project mutation
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Add the new project to cache
      queryClient.setQueryData(projectKeys.detail(data.data.id), {
        success: true,
        data: data.data,
      });
    },
    onError: (error) => {
      console.log('Create project error:', error);
    },
  });
};

// Update project mutation
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, projectData }) => 
      projectService.updateProject(projectId, projectData),
    onSuccess: (data, variables) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(variables.projectId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate projects list to reflect changes
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.log('Update project error:', error);
    },
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: (data, projectId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectKeys.stats(projectId) });
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.log('Delete project error:', error);
    },
  });
};

// Add project images mutation
export const useAddProjectImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, images }) => 
      projectService.addProjectImages(projectId, images),
    onSuccess: (data, variables) => {
      // Invalidate project detail to refetch with new images
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(variables.projectId) 
      });
    },
    onError: (error) => {
      console.log('Add project images error:', error);
    },
  });
};

// Delete project image mutation
export const useDeleteProjectImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, imageId }) => 
      projectService.deleteProjectImage(projectId, imageId),
    onSuccess: (data, variables) => {
      // Invalidate project detail to refetch without deleted image
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(variables.projectId) 
      });
    },
    onError: (error) => {
      console.log('Delete project image error:', error);
    },
  });
};

// Set primary image mutation
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, imageId }) => 
      projectService.setPrimaryImage(projectId, imageId),
    onSuccess: (data, variables) => {
      // Invalidate project detail to refetch with updated primary image
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(variables.projectId) 
      });
      
      // Also invalidate projects list as primary image might be displayed there
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error) => {
      console.log('Set primary image error:', error);
    },
  });
};