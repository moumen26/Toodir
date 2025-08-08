import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const Home = () => {
  // Static data - no hooks
  const user = {
    name: "Khaldi Abdelmoumen",
    role: "Frontend Developer",
    avatar: null,
    isVerified: true,
  };

  const projects = [
    {
      id: 1,
      name: "Groupe Project name",
      category: "Category of the Project",
      progress: 65,
      teamMembers: [
        { id: 1, avatar: null, name: "Member 1" },
        { id: 2, avatar: null, name: "Member 2" },
        { id: 3, avatar: null, name: "Member 3" },
      ],
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 2,
      name: "Mobile App Design",
      category: "UI/UX Design",
      progress: 80,
      teamMembers: [
        { id: 1, avatar: null, name: "Member 1" },
        { id: 2, avatar: null, name: "Member 2" },
      ],
      priority: "High",
      status: "In Progress",
    },
    {
      id: 3,
      name: "E-commerce Platform",
      category: "Web Development",
      progress: 45,
      teamMembers: [
        { id: 1, avatar: null, name: "Member 1" },
        { id: 2, avatar: null, name: "Member 2" },
        { id: 3, avatar: null, name: "Member 3" },
        { id: 4, avatar: null, name: "Member 4" },
      ],
      priority: "High",
      status: "In Progress",
    },
  ];

  const habits = [
    {
      id: 1,
      name: "Drink Water",
      icon: "water-outline",
      target: 8,
      current: 5,
      unit: "glasses",
      color: "#3B82F6",
      isCompleted: false,
    },
    {
      id: 2,
      name: "Morning Exercise",
      icon: "fitness-outline",
      target: 30,
      current: 30,
      unit: "minutes",
      color: "#10B981",
      isCompleted: true,
    },
    {
      id: 3,
      name: "Read Books",
      icon: "book-outline",
      target: 20,
      current: 12,
      unit: "pages",
      color: "#8B5CF6",
      isCompleted: false,
    },
    {
      id: 4,
      name: "Meditation",
      icon: "leaf-outline",
      target: 15,
      current: 0,
      unit: "minutes",
      color: "#F59E0B",
      isCompleted: false,
    },
  ];

  const reminders = [
    {
      id: 1,
      title: "Team Meeting",
      time: "10:00 AM",
      type: "meeting",
      isUrgent: true,
    },
    {
      id: 2,
      title: "Submit Project Report",
      time: "2:00 PM",
      type: "deadline",
      isUrgent: true,
    },
    {
      id: 3,
      title: "Call Client",
      time: "4:30 PM",
      type: "call",
      isUrgent: false,
    },
  ];

  const tasks = [
    {
      id: 1,
      name: "Complete UI Design Review",
      category: "Design Project",
      priority: "High",
      status: "pending",
      assignedTo: { id: 1, avatar: null, name: "John Doe" },
      dueTime: "11:30 AM",
    },
    {
      id: 2,
      name: "Update Database Schema",
      category: "Backend Development",
      priority: "Medium",
      status: "completed",
      assignedTo: { id: 2, avatar: null, name: "Jane Smith" },
      dueTime: "Completed",
    },
    {
      id: 3,
      name: "Client Presentation Prep",
      category: "Business Development",
      priority: "High",
      status: "pending",
      assignedTo: { id: 3, avatar: null, name: "Mike Johnson" },
      dueTime: "3:00 PM",
    },
  ];

  const navigation = useNavigation();

  // Static functions - no state changes
  const handleProfilePress = () => {
    Alert.alert("Profile", "Navigate to profile screen");
  };

  const handleNotificationPress = () => {
    Alert.alert("Notifications", "Show notifications");
  };

  const handleProjectPress = (project) => {
    Alert.alert("Project", `Navigate to ${project.name}`);
  };

  const handleTaskPress = (task) => {
    Alert.alert("Task", `Navigate to ${task.name}`);
  };

  const handleAddTask = () => {
    Alert.alert("Add Task", "Create new task");
  };

  const handleViewMore = (section) => {
    Alert.alert("View More", `Show more ${section}`);
  };

  const handleHabitPress = (habit) => {
    Alert.alert("Habit Tracker", `Update ${habit.name} progress`);
  };

  const handleReminderPress = (reminder) => {
    Alert.alert("Reminder", `${reminder.title} at ${reminder.time}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getHabitProgress = (habit) => {
    return Math.min((habit.current / habit.target) * 100, 100);
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case "meeting":
        return "people-outline";
      case "deadline":
        return "time-outline";
      case "call":
        return "call-outline";
      default:
        return "notifications-outline";
    }
  };

  const renderAvatar = (member, size = 32) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.avatar ? (
        <Image
          source={{ uri: member.avatar }}
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

  const renderProgressBar = (progress) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );

  const renderProjectItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.projectCard,
        index === 0 && styles.firstProjectCard,
        index === projects.length - 1 && styles.lastProjectCard,
      ]}
      onPress={() => handleProjectPress(item)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          <View style={styles.projectIconPattern}>
            <View style={[styles.patternLine, styles.patternLine1]} />
            <View style={[styles.patternLine, styles.patternLine2]} />
            <View style={[styles.patternLine, styles.patternLine3]} />
          </View>
          <View style={styles.projectIconBadge}>
            <Ionicons name="folder-outline" size={16} color="#1C30A4" />
          </View>
        </View>
        <TouchableOpacity style={styles.projectMenuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.projectCategory} numberOfLines={1}>
        {item.category}
      </Text>

      <View style={styles.projectStats}>
        <View style={styles.projectTeam}>
          <View style={styles.teamAvatars}>
            {item.teamMembers.slice(0, 3).map((member, memberIndex) => (
              <View
                key={member.id}
                style={[
                  styles.teamMember,
                  { marginLeft: memberIndex > 0 ? -8 : 0 },
                ]}
              >
                {renderAvatar(member, 24)}
              </View>
            ))}
            {item.teamMembers.length > 3 && (
              <View
                style={[
                  styles.teamMember,
                  styles.moreMembers,
                  { marginLeft: -8 },
                ]}
              >
                <Text style={styles.moreMembersText}>
                  +{item.teamMembers.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.projectPriority}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: getPriorityColor(item.priority) + "20",
              },
            ]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item.priority) },
              ]}
            >
              {item.priority}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <Text style={styles.projectStatus}>{item.status}</Text>
        {renderProgressBar(item.progress)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileContent}
            onPress={handleProfilePress}
          >
            <View style={styles.profileLeft}>
              <View style={styles.profileAvatarContainer}>
                {renderAvatar(user, 48)}
                {user.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>{user.role}</Text>
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
                onPress={handleNotificationPress}
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

        {/* Today's Overview Stats */}
        <View style={styles.statsSection}>
          <View style={styles.mainStatCard}>
            <View style={styles.mainStatHeader}>
              <Text style={styles.mainStatTitle}>Today's Progress</Text>
              <View style={styles.mainStatBadge}>
                <Ionicons name="trending-up" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.mainStatContent}>
              <Text style={styles.mainStatNumber}>87%</Text>
              <Text style={styles.mainStatLabel}>Overall Completion</Text>
            </View>
            <View style={styles.progressBarLarge}>
              <View style={styles.progressBarLargeBackground}>
                <View style={[styles.progressBarLargeFill, { width: "87%" }]} />
              </View>
            </View>
          </View>

          <View style={styles.miniStatsContainer}>
            <View style={styles.miniStatCardWhite}>
              <View style={styles.miniStatHeader}>
                <Text style={styles.miniStatTitle}>Completed</Text>
                <View
                  style={[
                    styles.miniStatBadge,
                    { backgroundColor: "#10B981" + "20" },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              </View>
              <Text style={[styles.miniStatNumber, { color: "#10B981" }]}>
                12
              </Text>
              <Text style={styles.miniStatDescription}>Tasks Done</Text>
              <View style={styles.miniProgressBarLarge}>
                <View
                  style={[
                    styles.miniProgressBarBackground,
                    { backgroundColor: "#10B981" + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.miniProgressBarFill,
                      { width: "70%", backgroundColor: "#10B981" },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.miniStatCardWhite}>
              <View style={styles.miniStatHeader}>
                <Text style={styles.miniStatTitle}>In Progress</Text>
                <View
                  style={[
                    styles.miniStatBadge,
                    { backgroundColor: "#F59E0B" + "20" },
                  ]}
                >
                  <Ionicons name="clock" size={16} color="#F59E0B" />
                </View>
              </View>
              <Text style={[styles.miniStatNumber, { color: "#F59E0B" }]}>
                5
              </Text>
              <Text style={styles.miniStatDescription}>Active Tasks</Text>
              <View style={styles.miniProgressBarLarge}>
                <View
                  style={[
                    styles.miniProgressBarBackground,
                    { backgroundColor: "#F59E0B" + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.miniProgressBarFill,
                      { width: "30%", backgroundColor: "#F59E0B" },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* Today's Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => handleViewMore("tasks")}>
              <Text style={styles.viewMoreText}>View All</Text>
            </TouchableOpacity>
          </View>

          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleTaskPress(task)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.name}</Text>
                <View
                  style={[
                    styles.taskBadge,
                    { backgroundColor: getPriorityColor(task.priority) + "15" },
                  ]}
                >
                  <Ionicons
                    name={
                      task.status === "completed" ? "checkmark-circle" : "time"
                    }
                    size={16}
                    color={getPriorityColor(task.priority)}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.taskTime,
                  { color: getPriorityColor(task.priority) },
                  task.status === "completed" && styles.taskTimeCompleted,
                ]}
              >
                {task.dueTime}
              </Text>

              <Text style={styles.taskDescription}>
                {task.category} • Assigned to {task.assignedTo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Reminders</Text>
            <TouchableOpacity onPress={() => handleViewMore("reminders")}>
              <Text style={styles.viewMoreText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remindersContainer}>
            {reminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.id}
                style={styles.reminderCard}
                onPress={() => handleReminderPress(reminder)}
              >
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <View
                    style={[
                      styles.reminderBadge,
                      {
                        backgroundColor: reminder.isUrgent
                          ? "#EF4444" + "15"
                          : "#3B82F6" + "15",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getReminderIcon(reminder.type)}
                      size={16}
                      color={reminder.isUrgent ? "#EF4444" : "#3B82F6"}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.reminderTime,
                    { color: reminder.isUrgent ? "#EF4444" : "#3B82F6" },
                  ]}
                >
                  {reminder.time}
                </Text>

                <Text style={styles.reminderDescription}>
                  {reminder.type === "meeting"
                    ? "Team collaboration session"
                    : reminder.type === "deadline"
                    ? "Submit your completed work"
                    : "Important client communication"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habits Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <TouchableOpacity onPress={() => handleViewMore("habits")}>
              <Text style={styles.viewMoreText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitsContainer}
          >
            {habits.map((habit, index) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitCard,
                  index === 0 && styles.firstHabitCard,
                  index === habits.length - 1 && styles.lastHabitCard,
                  habit.isCompleted && styles.completedHabitCard,
                ]}
                onPress={() => handleHabitPress(habit)}
              >
                <View style={styles.habitHeader}>
                  <View
                    style={[
                      styles.habitIcon,
                      { backgroundColor: habit.color + "20" },
                    ]}
                  >
                    <Ionicons name={habit.icon} size={24} color={habit.color} />
                  </View>
                  {habit.isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>

                <Text style={styles.habitName}>{habit.name}</Text>

                <View style={styles.habitProgress}>
                  <View style={styles.habitProgressBackground}>
                    <View
                      style={[
                        styles.habitProgressFill,
                        {
                          width: `${getHabitProgress(habit)}%`,
                          backgroundColor: habit.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.habitProgressText}>
                    {habit.current}/{habit.target} {habit.unit}
                  </Text>
                </View>

                <View style={styles.habitFooter}>
                  <Text
                    style={[
                      styles.habitProgressPercent,
                      { color: habit.color },
                    ]}
                  >
                    {Math.round(getHabitProgress(habit))}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Projects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity onPress={() => handleViewMore("projects")}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={projects}
            renderItem={renderProjectItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsFlatListContainer}
            style={styles.projectsFlatList}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainStatCard: {
    backgroundColor: "#1C30A4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  mainStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mainStatTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  mainStatBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  mainStatContent: {
    marginBottom: 12,
  },
  mainStatNumber: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 3,
  },
  mainStatLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  progressBarLarge: {
    marginTop: 6,
  },
  progressBarLargeBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  progressBarLargeFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  miniStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniStatCardWhite: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  miniStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  miniStatTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  miniStatBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  miniStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 3,
  },
  miniStatDescription: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 10,
  },
  miniProgressBarLarge: {
    marginTop: 2,
  },
  miniProgressBarBackground: {
    width: "100%",
    height: 5,
    borderRadius: 2.5,
  },
  miniProgressBarFill: {
    height: "100%",
    borderRadius: 2.5,
  },
  remindersContainer: {
    paddingHorizontal: 20,
  },
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  reminderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderTime: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  reminderDescription: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  reminderProgressBar: {
    marginTop: 1,
  },
  reminderProgressBackground: {
    width: "100%",
    height: 4,
    borderRadius: 2,
  },
  reminderProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  habitsContainer: {
    paddingLeft: 20,
  },
  habitCard: {
    backgroundColor: "#fff",
    width: 160,
    marginRight: 16,
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
  },
  firstHabitCard: {},
  lastHabitCard: {
    marginRight: 20,
  },
  completedHabitCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    width: 20,
    height: 20,
    backgroundColor: "#10B981",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  habitName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  habitProgress: {
    marginBottom: 12,
  },
  habitProgressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    marginBottom: 6,
  },
  habitProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  habitProgressText: {
    fontSize: 11,
    color: "#6B7280",
  },
  habitFooter: {
    alignItems: "flex-end",
  },
  habitProgressPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 20,
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#6B7280",
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  viewMoreText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
  },
  projectsFlatList: {
    marginBottom: 8,
  },
  projectsFlatListContainer: {
    paddingLeft: 20,
  },
  projectCard: {
    backgroundColor: "#fff",
    width: 320,
    marginRight: 16,
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
  },
  firstProjectCard: {},
  lastProjectCard: {
    marginRight: 20,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  projectIconPattern: {
    flex: 1,
    padding: 8,
  },
  patternLine: {
    height: 2,
    backgroundColor: "#1C30A4",
    marginVertical: 1,
    borderRadius: 1,
  },
  patternLine1: {
    width: "60%",
  },
  patternLine2: {
    width: "40%",
  },
  patternLine3: {
    width: "80%",
  },
  projectIconBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
  },
  projectMenuButton: {
    padding: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    lineHeight: 22,
  },
  projectCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  projectStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  projectTeam: {
    flex: 1,
  },
  teamAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamMember: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
  },
  moreMembers: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  projectPriority: {
    marginLeft: 12,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectStatus: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBackground: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C30A4",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C30A4",
  },
  taskCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  taskBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  taskTime: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  taskTimeCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskDescription: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskProgressBar: {
    flex: 1,
    marginRight: 10,
  },
  taskProgressBackground: {
    width: "100%",
    height: 3,
    borderRadius: 1.5,
  },
  taskProgressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  taskAssignee: {
    // Avatar styling handled by renderAvatar function
  },
  addButton: {
    backgroundColor: "#1C30A4",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Home;
