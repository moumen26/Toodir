// hooks/useProjectQueries.jsx - Enhanced with optimized update mutation
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

// Update project mutation - Enhanced with optimizations
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, projectData }) => {
      // Validate data before sending
      const validation = projectService.validateProjectData(projectData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      
      return projectService.updateProject(projectId, projectData);
    },
    
    // Optimistic updates for better UX
    onMutate: async ({ projectId, projectData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(projectId));

      // Optimistically update the project detail
      if (previousProject?.data) {
        const optimisticUpdate = {
          ...previousProject,
          data: {
            ...previousProject.data,
            ...projectData,
            // Handle tags update
            ...(projectData.tags && {
              tags: projectData.tags.map(tagId => 
                typeof tagId === 'string' 
                  ? previousProject.data.tags?.find(tag => tag.id === tagId) || { id: tagId }
                  : tagId
              )
            }),
            updated_at: new Date().toISOString(),
          }
        };

        queryClient.setQueryData(projectKeys.detail(projectId), optimisticUpdate);

        // Update project in lists cache
        queryClient.setQueriesData(
          { queryKey: projectKeys.lists() },
          (oldData) => {
            if (!oldData) return oldData;

            // Handle infinite query structure
            if (oldData.pages) {
              return {
                ...oldData,
                pages: oldData.pages.map(page => ({
                  ...page,
                  data: page.data.map(project => 
                    project.id === projectId 
                      ? { ...project, ...projectData, updated_at: new Date().toISOString() }
                      : project
                  )
                }))
              };
            }

            // Handle regular array structure
            if (Array.isArray(oldData.data)) {
              return {
                ...oldData,
                data: oldData.data.map(project => 
                  project.id === projectId 
                    ? { ...project, ...projectData, updated_at: new Date().toISOString() }
                    : project
                )
              };
            }

            return oldData;
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousProject, previousLists: queryClient.getQueriesData({ queryKey: projectKeys.lists() }) };
    },

    onSuccess: (data, variables) => {
      const { projectId } = variables;
      
      // Update the specific project in cache with server response
      queryClient.setQueryData(projectKeys.detail(projectId), {
        success: true,
        data: data.data,
      });
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats(projectId) });
      
      // Background refetch of project lists to sync any server-side changes
      queryClient.refetchQueries({ 
        queryKey: projectKeys.lists(),
        type: 'active' 
      });

      console.log('Project updated successfully:', data.data.title);
    },

    onError: (error, variables, context) => {
      const { projectId } = variables;
      
      // Rollback optimistic updates
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previousProject);
      }
      
      // Rollback list updates
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
      
      // Log error for debugging
      console.error('Update project error:', error);
      
      // Refetch to ensure we have the correct state
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },

    // Settled callback for cleanup
    onSettled: (data, error, variables) => {
      const { projectId } = variables;
      
      // Ensure we have fresh data after update
      if (!error) {
        // Refetch project stats as they might have changed
        queryClient.invalidateQueries({ queryKey: projectKeys.stats(projectId) });
      }
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on validation errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      
      // Retry up to 2 times for network/server errors
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onMutate: async (projectId) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Get snapshots for rollback
      const previousProject = queryClient.getQueryData(projectKeys.detail(projectId));
      const previousLists = queryClient.getQueriesData({ queryKey: projectKeys.lists() });

      // Optimistically remove project from lists
      queryClient.setQueriesData(
        { queryKey: projectKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;

          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map(page => ({
                ...page,
                data: page.data.filter(project => project.id !== projectId)
              }))
            };
          }

          if (Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.filter(project => project.id !== projectId)
            };
          }

          return oldData;
        }
      );

      return { previousProject, previousLists };
    },

    onSuccess: (data, projectId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectKeys.stats(projectId) });
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },

    onError: (error, projectId, context) => {
      // Rollback optimistic updates
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previousProject);
      }
      
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
      
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

// Custom hook for project update with additional utilities
export const useProjectUpdate = (projectId) => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProject();
  
  // Get current project data
  const { data: projectData, isLoading } = useProject(projectId);
  
  const updateProject = async (formData) => {
    if (!projectData?.data) {
      throw new Error('Project data not loaded');
    }
    
    // Prepare optimized payload (only changed fields)
    const payload = projectService.prepareUpdatePayload(formData, projectData.data);
    
    if (Object.keys(payload).length === 0) {
      throw new Error('No changes detected');
    }
    
    return updateMutation.mutateAsync({
      projectId,
      projectData: payload,
    });
  };
  
  const resetProject = () => {
    queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
  };
  
  return {
    updateProject,
    resetProject,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isProjectLoading: isLoading,
    project: projectData?.data,
  };
};

export default {
  useInfiniteProjects,
  useProject,
  useProjectStats,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddProjectImages,
  useDeleteProjectImage,
  useSetPrimaryImage,
  useProjectUpdate,
};