// utils/errorUtils.js
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  // Handle specific HTTP status codes
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isAuthError = (error) => {
  return error.response?.status === 401;
};

export const isValidationError = (error) => {
  return error.response?.status === 400 || error.response?.status === 422;
};

export const handleApiError = (error, customMessages = {}) => {
  const status = error.response?.status;
  
  if (customMessages[status]) {
    return customMessages[status];
  }
  
  return getErrorMessage(error);
};