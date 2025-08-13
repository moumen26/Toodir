import React, { createContext, useContext, useReducer, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import taskService from "../services/taskService";

const TaskContext = createContext();

const initialState = {
  selectedTask: null,
  selectedTasks: new Set(),
  filters: {
    status: 'all',
    priority: 'all',
    search: '',
    projectId: null,
    assignedUserId: null,
    startDate: null,
    endDate: null,
  },
  preferences: {
    sortBy: 'created_at',
    sortDirection: 'desc',
    viewMode: 'list', // 'list' | 'grid' | 'kanban'
  },
  ui: {
    isFiltersVisible: false,
    isSortVisible: false,
    isSelectionMode: false,
  },
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_STATE':
      return {
        ...initialState,
        // Reset collections properly
        selectedTasks: new Set(),
        filters: { ...initialState.filters },
        preferences: { ...initialState.preferences },
        ui: { ...initialState.ui },
      };
      
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          ...action.payload 
        } 
      };
    
    case 'SET_PREFERENCES':
      return { 
        ...state, 
        preferences: { 
          ...state.preferences, 
          ...action.payload 
        } 
      };
    
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: {
          ...initialState.filters,
          search: state.filters.search, // Keep search when resetting other filters
        }
      };
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        filters: {
          ...state.filters,
          search: '',
        }
      };
    
    case 'TOGGLE_TASK_SELECTION':
      const newSelectedTasks = new Set(state.selectedTasks);
      if (newSelectedTasks.has(action.payload)) {
        newSelectedTasks.delete(action.payload);
      } else {
        newSelectedTasks.add(action.payload);
      }
      return { 
        ...state, 
        selectedTasks: newSelectedTasks,
        ui: {
          ...state.ui,
          isSelectionMode: newSelectedTasks.size > 0,
        }
      };
    
    case 'SELECT_ALL_TASKS':
      return { 
        ...state, 
        selectedTasks: new Set(action.payload),
        ui: {
          ...state.ui,
          isSelectionMode: action.payload.length > 0,
        }
      };
    
    case 'CLEAR_TASK_SELECTIONS':
      return { 
        ...state, 
        selectedTasks: new Set(),
        ui: {
          ...state.ui,
          isSelectionMode: false,
        }
      };
    
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        }
      };
    
    case 'TOGGLE_FILTERS':
      return {
        ...state,
        ui: {
          ...state.ui,
          isFiltersVisible: !state.ui.isFiltersVisible,
          isSortVisible: false, // Close sort when opening filters
        }
      };
    
    case 'TOGGLE_SORT':
      return {
        ...state,
        ui: {
          ...state.ui,
          isSortVisible: !state.ui.isSortVisible,
          isFiltersVisible: false, // Close filters when opening sort
        }
      };
    
    case 'SET_SORT':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          sortBy: action.payload.sortBy || state.preferences.sortBy,
          sortDirection: action.payload.sortDirection || state.preferences.sortDirection,
        },
        ui: {
          ...state.ui,
          isSortVisible: false, // Close sort panel after selection
        }
      };
    
    case 'TOGGLE_VIEW_MODE':
      const viewModes = ['list', 'grid', 'kanban'];
      const currentIndex = viewModes.indexOf(state.preferences.viewMode);
      const nextIndex = (currentIndex + 1) % viewModes.length;
      return {
        ...state,
        preferences: {
          ...state.preferences,
          viewMode: viewModes[nextIndex],
        }
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          viewMode: action.payload,
        }
      };
    
    default:
      return state;
  }
};

export const TaskProvider = forwardRef(({ children }, ref) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const queryClient = useQueryClient();

  // Enhanced reset function for complete cleanup
  const resetTaskState = useCallback(() => {
    console.log('Resetting Task context state...');
    
    try {
      // 1. Reset local state
      dispatch({ type: 'RESET_STATE' });
      
      // 2. Clear task-related queries from React Query
      const taskQueries = [
        'tasks',
        'task',
        'task-stats',
        'task-comments',
        'task-attachments',
      ];
      
      taskQueries.forEach(queryKey => {
        queryClient.removeQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      
      // 3. Clear service cache
      if (taskService.clearAllCache) {
        taskService.clearAllCache();
      }
      
      console.log('Task context reset completed successfully');
    } catch (error) {
      console.log('Error resetting Task context:', error);
      // Force state reset even if cleanup fails
      dispatch({ type: 'RESET_STATE' });
    }
  }, [queryClient]);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: resetTaskState,
  }), [resetTaskState]);

  // Memoized actions
  const setSelectedTask = useCallback((task) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setPreferences = useCallback((preferences) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  const toggleTaskSelection = useCallback((taskId) => {
    dispatch({ type: 'TOGGLE_TASK_SELECTION', payload: taskId });
  }, []);

  const selectAllTasks = useCallback((taskIds) => {
    dispatch({ type: 'SELECT_ALL_TASKS', payload: taskIds });
  }, []);

  const clearTaskSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_TASK_SELECTIONS' });
  }, []);

  const setUIState = useCallback((uiState) => {
    dispatch({ type: 'SET_UI_STATE', payload: uiState });
  }, []);

  const toggleFilters = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTERS' });
  }, []);

  const toggleSort = useCallback(() => {
    dispatch({ type: 'TOGGLE_SORT' });
  }, []);

  const setSort = useCallback((sortConfig) => {
    dispatch({ type: 'SET_SORT', payload: sortConfig });
  }, []);

  const toggleViewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_VIEW_MODE' });
  }, []);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  // Quick filter methods
  const setQuickFilter = useCallback((filterType, value) => {
    switch (filterType) {
      case 'priority':
        setFilters({ priority: value });
        break;
      case 'status':
        setFilters({ status: value });
        break;
      case 'project':
        setFilters({ projectId: value });
        break;
      case 'assignee':
        setFilters({ assignedUserId: value });
        break;
      default:
        break;
    }
  }, [setFilters]);

  // Helper methods
  const isFilterActive = useCallback(() => {
    const { status, priority, search, projectId, assignedUserId, startDate, endDate } = state.filters;
    return status !== 'all' || 
           priority !== 'all' || 
           (search && search.trim().length > 0) ||
           projectId !== null ||
           assignedUserId !== null ||
           startDate !== null ||
           endDate !== null;
  }, [state.filters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    const { status, priority, search, projectId, assignedUserId, startDate, endDate } = state.filters;
    
    if (status !== 'all') count++;
    if (priority !== 'all') count++;
    if (search && search.trim().length > 0) count++;
    if (projectId !== null) count++;
    if (assignedUserId !== null) count++;
    if (startDate !== null) count++;
    if (endDate !== null) count++;
    
    return count;
  }, [state.filters]);

  // Memoized selectors
  const selectors = useMemo(() => ({
    isFilterActive: isFilterActive(),
    activeFilterCount: getActiveFilterCount(),
    hasSelectedTasks: state.selectedTasks.size > 0,
    selectedTaskCount: state.selectedTasks.size,
    selectedTaskIds: Array.from(state.selectedTasks),
  }), [state.selectedTasks, isFilterActive, getActiveFilterCount]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    ...state,
    
    // Selectors
    ...selectors,
    
    // Actions
    setSelectedTask,
    setFilters,
    setPreferences,
    resetFilters,
    clearSearch,
    toggleTaskSelection,
    selectAllTasks,
    clearTaskSelections,
    setUIState,
    toggleFilters,
    toggleSort,
    setSort,
    toggleViewMode,
    setViewMode,
    setQuickFilter,
    
    // Reset function
    resetTaskState,
    
    // Helper methods
    isFilterActive: isFilterActive(),
    getActiveFilterCount,
  }), [
    state,
    selectors,
    setSelectedTask,
    setFilters,
    setPreferences,
    resetFilters,
    clearSearch,
    toggleTaskSelection,
    selectAllTasks,
    clearTaskSelections,
    setUIState,
    toggleFilters,
    toggleSort,
    setSort,
    toggleViewMode,
    setViewMode,
    setQuickFilter,
    resetTaskState,
    isFilterActive,
    getActiveFilterCount,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
});

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskProvider;