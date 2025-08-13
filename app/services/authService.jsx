import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/storage';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
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
    // console.log(error.response);
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear stored auth data
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
          AsyncStorage.removeItem(STORAGE_KEYS.USER),
        ]);
        
        // Redirect to login - this would need to be handled by the auth context
        // For now, we'll just reject the promise
        return Promise.reject(new Error('Authentication expired'));
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access denied'));
    }

    // Handle 500 errors (server errors)
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle 429 errors (too many requests)
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }

    // Handle 408 errors (request timeout)
    if (error.response?.status === 408) {
      return Promise.reject(new Error('Request timed out. Please try again later.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

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