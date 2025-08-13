import { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const LoadingState = memo(() => (
  <View style={styles.loadingState}>
    <ActivityIndicator size="large" color="#1C30A4" />
    <Text style={styles.loadingText}>Loading projects...</Text>
  </View>
));

const styles = StyleSheet.create({
    loadingState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#6B7280",
        marginTop: 16,
    },
});

export default LoadingState;