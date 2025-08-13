import React, { createContext, useContext, useReducer, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';

const CommentContext = createContext();

const initialState = {
  expandedComments: new Set(),
  replyingTo: null,
  draftComments: new Map(),
};

const commentReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_STATE':
      return {
        expandedComments: new Set(),
        replyingTo: null,
        draftComments: new Map(),
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
      
    case 'SET_DRAFT_COMMENT':
      const newDraftComments = new Map(state.draftComments);
      newDraftComments.set(action.payload.taskId, action.payload.content);
      return { ...state, draftComments: newDraftComments };
      
    case 'CLEAR_DRAFT_COMMENT':
      const clearedDrafts = new Map(state.draftComments);
      clearedDrafts.delete(action.payload);
      return { ...state, draftComments: clearedDrafts };
      
    default:
      return state;
  }
};

export const CommentProvider = forwardRef(({ children }, ref) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);

  // Reset function for logout
  const resetCommentState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: resetCommentState,
  }));

  // Memoized actions
  const toggleCommentExpansion = useCallback((commentId) => 
    dispatch({ type: 'TOGGLE_COMMENT_EXPANSION', payload: commentId }), []);

  const setReplyingTo = useCallback((comment) => 
    dispatch({ type: 'SET_REPLYING_TO', payload: comment }), []);

  const setDraftComment = useCallback((taskId, content) => 
    dispatch({ type: 'SET_DRAFT_COMMENT', payload: { taskId, content } }), []);

  const clearDraftComment = useCallback((taskId) => 
    dispatch({ type: 'CLEAR_DRAFT_COMMENT', payload: taskId }), []);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    toggleCommentExpansion,
    setReplyingTo,
    setDraftComment,
    clearDraftComment,
    resetCommentState, // Expose reset function
  }), [
    state,
    toggleCommentExpansion,
    setReplyingTo,
    setDraftComment,
    clearDraftComment,
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