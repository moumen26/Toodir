import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useEffect } from "react";
import "./../global.css";
import { AuthContextProvider } from "./context/Authcontext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProjectProvider } from "./context/ProjectContext";
import { TaskProvider } from "./context/TaskContext";
import { CommentProvider } from "./context/CommentContext";

// Create QueryClient with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize global context reset registry
if (!global.contextResetRegistry) {
  global.contextResetRegistry = new Map();
}

// Make queryClient available globally for cleanup
global.queryClient = queryClient;

// Enhanced provider wrapper that manages data clearing
const AppProvidersWrapper = ({ children }) => {
  const contextRefs = useRef({
    project: null,
    task: null,
    comment: null,
  });

  // Register context reset functions globally
  useEffect(() => {
    // Clean up registry on unmount
    if (global.contextResetRegistry) {
      global.contextResetRegistry.clear();
    }
  }, []);

  // Global function to clear all context data
  const clearAllAppData = () => {
    try {
      console.log('Starting global app data clearing...');
      
      // Clear React Query cache
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.invalidateQueries();
      console.log('React Query cache cleared');
      
      // Reset all context states via the global registry
      if (global.contextResetRegistry) {
        global.contextResetRegistry.forEach((resetFn, contextName) => {
          try {
            resetFn();
            console.log(`${contextName} context reset successfully`);
          } catch (error) {
            console.log(`Error resetting ${contextName} context:`, error);
          }
        });
      }
      
      console.log('All app data cleared successfully');
    } catch (error) {
      console.log('Error clearing app data:', error);
    }
  };

  // Expose global data clearer (kept for backward compatibility)
  useEffect(() => {
    global.clearAllAppData = clearAllAppData;
    
    return () => {
      delete global.clearAllAppData;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider ref={(ref) => {
        contextRefs.current.project = ref;
        // Register immediately when ref becomes available
        if (ref?.reset) {
          global.contextResetRegistry?.set('project', ref.reset);
        }
      }}>
        <TaskProvider ref={(ref) => {
          contextRefs.current.task = ref;
          // Register immediately when ref becomes available
          if (ref?.reset) {
            global.contextResetRegistry?.set('task', ref.reset);
          }
        }}>
          <CommentProvider ref={(ref) => {
            contextRefs.current.comment = ref;
            // Register immediately when ref becomes available
            if (ref?.reset) {
              global.contextResetRegistry?.set('comment', ref.reset);
            }
          }}>
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </CommentProvider>
        </TaskProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  // Initialize global flags
  useEffect(() => {
    global.isLoggedIn = false;
    global.isInitialized = false;
    
    return () => {
      // Clean up global variables
      delete global.queryClient;
      delete global.contextResetRegistry;
      delete global.clearAllAppData;
      delete global.isLoggedIn;
      delete global.isInitialized;
      delete global.userData;
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvidersWrapper>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="index" 
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SignIn/index"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="SignUp/index"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="ForgotPassword/index"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="ProjectDetails/index"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="CreateProject/index"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="CreateTask/index"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="CreateHabit/index"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="Profile/index"
              options={{
                headerShown: false,
                presentation: "transparentModal",
              }}
            />
            <Stack.Screen
              name="ProfileInfo/index"
              options={{
                headerShown: false,
                presentation: "transparentModal",
              }}
            />
            <Stack.Screen
              name="Statistics/index"
              options={{
                headerShown: false,
                presentation: "pageSheet",
              }}
            />
          </Stack>
        </AppProvidersWrapper>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}