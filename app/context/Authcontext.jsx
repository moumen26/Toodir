// Enhanced AuthContext.jsx with complete data clearing

import React, { createContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import { STORAGE_KEYS } from '../constants/storage';
import { router } from "expo-router";

export const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case "CLEAR_ERROR":
      return { ...state, error: null };
    
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  
  // Token validation helper
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 5 minute buffer)
      return decodedToken.exp > (currentTime + 300);
    } catch (error) {
      console.log('Token validation error:', error);
      return false;
    }
  };

  // Secure storage helpers
  const storeAuthData = async (token, user) => {
    try {
      // Store sensitive token in SecureStore
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
      // Store user data in AsyncStorage (non-sensitive)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.log('Error storing auth data:', error);
      throw error;
    }
  };

  // Enhanced clear auth data function
  const clearAuthData = async () => {
    try {
      // Clear all auth-related storage
      await Promise.allSettled([
        // Secure store items
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
        
        // AsyncStorage items
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
        AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
        AsyncStorage.removeItem(STORAGE_KEYS.THEME),
        AsyncStorage.removeItem(STORAGE_KEYS.LANGUAGE),
        
        // Clear all AsyncStorage keys that might contain user data
        AsyncStorage.multiRemove([
          'user_preferences',
          'cached_projects',
          'cached_tasks',
          'recent_activities',
          'notification_settings',
          'draft_data',
          'temp_uploads',
          'search_history',
          'filter_preferences',
          'view_preferences',
          'last_sync_time',
          'offline_changes',
          'pending_uploads',
        ]),
      ]);

      console.log('Auth data cleared successfully');
    } catch (error) {
      console.log('Error clearing auth data:', error);
    }
  };

  // Get context reset functions from global registry
  const clearAllContextData = () => {
    try {
      // Call global context reset functions
      if (global.contextResetRegistry) {
        global.contextResetRegistry.forEach((resetFn, contextName) => {
          try {
            resetFn();
            console.log(`Reset ${contextName} context`);
          } catch (error) {
            console.log(`Error resetting ${contextName} context:`, error);
          }
        });
      }
      
      // Clear the registry itself
      if (global.contextResetRegistry) {
        global.contextResetRegistry.clear();
      }

      console.log('All context data cleared successfully');
    } catch (error) {
      console.log('Error clearing context data:', error);
    }
  };

  // Clear service caches
  const clearServiceCaches = async () => {
    try {
      // Import and clear all service caches
      const services = [
        () => import('../services/authService').then(m => m.default),
        () => import('../services/projectService').then(m => m.default),
        () => import('../services/taskService').then(m => m.default),
        () => import('../services/taskCommentService').then(m => m.default),
        () => import('../services/FriendService').then(m => m.default),
        () => import('../services/TagService').then(m => m.default),
      ];

      await Promise.allSettled(
        services.map(async (getService) => {
          try {
            const service = await getService();
            if (service && typeof service.clearAllCache === 'function') {
              service.clearAllCache();
            }
          } catch (error) {
            console.warn('Service cache clear failed:', error);
          }
        })
      );

      console.log('Service caches cleared successfully');
    } catch (error) {
      console.log('Error clearing service caches:', error);
    }
  };

  // Clear React Query cache
  const clearQueryCache = () => {
    try {
      if (global.queryClient) {
        global.queryClient.clear();
        global.queryClient.removeQueries();
        global.queryClient.invalidateQueries();
        console.log('React Query cache cleared successfully');
      }
    } catch (error) {
      console.log('Error clearing query cache:', error);
    }
  };

  // Clear any additional app data
  const clearAdditionalData = async () => {
    try {
      // Clear any global variables
      delete global.userData;
      delete global.appSettings;
      delete global.tempData;
      
      // Clear any cached images or files
      // Note: You might want to implement file system cleanup here
      
      // Reset any global flags
      global.isLoggedIn = false;
      global.isInitialized = false;
      
      console.log('Additional data cleared successfully');
    } catch (error) {
      console.log('Error clearing additional data:', error);
    }
  };

  // Authentication functions
  const login = async (credentials, rememberMe = false) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user } = response;
        
        // Validate token before storing
        if (!isTokenValid(token)) {
          throw new Error('Invalid token received');
        }

        // Store auth data
        await storeAuthData(token, user);
        
        // Store remember me preference
        if (rememberMe) {
          await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }

        // Set global flags
        global.isLoggedIn = true;
        global.userData = user;

        dispatch({ 
          type: "LOGIN_SUCCESS", 
          payload: { user, token } 
        });

        // Navigate to main app
        router.replace("/(tabs)/home");

        return { success: true };
      }
    } catch (error) {     
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({ type: "SET_LOADING", payload: false });
        return { success: true, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Enhanced logout function with complete data clearing
  const logout = async (skipApiCall = true) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      console.log('Starting logout process...');
      
      // Call logout API unless explicitly skipped (for token expiry cases)
      if (!skipApiCall) {
        try {
          await authService.logout();
          console.log('Logout API call completed');
        } catch (error) {
          console.warn('Logout API call failed:', error);
          // Continue with local cleanup even if API fails
        }
      }
      
      // Clear all app data
      await clearAllAppData();
      
    } catch (error) {
      console.log("Error during logout:", error);
      // Force cleanup even if there's an error
      await clearAllAppData();
    }
  };

  // Complete app data clearing function
  const clearAllAppData = async () => {
    try {
      console.log('Starting complete app data clearing...');
      
      // 1. Clear authentication data
      await clearAuthData();
      
      // 2. Clear context states
      clearAllContextData();
      
      // 3. Clear service caches
      await clearServiceCaches();
      
      // 4. Clear React Query cache
      clearQueryCache();
      
      // 5. Clear additional app data
      await clearAdditionalData();
      
      // 6. Dispatch logout action to reset auth state
      dispatch({ type: "LOGOUT" });
      
      // 7. Navigate to login screen
      router.dismissAll();
      router.replace("/SignIn");
      
      console.log('Complete app data clearing finished successfully');
      
    } catch (error) {
      console.log("Error during complete data clearing:", error);
      // Ensure we still reset state and navigate
      dispatch({ type: "LOGOUT" });
      router.dismissAll();
      router.replace("/SignIn");
    }
  };

  const refreshToken = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error('No token found');
      }

      // If token is still valid, return it
      if (isTokenValid(token)) {
        return token;
      }

      // If token is expired, logout user
      await logout(true); // Skip API call since token is expired
      throw new Error('Token expired');
    } catch (error) {
      console.log('Token refresh error:', error);
      await logout(true);
      throw error;
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const [token, userData, rememberMe] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
        ]);

        // If no remember me preference and no token, logout
        if (!rememberMe && !token) {
          await clearAllAppData();
          return;
        }

        if (!token || !userData) {
          await clearAllAppData();
          return;
        }

        const user = JSON.parse(userData);

        // Validate token
        if (isTokenValid(token)) {
          // Set global flags
          global.isLoggedIn = true;
          global.userData = user;
          
          dispatch({ 
            type: "LOGIN_SUCCESS", 
            payload: { user, token } 
          });
          
          router.replace("/(tabs)/home");
        } else {
          // Token expired, clear everything
          await clearAllAppData();
        }
      } catch (error) {
        console.log("Error during auth initialization:", error);
        await clearAllAppData();
      }
    };

    initializeAuth();
  }, []);

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    updateUser: (userData) => dispatch({ type: "UPDATE_USER", payload: userData }),
    clearAllAppData, // Expose for external use
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;