import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "./../global.css";
import { AuthContextProvider } from "./context/Authcontext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProjectProvider } from "./context/ProjectContext";

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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ProjectProvider>
            <AuthContextProvider>
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
            </AuthContextProvider>
          </ProjectProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}