import React, { createContext, useContext, useReducer, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import taskCommentService from "../services/taskCommentService";

const CommentContext = createContext();

const initialState = {
  expandedComments: new Set(),
  replyingTo: null,
  draftComments: new Map(),
  editingComment: null,
  optimisticComments: new Map(),
  ui: {
    isLoading: false,
    error: null,
    showReplyForm: false,
  },
};

const commentReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_STATE':
      return {
        ...initialState,
        // Reset collections properly
        expandedComments: new Set(),
        draftComments: new Map(),
        optimisticComments: new Map(),
        ui: { ...initialState.ui },
      };
      
    case 'TOGGLE_COMMENT_EXPANSION':
      const newExpandedComments = new Set(state.expandedComments);
      if (newExpandedComments.has(action.payload)) {
        newExpandedComments.delete(action.payload);
      } else {
        newExpandedComments.add(action.payload);
      }
      return { ...state, expandedComments: newExpandedComments };
      
    case 'SET_REPLYING_TO':
      return { ...state, replyingTo: action.payload };
      
    case 'SET_EDITING_COMMENT':
      return { ...state, editingComment: action.payload };
      
    case 'SET_DRAFT_COMMENT':
      const newDraftComments = new Map(state.draftComments);
      newDraftComments.set(action.payload.key, action.payload.content);
      return { ...state, draftComments: newDraftComments };
      
    case 'CLEAR_DRAFT_COMMENT':
      const clearedDrafts = new Map(state.draftComments);
      clearedDrafts.delete(action.payload);
      return { ...state, draftComments: clearedDrafts };
      
    case 'ADD_OPTIMISTIC_COMMENT':
      const newOptimisticComments = new Map(state.optimisticComments);
      newOptimisticComments.set(action.payload.id, action.payload);
      return { ...state, optimisticComments: newOptimisticComments };
      
    case 'REMOVE_OPTIMISTIC_COMMENT':
      const updatedOptimisticComments = new Map(state.optimisticComments);
      updatedOptimisticComments.delete(action.payload);
      return { ...state, optimisticComments: updatedOptimisticComments };
      
    case 'CLEAR_ALL_OPTIMISTIC_COMMENTS':
      return { ...state, optimisticComments: new Map() };
      
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        }
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
          isLoading: false,
        }
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null,
        }
      };
      
    default:
      return state;
  }
};

export const CommentProvider = forwardRef(({ children }, ref) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);
  const queryClient = useQueryClient();

  // Enhanced reset function for complete cleanup
  const resetCommentState = useCallback(() => {
    console.log('Resetting Comment context state...');
    
    try {
      // 1. Reset local state
      dispatch({ type: 'RESET_STATE' });
      
      // 2. Clear comment-related queries from React Query
      const commentQueries = [
        'comments',
        'comment',
        'comment-stats',
        'comment-replies',
        'task-comments',
      ];
      
      commentQueries.forEach(queryKey => {
        queryClient.removeQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      
      // 3. Clear service cache
      if (taskCommentService.clearAllCache) {
        taskCommentService.clearAllCache();
      }
      
      console.log('Comment context reset completed successfully');
    } catch (error) {
      console.log('Error resetting Comment context:', error);
      // Force state reset even if cleanup fails
      dispatch({ type: 'RESET_STATE' });
    }
  }, [queryClient]);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: resetCommentState,
  }), [resetCommentState]);

  // Memoized actions
  const toggleCommentExpansion = useCallback((commentId) => 
    dispatch({ type: 'TOGGLE_COMMENT_EXPANSION', payload: commentId }), []);

  const setReplyingTo = useCallback((comment) => {
    dispatch({ type: 'SET_REPLYING_TO', payload: comment });
    dispatch({ type: 'SET_UI_STATE', payload: { showReplyForm: !!comment } });
  }, []);

  const setEditingComment = useCallback((comment) => {
    dispatch({ type: 'SET_EDITING_COMMENT', payload: comment });
  }, []);

  const setDraftComment = useCallback((key, content) => 
    dispatch({ type: 'SET_DRAFT_COMMENT', payload: { key, content } }), []);

  const clearDraftComment = useCallback((key) => 
    dispatch({ type: 'CLEAR_DRAFT_COMMENT', payload: key }), []);

  const addOptimisticComment = useCallback((comment) => 
    dispatch({ type: 'ADD_OPTIMISTIC_COMMENT', payload: comment }), []);

  const removeOptimisticComment = useCallback((commentId) => 
    dispatch({ type: 'REMOVE_OPTIMISTIC_COMMENT', payload: commentId }), []);

  const clearAllOptimisticComments = useCallback(() => 
    dispatch({ type: 'CLEAR_ALL_OPTIMISTIC_COMMENTS' }), []);

  const setUIState = useCallback((uiState) => 
    dispatch({ type: 'SET_UI_STATE', payload: uiState }), []);

  const setError = useCallback((error) => 
    dispatch({ type: 'SET_ERROR', payload: error }), []);

  const clearError = useCallback(() => 
    dispatch({ type: 'CLEAR_ERROR' }), []);

  // Enhanced comment management functions
  const cancelReply = useCallback(() => {
    dispatch({ type: 'SET_REPLYING_TO', payload: null });
    dispatch({ type: 'SET_UI_STATE', payload: { showReplyForm: false } });
  }, []);

  const cancelEdit = useCallback(() => {
    dispatch({ type: 'SET_EDITING_COMMENT', payload: null });
  }, []);

  const getDraftComment = useCallback((key) => {
    return state.draftComments.get(key) || '';
  }, [state.draftComments]);

  const isCommentExpanded = useCallback((commentId) => {
    return state.expandedComments.has(commentId);
  }, [state.expandedComments]);

  const getOptimisticComment = useCallback((commentId) => {
    return state.optimisticComments.get(commentId);
  }, [state.optimisticComments]);

  const hasOptimisticComments = useCallback(() => {
    return state.optimisticComments.size > 0;
  }, [state.optimisticComments]);

  // Bulk operations
  const clearAllDrafts = useCallback(() => {
    const keys = Array.from(state.draftComments.keys());
    keys.forEach(key => clearDraftComment(key));
  }, [state.draftComments, clearDraftComment]);

  const expandAllComments = useCallback((commentIds) => {
    commentIds.forEach(id => {
      if (!state.expandedComments.has(id)) {
        toggleCommentExpansion(id);
      }
    });
  }, [state.expandedComments, toggleCommentExpansion]);

  const collapseAllComments = useCallback(() => {
    Array.from(state.expandedComments).forEach(id => {
      toggleCommentExpansion(id);
    });
  }, [state.expandedComments, toggleCommentExpansion]);

  // Helper functions for comment threading
  const getCommentDepth = useCallback((comment, allComments) => {
    let depth = 0;
    let current = comment;
    
    while (current.parent_comment_id) {
      depth++;
      current = allComments.find(c => c.id === current.parent_comment_id);
      if (!current) break;
    }
    
    return depth;
  }, []);

  const organizeCommentThread = useCallback((comments) => {
    const commentMap = new Map();
    const rootComments = [];
    
    // Create a map for quick lookup
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Organize into threads
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });
    
    return rootComments;
  }, []);

  // Context value with comprehensive comment management
  const contextValue = useMemo(() => ({
    // State
    ...state,
    
    // Core actions
    toggleCommentExpansion,
    setReplyingTo,
    setEditingComment,
    setDraftComment,
    clearDraftComment,
    addOptimisticComment,
    removeOptimisticComment,
    clearAllOptimisticComments,
    setUIState,
    setError,
    clearError,
    
    // Enhanced actions
    cancelReply,
    cancelEdit,
    getDraftComment,
    isCommentExpanded,
    getOptimisticComment,
    hasOptimisticComments,
    clearAllDrafts,
    expandAllComments,
    collapseAllComments,
    
    // Thread management
    getCommentDepth,
    organizeCommentThread,
    
    // Reset function
    resetCommentState,
    
    // Computed values
    hasDrafts: state.draftComments.size > 0,
    draftCount: state.draftComments.size,
    expandedCount: state.expandedComments.size,
    optimisticCount: state.optimisticComments.size,
    isReplying: !!state.replyingTo,
    isEditing: !!state.editingComment,
    hasError: !!state.ui.error,
    isLoading: state.ui.isLoading,
  }), [
    state,
    toggleCommentExpansion,
    setReplyingTo,
    setEditingComment,
    setDraftComment,
    clearDraftComment,
    addOptimisticComment,
    removeOptimisticComment,
    clearAllOptimisticComments,
    setUIState,
    setError,
    clearError,
    cancelReply,
    cancelEdit,
    getDraftComment,
    isCommentExpanded,
    getOptimisticComment,
    hasOptimisticComments,
    clearAllDrafts,
    expandAllComments,
    collapseAllComments,
    getCommentDepth,
    organizeCommentThread,
    resetCommentState,
  ]);

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  );
});

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
};

export default CommentProvider;