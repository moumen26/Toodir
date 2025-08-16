import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuthStatus } from "../hooks/useAuth";
import TodayHabitsSection from "../components/TodayHabitsSection";
import TodayTasksSection from "../components/TodayTasksSection";

const Home = () => {
  const { user } = useAuthStatus();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // The child components will handle their own refresh logic
      // We just need to trigger a re-render and they will refetch
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for better UX
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderAvatar = (member, size = 32) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member?.profile_picture ? (
        <Image
          source={{ uri: member?.profile_picture }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.profileContent}
          // onPress={handleProfilePress}
        >
          <View style={styles.profileLeft}>
            <View style={styles.profileAvatarContainer}>
              {renderAvatar(user, 48)}
              {user?.is_email_verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              ) : (
                <View style={styles.unverifiedBadge}>
                  <Ionicons name="close" size={12} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.welcomeText}>
                {getGreeting()}
              </Text>
            </View>
          </View>
          <View style={styles.profileRight}>
            <TouchableOpacity
              // onPress={() => navigation.navigate("Calendar/index")}
              style={styles.notificationButton}
            >
              <Ionicons name="calendar-outline" size={24} color="#1C30A4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}} // handleNotificationPress
              style={styles.notificationButton}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#1C30A4"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile/index")}
              style={styles.menuButton}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color="#1C30A4"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1C30A4"]} // Android
            tintColor="#1C30A4" // iOS
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        {/* Today's Habits Section */}
        <TodayHabitsSection key={`habits-${refreshing}`} />

        {/* Today's Tasks Section */}
        <TodayTasksSection key={`tasks-${refreshing}`} />

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Helper function to get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#1C30A4",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileAvatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    backgroundColor: "#10B981",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  unverifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    padding: 8,
    marginRight: 4,
  },
  menuButton: {
    padding: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 60,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Home;