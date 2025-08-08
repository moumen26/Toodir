import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import "./../global.css";

export default function RootLayout() {
  useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignIn/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignUp/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword/index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ProjectDetails/index"
        options={{
          headerShown: false,
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
  );
}
