// services/authService.js - Updated to integrate with AuthContext logout
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

// Get API URL from Expo Constants
const API_URL = Constants.expoConfig?.extra?.apiUrl;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable to store the logout function from AuthContext
let forceLogoutFunction = null;

// Function to set the logout function (called from AuthContext)
export const setForceLogoutFunction = (logoutFn) => {
  forceLogoutFunction = logoutFn;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored auth data
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
          AsyncStorage.removeItem(STORAGE_KEYS.USER),
        ]);

        // Call the forceLogout function if available (this will clear React Query cache)
        if (forceLogoutFunction) {
          await forceLogoutFunction('Authentication expired');
        }

        return Promise.reject(new Error('Authentication expired'));
      } catch (clearError) {
        console.log('Error clearing auth data:', clearError);
        
        // Still try to call forceLogout even if clearing fails
        if (forceLogoutFunction) {
          await forceLogoutFunction('Authentication error');
        }
      }
    }

    // Handle 400 and 404 errors with server messages
    if (error.response?.status === 400 || error.response?.status === 404) {
      const serverMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           error.response?.data?.msg ||
                           (error.response?.status === 400 ? 'Bad request' : 'Not found');
      
      const customError = new Error(serverMessage);
      customError.status = error.response.status;
      customError.data = error.response.data;
      return Promise.reject(customError);
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      const serverMessage = error.response?.data?.message || 
      error.response?.data?.error ||
      'Access denied';
      
      const customError = new Error(serverMessage);
      customError.status = error.response.status;
      customError.data = error.response.data;
      return Promise.reject(customError);
    }

    // Handle 422 errors (validation errors)
    if (error.response?.status === 422) {
      const serverMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           'Validation failed';
      
      // If there are validation details, include them
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        const combinedMessage = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : serverMessage;
        
        const customError = new Error(combinedMessage);
        customError.status = 422;
        customError.validationErrors = validationErrors;
        return Promise.reject(customError);
      }
      
      return Promise.reject(new Error(serverMessage));
    }

    // Handle 500 errors (server errors)
    if (error.response?.status === 500) {
      const serverMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           'Server error. Please try again later.';
      return Promise.reject(new Error(serverMessage));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle other HTTP errors with server messages
    if (error.response?.data) {
      const serverMessage = error.response.data.message || 
                           error.response.data.error ||
                           error.response.data.msg ||
                           `HTTP ${error.response.status} Error`;
      
      const customError = new Error(serverMessage);
      customError.status = error.response.status;
      customError.data = error.response.data;
      return Promise.reject(customError);
    }

    // Fallback for any other errors
    return Promise.reject(error);
  }
);

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user (if you have a logout endpoint)
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.log('Logout API error:', error);
    }
  },

  // Refresh token (if your API supports it)
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify email (if you have email verification)
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
export { apiClient };