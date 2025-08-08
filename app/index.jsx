import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useEffect } from "react";

export default function NotFoundScreen() {
  useEffect(() => {
    // Auto redirect after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    router.replace("/SignUp");
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#EF4444",
      }}
    >
      <Text style={{ color: "white", fontSize: 18, marginBottom: 20 }}>
        Page Not Found
      </Text>
      <TouchableOpacity onPress={handleGoHome}>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            textDecorationLine: "underline",
          }}
        >
          Go to Home
        </Text>
      </TouchableOpacity>
      <Text style={{ color: "white", fontSize: 12, marginTop: 20 }}>
        Redirecting automatically in 2 seconds...
      </Text>
    </View>
  );
}
