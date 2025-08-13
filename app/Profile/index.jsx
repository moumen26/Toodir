import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuthStatus, useLogout } from "../hooks/useAuth";
import { formatDate } from '../util/useFullFunctions';

const Profile = () => {
  const { user, token } = useAuthStatus();
  const { logout, isLoading } = useLogout();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = useNavigation();

  const stats = [
    {
      id: 1,
      title: "Tasks Completed",
      value: 127,
      icon: "checkmark-circle",
      color: "#10B981",
      trend: "+12%",
    },
    {
      id: 2,
      title: "Active Projects",
      value: 8,
      icon: "folder",
      color: "#3B82F6",
      trend: "+3",
    },
    {
      id: 3,
      title: "Habit Streak",
      value: 15,
      icon: "flame",
      color: "#F59E0B",
      trend: "days",
    },
  ];

  const accountOptions = [
    {
      id: 1,
      title: "Edit Profile Info",
      icon: "person-outline",
      // action: () => navigation.navigate("ProfileInfo/index"),
    },
    {
      id: 2,
      title: "Change Password",
      icon: "lock-closed-outline",
      // action: () => navigation.navigate("ChangePassword/index"),
    },
    {
      id: 3,
      title: "Language",
      icon: "globe-outline",
      value: "English",
      action: () => Alert.alert("Language", "Select language"),
    },
  ];

  const productivityOptions = [
    {
      id: 1,
      title: "Statistics",
      icon: "bar-chart-outline",
      action: () => navigation.navigate("Statistics/index"),
    },
    {
      id: 2,
      title: "Productivity Score",
      icon: "trending-up-outline",
      value: "87%",
      action: () => Alert.alert("Productivity", "View productivity insights"),
    },
  ];

  const socialOptions = [
    {
      id: 1,
      title: "Manage Groups",
      icon: "people-outline",
      // action: () => navigation.navigate("ManageGroups/index"),
    },
    {
      id: 2,
      title: "Manage Friends",
      icon: "person-add-outline",
      // action: () => navigation.navigate("ManageFriends/index"),
    },
  ];

  const supportOptions = [
    {
      id: 1,
      title: "Help & FAQ",
      icon: "help-circle-outline",
      action: () => Alert.alert("Help", "View help and FAQ"),
    },
    {
      id: 2,
      title: "Terms of Service",
      icon: "document-text-outline",
      action: () => Alert.alert("Terms", "View terms of service"),
    },
    {
      id: 3,
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      action: () => Alert.alert("Privacy", "View privacy policy"),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Log Out", 
      "Are you sure you want to log out? This will clear all your local data.", 
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              console.log('Starting logout process from Profile...');
              
              // Perform logout which triggers complete data clearing
              await logout();
              
              console.log('Logout completed successfully');
              setIsLoggingOut(false);
            
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const renderAvatar = (size = 80) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {user?.profile_picture ? (
        <Image
          source={{ uri: user.profile_picture }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.5} color="#9CA3AF" />
      )}
    </View>
  );

  const renderStatCard = (stat) => (
    <View key={stat.id} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
          <Ionicons name={stat.icon} size={16} color={stat.color} />
        </View>
        <View style={styles.statTrend}>
          <Text style={[styles.statTrendText, { color: stat.color }]}>
            {stat.trend}
          </Text>
        </View>
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  const renderMenuSection = (title, options, hasSwitch = false) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={styles.menuItem}
          onPress={option.action}
          disabled={isLoggingOut}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name={option.icon} size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuItemTitle}>{option.title}</Text>
          </View>
          <View style={styles.menuItemRight}>
            {option.value && (
              <Text style={styles.menuItemValue}>{option.value}</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderToggleSection = () => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>Preferences</Text>

      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.menuItemTitle}>Push Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#F3F4F6", true: "#1C30A4" + "30" }}
          thumbColor={notificationsEnabled ? "#1C30A4" : "#9CA3AF"}
          disabled={isLoggingOut}
        />
      </View>

      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="moon-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.menuItemTitle}>Dark Mode</Text>
        </View>
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          trackColor={{ false: "#F3F4F6", true: "#1C30A4" + "30" }}
          thumbColor={darkModeEnabled ? "#1C30A4" : "#9CA3AF"}
          disabled={isLoggingOut}
        />
      </View>

      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="eye-off-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.menuItemTitle}>Privacy Mode</Text>
        </View>
        <Switch
          value={privacyMode}
          onValueChange={setPrivacyMode}
          trackColor={{ false: "#F3F4F6", true: "#1C30A4" + "30" }}
          thumbColor={privacyMode ? "#1C30A4" : "#9CA3AF"}
          disabled={isLoggingOut}
        />
      </View>
    </View>
  );

  // Show loading overlay during logout
  if (isLoggingOut) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Logging out...</Text>
          <Text style={styles.loadingSubText}>Please wait while we clear your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={isLoading}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isLoading}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarContainer}>
              {renderAvatar(80)}
              {user?.is_email_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.phone && (
                <Text style={styles.userPhone}>{user?.phone}</Text>
              )}
              <View style={styles.joinDateContainer}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.joinDate}>Joined {formatDate(user?.created_at)}</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>{stats.map(renderStatCard)}</View>
        </View>

        {/* My Account Section */}
        {renderMenuSection("My Account", accountOptions)}

        {/* Productivity & Insights */}
        {renderMenuSection("Productivity & Insights", productivityOptions)}

        {/* Groups & Friends */}
        {renderMenuSection("Groups & Friends", socialOptions)}

        {/* Preferences Toggle Section */}
        {renderToggleSection()}

        {/* Support Section */}
        {renderMenuSection("Support", supportOptions)}

        {/* Logout Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Session</Text>
          <TouchableOpacity 
            style={[
              styles.logoutButton,
              (isLoading || isLoggingOut) && styles.logoutButtonDisabled
            ]} 
            onPress={handleLogout}
            disabled={isLoading || isLoggingOut}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                {isLoading || isLoggingOut ? (
                  <ActivityIndicator size={20} color="#EF4444" />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                )}
              </View>
              <Text style={styles.logoutText}>
                {isLoading || isLoggingOut ? 'Logging Out...' : 'Log Out'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#1C30A4",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatarContainer: {
    position: "relative",
    marginBottom: 16,
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
    bottom: 1,
    right: 1,
    width: 24,
    height: 24,
    backgroundColor: "#10B981",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
  },
  userRole: {
    fontSize: 16,
    color: "#1C30A4",
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  joinDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  joinDate: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statTrend: {},
  statTrendText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
    width: 20,
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutIcon: {
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
    padding: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  loadingSubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  }
})

export default Profile;