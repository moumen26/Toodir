import { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyState = memo(({ onCreatePress, searchQuery, type }) => (
  <View style={styles.emptyState}>
    <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
    <Text style={styles.emptyStateTitle}>
      {searchQuery ? `No ${type}s found` : `No ${type}s yet`}
    </Text>
    <Text style={styles.emptyStateText}>
      {searchQuery 
        ? "Try adjusting your search or filter criteria"
        : `Create your first ${type} to get started`
      }
    </Text>
    {!searchQuery && (
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={onCreatePress}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyStateButtonText}>Create Task</Text>
      </TouchableOpacity>
    )}
  </View>
));

const styles = StyleSheet.create({
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    emptyStateButton: {
        backgroundColor: "#1C30A4",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyStateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
});

export default EmptyState;