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

// Cache for request/response data
const requestCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper functions for cache management
const isCacheValid = (key) => {
  const timestamp = cacheTimestamps.get(key);
  return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
};

const setCache = (key, data) => {
  requestCache.set(key, data);
  cacheTimestamps.set(key, Date.now());
};

const getCache = (key) => {
  if (isCacheValid(key)) {
    return requestCache.get(key);
  }
  clearCacheEntry(key);
  return null;
};

const clearCacheEntry = (key) => {
  requestCache.delete(key);
  cacheTimestamps.delete(key);
};

const clearAllCache = () => {
  requestCache.clear();
  cacheTimestamps.clear();
  console.log('Auth service cache cleared');
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
  (response) => {
    // Cache successful responses for certain endpoints
    const { url, method } = response.config;
    if (method === 'GET' && url && !url.includes('auth')) {
      const cacheKey = `${method}_${url}`;
      setCache(cacheKey, response.data);
    }
    
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear stored auth data
        await Promise.allSettled([
          SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
          AsyncStorage.removeItem(STORAGE_KEYS.USER),
        ]);
        
        // Clear all caches
        clearAllCache();
        
        // Clear global state
        global.isLoggedIn = false;
        delete global.userData;
        
        // Redirect to login - this would need to be handled by the auth context
        return Promise.reject(new Error('Authentication expired'));
      } catch (clearError) {
        console.log('Error clearing auth data:', clearError);
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
  // Cache management methods
  clearCache: clearAllCache,
  clearCacheEntry,
  getCache,
  setCache,

  // Login user
  login: async (credentials) => {
    try {
      // Clear any existing cache before login
      clearAllCache();
      
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
    } finally {
      // Always clear cache on logout
      clearAllCache();
    }
  },

  // Refresh token (if your API supports it)
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response;
    } catch (error) {
      // Clear cache if refresh fails
      clearAllCache();
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

  // Get cached user profile
  getCachedProfile: () => {
    return getCache('GET_/auth/profile');
  },

  // Clear all authentication related data
  clearAllAuthData: async () => {
    try {
      // Clear all caches
      clearAllCache();
      
      // Clear storage
      await Promise.allSettled([
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
        AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);
      
      // Clear global state
      global.isLoggedIn = false;
      delete global.userData;
      
      console.log('All auth data cleared from service');
    } catch (error) {
      console.log('Error clearing auth data from service:', error);
    }
  },

  // Health check method
  healthCheck: async () => {
    try {
      const cacheKey = 'GET_/health';
      const cached = getCache(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get cache stats for debugging
  getCacheStats: () => {
    return {
      cacheSize: requestCache.size,
      cacheKeys: Array.from(requestCache.keys()),
      oldestEntry: Math.min(...Array.from(cacheTimestamps.values())),
      newestEntry: Math.max(...Array.from(cacheTimestamps.values())),
    };
  },
};

export default authService;
export { apiClient, clearAllCache };