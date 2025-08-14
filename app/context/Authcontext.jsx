import React, { createContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import authService, { setForceLogoutFunction } from '../services/authService';
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
  const navigation = useNavigation();
  const queryClient = useQueryClient(); // Access QueryClient instance
  
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

  const clearAuthData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
      ]);
    } catch (error) {
      console.log('Error clearing auth data:', error);
    }
  };

  // Clear all React Query cache data
  const clearQueryCache = () => {
    try {
      // Clear all queries and mutations from the cache
      queryClient.clear();
      
      // Alternatively, you can be more specific and remove certain query keys:
      // queryClient.removeQueries(); // Removes all queries
      // queryClient.resetQueries(); // Resets all queries to initial state
      
      console.log('React Query cache cleared successfully');
    } catch (error) {
      console.log('Error clearing React Query cache:', error);
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

  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Call logout endpoint (if available)
      // try {
      //   await authService.logout();
      // } catch (logoutError) {
      //   // Continue with logout even if API call fails
      //   console.log('Logout API error:', logoutError);
      // }
      
      // Clear React Query cache FIRST (before clearing auth data)
      clearQueryCache();
      
      // Clear auth data from storage
      await clearAuthData();
      
      // Dispatch logout action to update state
      dispatch({ type: "LOGOUT" });
      
      // Navigate to login screen
      router.dismissAll();
      router.replace("/SignIn");
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.log("Error during logout:", error);
      
      // Force logout even if there's an error
      try {
        clearQueryCache(); // Still try to clear cache
        await clearAuthData(); // Still try to clear auth data
      } catch (cleanupError) {
        console.log("Error during cleanup:", cleanupError);
      }
      
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

      // If token is expired, attempt refresh (if your API supports it)
      // For now, we'll logout the user
      await logout();
      throw new Error('Token expired');
    } catch (error) {
      console.log('Token refresh error:', error);
      await logout();
      throw error;
    }
  };

  // Force logout with cache clear (useful for token expiration)
  const forceLogout = async (reason = 'Session expired') => {
    console.log(`Force logout triggered: ${reason}`);
    
    try {
      // Clear React Query cache immediately
      clearQueryCache();
      
      // Clear auth data
      await clearAuthData();
      
      // Update state
      dispatch({ type: "LOGOUT" });
      
      // Navigate to login
      router.dismissAll();
      router.replace("/SignIn");
    } catch (error) {
      console.log("Error during force logout:", error);
      // Ensure we still logout even if cleanup fails
      dispatch({ type: "LOGOUT" });
      router.dismissAll();
      router.replace("/SignIn");
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    // Register the forceLogout function with authService
    setForceLogoutFunction(forceLogout);
    
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
          await forceLogout('No remember me preference');
          return;
        }

        if (!token || !userData) {
          await forceLogout('Missing auth data');
          return;
        }

        const user = JSON.parse(userData);

        // Validate token
        if (isTokenValid(token)) {
          dispatch({ 
            type: "LOGIN_SUCCESS", 
            payload: { user, token } 
          });
          
          router.replace("/(tabs)/home");
        } else {
          // Token expired, clear everything and redirect
          await forceLogout('Token expired');
        }
      } catch (error) {
        console.log("Error during auth initialization:", error);
        await forceLogout('Initialization error');
      }
    };

    initializeAuth();
  }, [navigation]);

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    forceLogout, // Export force logout for use in error interceptors
    refreshToken,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    updateUser: (userData) => dispatch({ type: "UPDATE_USER", payload: userData }),
    clearQueryCache, // Export cache clearing function
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;