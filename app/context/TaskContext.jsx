import React, { createContext, useContext, useReducer } from 'react';

const TaskContext = createContext();

const initialState = {
  selectedTask: null,
  filters: {
    status: 'all',
    priority: 'all',
    search: '',
  },
  preferences: {
    sortBy: 'created_at',
    sortDirection: 'desc',
  },
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const contextValue = {
    ...state,
    setSelectedTask: (task) => dispatch({ type: 'SET_SELECTED_TASK', payload: task }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    setPreferences: (preferences) => dispatch({ type: 'SET_PREFERENCES', payload: preferences }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};