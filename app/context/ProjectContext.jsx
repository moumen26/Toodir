// contexts/ProjectContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import projectService from "../services/projectService";
import { projectKeys } from "../hooks/useProjects";
import {
  useInteractionManager,
  useBatchedState,
  useMemoryPressure,
} from "../util/performance"; 

// Action types
const PROJECT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_PROJECTS: "SET_PROJECTS",
  ADD_PROJECT: "ADD_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  SET_FILTERS: "SET_FILTERS",
  SET_SEARCH: "SET_SEARCH",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_SELECTED_PROJECT: "SET_SELECTED_PROJECT",
  TOGGLE_PROJECT_SELECTION: "TOGGLE_PROJECT_SELECTION",
  CLEAR_SELECTIONS: "CLEAR_SELECTIONS",
  SET_VIEW_MODE: "SET_VIEW_MODE",
  UPDATE_PROJECT_CACHE: "UPDATE_PROJECT_CACHE",
  INVALIDATE_CACHE: "INVALIDATE_CACHE",
  RESET_STATE: "RESET_STATE",
};

// Initial state
const initialState = {
  projects: [],
  filteredProjects: [],
  selectedProjects: new Set(),
  selectedProject: null,
  loading: false,
  error: null,
  filters: {
    priority: "all",
    status: "all",
    member: null,
    dateRange: null,
  },
  searchQuery: "",
  viewMode: "grid",
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  cache: {
    lastUpdated: null,
    invalidated: false,
  },
  performance: {
    renderCount: 0,
    lastOperation: null,
  },
};

// Optimized reducer with immutable updates
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.RESET_STATE:
      return { ...initialState };
    
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };

    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload.projects,
        pagination: {
          ...state.pagination,
          ...action.payload.pagination,
        },
        cache: {
          lastUpdated: Date.now(),
          invalidated: false,
        },
        loading: false,
        error: null,
      };

    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        cache: {
          ...state.cache,
          lastUpdated: Date.now(),
        },
      };

    case PROJECT_ACTIONS.UPDATE_PROJECT: {
      const updatedProjects = state.projects.map((project) =>
        project.id === action.payload.id
          ? { ...project, ...action.payload }
          : project
      );

      return {
        ...state,
        projects: updatedProjects,
        selectedProject:
          state.selectedProject?.id === action.payload.id
            ? { ...state.selectedProject, ...action.payload }
            : state.selectedProject,
        cache: {
          ...state.cache,
          lastUpdated: Date.now(),
        },
      };
    }

    case PROJECT_ACTIONS.DELETE_PROJECT: {
      const newSelectedProjects = new Set(state.selectedProjects);
      newSelectedProjects.delete(action.payload);

      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
        selectedProjects: newSelectedProjects,
        selectedProject:
          state.selectedProject?.id === action.payload
            ? null
            : state.selectedProject,
        cache: {
          ...state.cache,
          lastUpdated: Date.now(),
        },
      };
    }

    case PROJECT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 },
      };

    case PROJECT_ACTIONS.SET_SEARCH:
      return {
        ...state,
        searchQuery: action.payload,
        pagination: { ...state.pagination, page: 1 },
      };

    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case PROJECT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case PROJECT_ACTIONS.SET_SELECTED_PROJECT:
      return {
        ...state,
        selectedProject: action.payload,
      };

    case PROJECT_ACTIONS.TOGGLE_PROJECT_SELECTION: {
      const newSelectedProjects = new Set(state.selectedProjects);
      if (newSelectedProjects.has(action.payload)) {
        newSelectedProjects.delete(action.payload);
      } else {
        newSelectedProjects.add(action.payload);
      }

      return {
        ...state,
        selectedProjects: newSelectedProjects,
      };
    }

    case PROJECT_ACTIONS.CLEAR_SELECTIONS:
      return {
        ...state,
        selectedProjects: new Set(),
        selectedProject: null,
      };

    case PROJECT_ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case PROJECT_ACTIONS.INVALIDATE_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          invalidated: true,
        },
      };

    default:
      return state;
  }
};

// Create context
const ProjectContext = createContext();

// Memoized selectors for performance
const createSelectors = (state) => ({
  getFilteredProjects: () => {
    let filtered = state.projects;

    // Apply filters
    if (state.filters.priority !== "all") {
      filtered = filtered.filter(
        (project) => project.priority === state.filters.priority
      );
    }

    if (state.filters.status !== "all") {
      filtered = filtered.filter(
        (project) => project.status === state.filters.status
      );
    }

    if (state.filters.member) {
      filtered = filtered.filter((project) =>
        project.members?.some((member) => member.id === state.filters.member)
      );
    }

    // Apply search
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.tags?.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getProjectById: (id) => state.projects.find((project) => project.id === id),

  getProjectsByStatus: (status) =>
    state.projects.filter((project) => project.status === status),

  getProjectsByPriority: (priority) =>
    state.projects.filter((project) => project.priority === priority),

  getProjectStats: () => {
    const total = state.projects.length;
    const completed = state.projects.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgress = state.projects.filter(
      (p) => p.status === "in_progress"
    ).length;
    const high = state.projects.filter((p) => p.priority === "high").length;

    return { total, completed, inProgress, high };
  },
});

// Context Provider Component
export const ProjectProvider = ({ children }, ref) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [batchedState, batchUpdate] = useBatchedState({});

  const queryClient = useQueryClient();

  // Reset function
  const resetProjectState = useCallback(() => {
    dispatch({ type: PROJECT_ACTIONS.RESET_STATE });
    // Clear project-related queries
    queryClient.removeQueries({ queryKey: ['projects'] });
    projectService.clearAllCache?.();
  }, [queryClient]);

  useImperativeHandle(ref, () => ({
    reset: resetProjectState,
  }));
  
  const { runAfterInteractions } = useInteractionManager();
  const memoryPressure = useMemoryPressure();

  // Refs for performance optimization
  const debounceTimerRef = useRef(null);
  const lastFetchRef = useRef(0);
  const operationQueueRef = useRef([]);

  // Memoized selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      dispatch({ type: PROJECT_ACTIONS.SET_SEARCH, payload: query });
    }, 300);
  }, []);

  // Optimized project fetching with caching
  const fetchProjects = useCallback(
    async (options = {}) => {
      const { force = false, page = 1, limit = 20, ...filters } = options;

      // Check cache validity
      const now = Date.now();
      const cacheAge = now - (state.cache.lastUpdated || 0);
      const shouldFetch =
        force ||
        state.cache.invalidated ||
        cacheAge > 300000 || // 5 minutes
        now - lastFetchRef.current > 30000; // 30 seconds min between requests

      if (!shouldFetch && state.projects.length > 0) {
        return state.projects;
      }

      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true });

      try {
        const params = {
          page,
          limit,
          ...filters,
          search: state.searchQuery || undefined,
        };

        const response = await projectService.getProjects(params);

        dispatch({
          type: PROJECT_ACTIONS.SET_PROJECTS,
          payload: {
            projects: response.data || [],
            pagination: response.pagination || {},
          },
        });

        lastFetchRef.current = now;
        return response.data || [];
      } catch (error) {
        dispatch({
          type: PROJECT_ACTIONS.SET_ERROR,
          payload: error.message || "Failed to fetch projects",
        });
        throw error;
      }
    },
    [state.searchQuery, state.cache]
  );

  // Optimized project creation
  const createProject = useCallback(
    async (projectData, images = []) => {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await projectService.createProject(
          projectData,
          images
        );

        runAfterInteractions(() => {
          dispatch({
            type: PROJECT_ACTIONS.ADD_PROJECT,
            payload: response.data,
          });

          // Update query cache
          queryClient.setQueryData(projectKeys.detail(response.data.id), {
            data: response.data,
            success: true,
          });

          // Invalidate lists
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        });

        return response.data;
      } catch (error) {
        dispatch({
          type: PROJECT_ACTIONS.SET_ERROR,
          payload: error.message || "Failed to create project",
        });
        throw error;
      } finally {
        dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [queryClient, runAfterInteractions]
  );

  // Optimized project update with optimistic updates
  const updateProject = useCallback(
    async (projectId, updates, images = []) => {
      // Optimistic update
      dispatch({
        type: PROJECT_ACTIONS.UPDATE_PROJECT,
        payload: { id: projectId, ...updates },
      });

      try {
        const response = await projectService.updateProject(
          projectId,
          updates,
          images
        );

        // Confirm with server response
        dispatch({
          type: PROJECT_ACTIONS.UPDATE_PROJECT,
          payload: response.data,
        });

        // Update query cache
        queryClient.setQueryData(projectKeys.detail(projectId), {
          data: response.data,
          success: true,
        });

        return response.data;
      } catch (error) {
        // Revert optimistic update by refetching
        await fetchProjects({ force: true });

        dispatch({
          type: PROJECT_ACTIONS.SET_ERROR,
          payload: error.message || "Failed to update project",
        });
        throw error;
      }
    },
    [queryClient, fetchProjects]
  );

  // Batch delete with confirmation
  const deleteProjects = useCallback(
    async (projectIds) => {
      const projectsToDelete = Array.isArray(projectIds)
        ? projectIds
        : [projectIds];

      if (projectsToDelete.length === 0) return;

      const confirmMessage =
        projectsToDelete.length === 1
          ? "Are you sure you want to delete this project?"
          : `Are you sure you want to delete ${projectsToDelete.length} projects?`;

      return new Promise((resolve, reject) => {
        Alert.alert("Confirm Delete", confirmMessage, [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true });

              try {
                // Delete in parallel for better performance
                const deletePromises = projectsToDelete.map((id) =>
                  projectService.deleteProject(id)
                );

                await Promise.all(deletePromises);

                // Update local state
                projectsToDelete.forEach((id) => {
                  dispatch({
                    type: PROJECT_ACTIONS.DELETE_PROJECT,
                    payload: id,
                  });
                  queryClient.removeQueries({
                    queryKey: projectKeys.detail(id),
                  });
                });

                // Invalidate lists
                queryClient.invalidateQueries({
                  queryKey: projectKeys.lists(),
                });

                resolve(true);
              } catch (error) {
                dispatch({
                  type: PROJECT_ACTIONS.SET_ERROR,
                  payload: error.message || "Failed to delete projects",
                });
                reject(error);
              } finally {
                dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: false });
              }
            },
          },
        ]);
      });
    },
    [queryClient]
  );

  // Memory optimization based on memory pressure
  useEffect(() => {
    if (memoryPressure === "high") {
      // Clear caches and reduce data
      projectService.clearAllCache();
      queryClient.clear();

      // Keep only essential data
      dispatch({
        type: PROJECT_ACTIONS.SET_PROJECTS,
        payload: {
          projects: state.projects.slice(0, 10), // Keep only first 10
          pagination: state.pagination,
        },
      });
    }
  }, [memoryPressure, queryClient, state.projects, state.pagination]);

  // Auto-refresh based on app state
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) {
        fetchProjects();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchProjects, state.loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      projectService.clearAllCache();
    };
  }, []);

  // Context value with memoization
  const contextValue = useMemo(
    () => ({
      // State
      ...state,

      // Selectors
      ...selectors,

      // Actions
      fetchProjects,
      createProject,
      updateProject,
      deleteProjects,

      // Filters and search
      setFilters: (filters) =>
        dispatch({
          type: PROJECT_ACTIONS.SET_FILTERS,
          payload: filters,
        }),
      setSearch: debouncedSearch,

      // Selection
      selectProject: (project) =>
        dispatch({
          type: PROJECT_ACTIONS.SET_SELECTED_PROJECT,
          payload: project,
        }),
      toggleProjectSelection: (projectId) =>
        dispatch({
          type: PROJECT_ACTIONS.TOGGLE_PROJECT_SELECTION,
          payload: projectId,
        }),
      clearSelections: () =>
        dispatch({ type: PROJECT_ACTIONS.CLEAR_SELECTIONS }),

      // View mode
      setViewMode: (mode) =>
        dispatch({
          type: PROJECT_ACTIONS.SET_VIEW_MODE,
          payload: mode,
        }),

      // Utility
      clearError: () => dispatch({ type: PROJECT_ACTIONS.CLEAR_ERROR }),
      invalidateCache: () =>
        dispatch({ type: PROJECT_ACTIONS.INVALIDATE_CACHE }),

      // Performance stats
      performance: {
        ...state.performance,
        cacheAge: Date.now() - (state.cache.lastUpdated || 0),
        memoryPressure,
      },

      resetProjectState,
    }),
    [
      state,
      selectors,
      fetchProjects,
      createProject,
      updateProject,
      deleteProjects,
      debouncedSearch,
      memoryPressure,
      resetProjectState
    ]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use project context
export const useProjectContext = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }

  return context;
};

// Higher-order component for project context
export const withProjectContext = (Component) => {
  return React.memo((props) => (
    <ProjectProvider>
      <Component {...props} />
    </ProjectProvider>
  ));
};

export default ProjectProvider;
