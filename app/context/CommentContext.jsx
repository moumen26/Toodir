import React, { createContext, useContext, useReducer } from 'react';

const CommentContext = createContext();

const initialState = {
  expandedComments: new Set(),
  replyingTo: null,
  draftComments: new Map(),
};

const commentReducer = (state, action) => {
  switch (action.type) {
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

export const CommentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);

  const contextValue = {
    ...state,
    toggleCommentExpansion: (commentId) => 
      dispatch({ type: 'TOGGLE_COMMENT_EXPANSION', payload: commentId }),
    setReplyingTo: (comment) => 
      dispatch({ type: 'SET_REPLYING_TO', payload: comment }),
    setDraftComment: (taskId, content) => 
      dispatch({ type: 'SET_DRAFT_COMMENT', payload: { taskId, content } }),
    clearDraftComment: (taskId) => 
      dispatch({ type: 'CLEAR_DRAFT_COMMENT', payload: taskId }),
  };

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
};