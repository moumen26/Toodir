// hooks/useProjects.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import projectService from "../services/projectService";

// Query keys factory
export const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters) => [...projectKeys.lists(), filters],
  details: () => [...projectKeys.all, "detail"],
  detail: (id) => [...projectKeys.details(), id],
  stats: (id) => [...projectKeys.all, "stats", id],
  search: (query) => [...projectKeys.all, "search", query],
};

// Hook for fetching all projects with pagination
export const useProjects = (params = {}) => {
  const query = useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  const projects = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    projects,
    pagination,
  };
};

// Hook for infinite scrolling projects
export const useInfiniteProjects = (params = {}) => {
  return useInfiniteQuery({
    queryKey: [...projectKeys.lists(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      projectService.getProjects({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination || {};
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for fetching a single project
export const useProject = (projectId, options = {}) => {
  const { enabled = true, refetchOnMount = false } = options;

  const query = useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProject(projectId),
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnMount,
  });

  const project = useMemo(() => query.data?.data || null, [query.data]);

  return {
    ...query,
    project,
  };
};

// Hook for project statistics
export const useProjectStats = (projectId, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: projectKeys.stats(projectId),
    queryFn: () => projectService.getProjectStats(projectId),
    enabled: enabled && !!projectId,
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

// Hook for creating a project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectData, images }) =>
      projectService.createProject(projectData, images),
    onSuccess: (data) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Add the new project to cache
      const newProject = data.data;
      if (newProject) {
        queryClient.setQueryData(projectKeys.detail(newProject.id), {
          data: newProject,
          success: true,
        });
      }
    },
    onError: (error) => {
      console.error("Error creating project:", error);
    },
  });
};

// Hook for updating a project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, projectData, images }) =>
      projectService.updateProject(projectId, projectData, images),
    onMutate: async ({ projectId, projectData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(
        projectKeys.detail(projectId)
      );

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), {
          ...previousProject,
          data: { ...previousProject.data, ...projectData },
        });
      }

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(variables.projectId),
          context.previousProject
        );
      }
    },
    onSuccess: (data, { projectId }) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.detail(projectId), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats(projectId) });
    },
  });
};

// Hook for deleting a project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId) => projectService.deleteProject(projectId),
    onMutate: async (projectId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot the previous values
      const previousProject = queryClient.getQueryData(
        projectKeys.detail(projectId)
      );
      const previousProjects = queryClient.getQueriesData({
        queryKey: projectKeys.lists(),
      });

      // Optimistically remove from all project lists
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });

      previousProjects.forEach(([queryKey, queryData]) => {
        if (queryData?.data) {
          const filteredProjects = queryData.data.filter(
            (p) => p.id !== projectId
          );
          queryClient.setQueryData(queryKey, {
            ...queryData,
            data: filteredProjects,
          });
        }
      });

      return { previousProject, previousProjects };
    },
    onError: (err, projectId, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject
        );
      }

      context?.previousProjects.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSuccess: (data, projectId) => {
      // Ensure removal from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectKeys.stats(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Hook for adding project images
export const useAddProjectImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, images }) =>
      projectService.addProjectImages(projectId, images),
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
};

// Hook for deleting project image
export const useDeleteProjectImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, imageId }) =>
      projectService.deleteProjectImage(projectId, imageId),
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
};

// Hook for setting primary image
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, imageId }) =>
      projectService.setPrimaryImage(projectId, imageId),
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Hook for adding project member
export const useAddProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }) =>
      projectService.addProjectMember(projectId, userId),
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
};

// Hook for removing project member
export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }) =>
      projectService.removeProjectMember(projectId, memberId),
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
};

// Hook for project search with debouncing
export const useProjectSearch = (searchQuery, delay = 300) => {
  const debouncedQuery = useDebounce(searchQuery, delay);

  return useQuery({
    queryKey: projectKeys.search(debouncedQuery),
    queryFn: () => projectService.getProjects({ search: debouncedQuery }),
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
    cacheTime: 5 * 60 * 1000,
  });
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

// Hook for prefetching projects
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();

  const prefetchProject = useCallback(
    (projectId) => {
      queryClient.prefetchQuery({
        queryKey: projectKeys.detail(projectId),
        queryFn: () => projectService.getProject(projectId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return prefetchProject;
};

// Hook for batch operations
export const useBatchProjectOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdate = useMutation({
    mutationFn: (updates) => projectService.batchUpdateProjects(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  return {
    batchUpdate,
  };
};

// Hook for optimistic updates
export const useOptimisticProjectUpdate = () => {
  const queryClient = useQueryClient();

  const updateProject = useCallback(
    (projectId, updater) => {
      queryClient.setQueryData(projectKeys.detail(projectId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: typeof updater === "function" ? updater(oldData.data) : updater,
        };
      });
    },
    [queryClient]
  );

  return updateProject;
};
