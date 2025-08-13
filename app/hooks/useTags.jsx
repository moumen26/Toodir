// hooks/useTags.js
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import tagService from "../services/TagService";

// Query keys factory
export const tagKeys = {
  all: ["tags"],
  lists: () => [...tagKeys.all, "list"],
  list: (filters) => [...tagKeys.lists(), filters],
  details: () => [...tagKeys.all, "detail"],
  detail: (id) => [...tagKeys.details(), id],
};

// Hook for fetching all user tags
export const useTags = (params = {}) => {
  const query = useQuery({
    queryKey: tagKeys.list(params),
    queryFn: () => tagService.getTags(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    keepPreviousData: true,
  });

  const tags = useMemo(() => query.data?.data || [], [query.data]);
  const pagination = useMemo(() => query.data?.pagination || {}, [query.data]);

  return {
    ...query,
    tags,
    pagination,
  };
};

// Hook for fetching a single tag
export const useTag = (tagId, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: tagKeys.detail(tagId),
    queryFn: () => tagService.getTag(tagId),
    enabled: enabled && !!tagId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });

  const tag = useMemo(() => query.data?.data || null, [query.data]);

  return {
    ...query,
    tag,
  };
};

// Hook for creating a tag
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagData) => tagService.createTag(tagData),
    onSuccess: (data) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });

      // Add the new tag to cache
      const newTag = data.data;
      if (newTag) {
        queryClient.setQueryData(tagKeys.detail(newTag.id), {
          data: newTag,
          success: true,
        });
      }
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
    },
  });
};

// Hook for updating a tag
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, tagData }) => tagService.updateTag(tagId, tagData),
    onMutate: async ({ tagId, tagData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: tagKeys.detail(tagId),
      });

      // Snapshot the previous value
      const previousTag = queryClient.getQueryData(tagKeys.detail(tagId));

      // Optimistically update
      if (previousTag) {
        queryClient.setQueryData(tagKeys.detail(tagId), {
          ...previousTag,
          data: { ...previousTag.data, ...tagData },
        });
      }

      return { previousTag };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTag) {
        queryClient.setQueryData(
          tagKeys.detail(variables.tagId),
          context.previousTag
        );
      }
    },
    onSuccess: (data, { tagId }) => {
      // Update the tag in cache
      queryClient.setQueryData(tagKeys.detail(tagId), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

// Hook for deleting a tag
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId) => tagService.deleteTag(tagId),
    onMutate: async (tagId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: tagKeys.detail(tagId),
      });
      await queryClient.cancelQueries({ queryKey: tagKeys.lists() });

      // Snapshot the previous values
      const previousTag = queryClient.getQueryData(tagKeys.detail(tagId));
      const previousTags = queryClient.getQueriesData({
        queryKey: tagKeys.lists(),
      });

      // Optimistically remove from all tag lists
      queryClient.removeQueries({ queryKey: tagKeys.detail(tagId) });

      previousTags.forEach(([queryKey, queryData]) => {
        if (queryData?.data) {
          const filteredTags = queryData.data.filter((t) => t.id !== tagId);
          queryClient.setQueryData(queryKey, {
            ...queryData,
            data: filteredTags,
          });
        }
      });

      return { previousTag, previousTags };
    },
    onError: (err, tagId, context) => {
      // Rollback on error
      if (context?.previousTag) {
        queryClient.setQueryData(tagKeys.detail(tagId), context.previousTag);
      }

      context?.previousTags.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });
    },
    onSuccess: (data, tagId) => {
      // Ensure removal from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(tagId) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

// Hook for project tags operations
export const useProjectTags = () => {
  const queryClient = useQueryClient();

  const addTagsToProject = useMutation({
    mutationFn: ({ projectId, tagIds }) =>
      tagService.addTagsToProject(projectId, tagIds),
    onSuccess: (data, { projectId }) => {
      // Invalidate project queries to refresh tags
      queryClient.invalidateQueries({
        queryKey: ["projects", "detail", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", "lists"],
      });
    },
  });

  const removeTagsFromProject = useMutation({
    mutationFn: ({ projectId, tagIds }) =>
      tagService.removeTagsFromProject(projectId, tagIds),
    onSuccess: (data, { projectId }) => {
      // Invalidate project queries to refresh tags
      queryClient.invalidateQueries({
        queryKey: ["projects", "detail", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", "lists"],
      });
    },
  });

  const getProjectTags = useQuery({
    queryKey: ["project-tags"],
    queryFn: ({ queryKey }) => {
      const [, projectId] = queryKey;
      return tagService.getProjectTags(projectId);
    },
    enabled: false, // Enable manually when needed
  });

  return {
    addTagsToProject,
    removeTagsFromProject,
    getProjectTags,
  };
};

// Hook for tag search with debouncing
export const useTagSearch = (searchQuery, delay = 300) => {
  const debouncedQuery = useDebounce(searchQuery, delay);

  return useQuery({
    queryKey: tagKeys.list({ search: debouncedQuery }),
    queryFn: () => tagService.getTags({ search: debouncedQuery }),
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