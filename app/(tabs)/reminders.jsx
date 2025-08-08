import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

const Reminders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const navigation = useNavigation();

  // Mock user data
  const user = {
    name: "Mouad Roukil",
    role: "Full Stack Developer",
    avatar: null,
    verified: true,
  };

  // Mock reminders data following your structure
  const reminders = [
    // Today's reminders
    {
      id: 1,
      title: "Team Meeting",
      description: "Weekly team standup and project updates",
      category: "Work",
      priority: "High",
      status: "pending",
      type: "meeting",
      time: "10:00 AM",
      date: "2025-01-08",
      isToday: true,
      isFlagged: false,
      listType: "Bills",
      color: "#3B82F6",
      icon: "people-outline",
      tags: ["Meeting", "Team"],
    },
    {
      id: 2,
      title: "Submit Project Report",
      description: "Final project deliverables and documentation",
      category: "Work",
      priority: "High",
      status: "pending",
      type: "deadline",
      time: "2:00 PM",
      date: "2025-01-08",
      isToday: true,
      isFlagged: true,
      listType: "Bills",
      color: "#EF4444",
      icon: "document-text-outline",
      tags: ["Deadline", "Project"],
    },
    {
      id: 3,
      title: "Call Client",
      description: "Follow up on project requirements",
      category: "Business",
      priority: "Medium",
      status: "pending",
      type: "call",
      time: "4:30 PM",
      date: "2025-01-08",
      isToday: true,
      isFlagged: false,
      listType: "Bills",
      color: "#10B981",
      icon: "call-outline",
      tags: ["Client", "Call"],
    },

    // Scheduled reminders
    {
      id: 4,
      title: "Doctor Appointment",
      description: "Annual health checkup",
      category: "Health",
      priority: "High",
      status: "scheduled",
      type: "appointment",
      time: "9:00 AM",
      date: "2025-01-10",
      isToday: false,
      isFlagged: false,
      listType: "Medicines",
      color: "#EC4899",
      icon: "medical-outline",
      tags: ["Health", "Doctor"],
    },
    {
      id: 5,
      title: "Pay Internet Bill",
      description: "Monthly internet service payment",
      category: "Bills",
      priority: "Medium",
      status: "scheduled",
      type: "payment",
      time: "12:00 PM",
      date: "2025-01-12",
      isToday: false,
      isFlagged: false,
      listType: "Bills",
      color: "#F59E0B",
      icon: "card-outline",
      tags: ["Bills", "Payment"],
    },
    {
      id: 6,
      title: "Final Exam Preparation",
      description: "Review materials for computer science final",
      category: "Education",
      priority: "High",
      status: "scheduled",
      type: "study",
      time: "6:00 PM",
      date: "2025-01-15",
      isToday: false,
      isFlagged: true,
      listType: "Exams",
      color: "#8B5CF6",
      icon: "school-outline",
      tags: ["Study", "Exam"],
    },
    {
      id: 7,
      title: "Submit Assignment",
      description: "Database systems coursework submission",
      category: "Education",
      priority: "High",
      status: "scheduled",
      type: "assignment",
      time: "11:59 PM",
      date: "2025-01-20",
      isToday: false,
      isFlagged: false,
      listType: "Coursework",
      color: "#10B981",
      icon: "document-outline",
      tags: ["Assignment", "School"],
    },
  ];

  // Group reminders by status
  const todayReminders = reminders.filter((r) => r.isToday);
  const scheduledReminders = reminders.filter(
    (r) => !r.isToday && r.status === "scheduled"
  );
  const flaggedReminders = reminders.filter((r) => r.isFlagged);
  const completedReminders = reminders.filter((r) => r.status === "completed");

  // My Lists data
  const myLists = [
    {
      id: 1,
      name: "Bills",
      icon: "receipt-outline",
      color: "#3B82F6",
      count: reminders.filter((r) => r.listType === "Bills").length,
    },
    {
      id: 2,
      name: "Medicines",
      icon: "medical-outline",
      color: "#EC4899",
      count: reminders.filter((r) => r.listType === "Medicines").length,
    },
    {
      id: 3,
      name: "Exams",
      icon: "school-outline",
      color: "#6B7280",
      count: reminders.filter((r) => r.listType === "Exams").length,
    },
    {
      id: 4,
      name: "Coursework",
      icon: "library-outline",
      color: "#10B981",
      count: reminders.filter((r) => r.listType === "Coursework").length,
    },
  ];

  const filters = ["All", "today", "scheduled", "flagged", "completed"];

  // Filter reminders based on search and selected filter
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "today" && reminder.isToday) ||
      (selectedFilter === "scheduled" && reminder.status === "scheduled") ||
      (selectedFilter === "flagged" && reminder.isFlagged) ||
      (selectedFilter === "completed" && reminder.status === "completed");

    return matchesSearch && matchesFilter;
  });

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const handleReminderPress = (reminder) => {
    router.push(`/ReminderDetails?reminderId=${reminder.id}`);
  };

  const handleListPress = (list) => {
    router.push(`/RemindersList?listType=${list.name}`);
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return "people-outline";
      case "deadline":
        return "time-outline";
      case "call":
        return "call-outline";
      case "appointment":
        return "calendar-outline";
      case "payment":
        return "card-outline";
      case "study":
        return "book-outline";
      case "assignment":
        return "document-text-outline";
      default:
        return "notifications-outline";
    }
  };

  const renderAvatar = (size = 32) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
    </View>
  );

  const renderReminderCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        item.isFlagged && styles.flaggedReminderCard,
        item.status === "completed" && styles.completedReminderCard,
      ]}
      onPress={() => handleReminderPress(item)}
    >
      {/* Flagged Badge */}
      {item.isFlagged && (
        <View style={styles.flaggedBadge}>
          <Ionicons name="flag" size={12} color="#fff" />
          <Text style={styles.flaggedBadgeText}>FLAGGED</Text>
        </View>
      )}

      <View style={styles.reminderHeader}>
        <View style={styles.reminderHeaderLeft}>
          <View style={styles.reminderIcon}>
            <View
              style={[
                styles.reminderIconBackground,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons
                name={getTypeIcon(item.type)}
                size={20}
                color={item.color}
              />
            </View>
          </View>
          <View style={styles.reminderHeaderInfo}>
            <Text
              style={[
                styles.reminderTitle,
                item.isFlagged && styles.flaggedReminderTitle,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.reminderCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.reminderHeaderRight}>
          <View style={styles.reminderTime}>
            <Text style={[styles.timeText, { color: item.color }]}>
              {item.time}
            </Text>
            <Text style={styles.timeLabel}>
              {item.isToday
                ? "Today"
                : new Date(item.date).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
            </Text>
          </View>
          <TouchableOpacity style={styles.reminderMenuButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.reminderDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.reminderInfo}>
        <View style={styles.reminderInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.reminderInfoText}>{item.date}</Text>
        </View>
        <View style={styles.reminderInfoItem}>
          <Ionicons name="folder-outline" size={14} color="#6B7280" />
          <Text style={styles.reminderInfoText}>{item.listType}</Text>
        </View>
        <View style={styles.reminderInfoItem}>
          <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
          <Text style={styles.reminderInfoText}>{item.type}</Text>
        </View>
      </View>

      {/* Reminder Tags */}
      <View style={styles.reminderTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.reminderTag}>
            <Text style={styles.reminderTagText}>{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <View style={styles.reminderTag}>
            <Text style={styles.reminderTagText}>+{item.tags.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.reminderFooter}>
        <View style={styles.reminderFooterLeft}>
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
        <View style={styles.reminderFooterRight}>
          <Text style={styles.reminderStatus}>
            {item.isToday ? "Due Today" : "Scheduled"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMyListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleListPress(item)}
    >
      <View style={styles.listCardContent}>
        <View style={[styles.listIcon, { backgroundColor: item.color + "20" }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={styles.listName}>{item.name}</Text>
      </View>
      <View style={styles.listCount}>
        <Text style={[styles.listCountText, { color: item.color }]}>
          {item.count}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Reminders</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{reminders.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Never miss important tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateReminder/index")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reminders, categories, or tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Overview Stats as Filters */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Reminders</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsScrollView}
        >
          {/* All Reminders Filter */}
          <TouchableOpacity
            style={[
              styles.progressStatCard,
              selectedFilter === "All" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("All")}
          >
            <View style={styles.progressCardHeader}>
              <View style={styles.progressIcon}>
                <Ionicons name="list" size={12} color="#1C30A4" />
              </View>
              <Text style={styles.progressCardTitle}>All Reminders</Text>
            </View>
            <Text style={styles.progressCardNumber}>{reminders.length}</Text>
            <View style={styles.progressCardBar}>
              <View style={styles.progressCardBackground}>
                <View style={[styles.progressCardFill, { width: "100%" }]} />
              </View>
            </View>
            <Text style={styles.progressCardSubtext}>Total</Text>
          </TouchableOpacity>

          {/* Today Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
              selectedFilter === "today" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("today")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#3B82F6" }]}
              >
                <Ionicons name="today" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#3B82F6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#3B82F6" }]}>
              {todayReminders.length}
            </Text>
            <Text style={styles.statCardLabel}>Today</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#3B82F6" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (todayReminders.length / reminders.length) * 100
                      }%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Scheduled Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FFFBEB", borderColor: "#F59E0B" },
              selectedFilter === "scheduled" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("scheduled")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#F59E0B" }]}
              >
                <Ionicons name="calendar" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="remove" size={8} color="#F59E0B" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#F59E0B" }]}>
              {scheduledReminders.length}
            </Text>
            <Text style={styles.statCardLabel}>Scheduled</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#F59E0B" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (scheduledReminders.length / reminders.length) * 100
                      }%`,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Flagged Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
              selectedFilter === "flagged" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("flagged")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#EF4444" }]}
              >
                <Ionicons name="flag" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-down" size={8} color="#EF4444" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#EF4444" }]}>
              {flaggedReminders.length}
            </Text>
            <Text style={styles.statCardLabel}>Flagged</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#EF4444" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (flaggedReminders.length / reminders.length) * 100
                      }%`,
                      backgroundColor: "#EF4444",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* My Lists Section */}
        <View style={styles.myListsSection}>
          <Text style={styles.sectionTitle}>My Lists</Text>
          <FlatList
            data={myLists}
            renderItem={renderMyListItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Reminders List */}
        <FlatList
          data={filteredReminders}
          renderItem={renderReminderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.remindersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateTitle}>No reminders found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* Floating Action Button */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateReminder/index")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity> */}
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
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 8,
  },
  headerBadge: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#1C30A4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    marginBottom: 16,
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  statsScrollView: {
    marginBottom: 0,
  },
  statsScrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  progressStatCard: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    width: 110,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeFilterCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressIcon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  progressCardTitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  progressCardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  progressCardBar: {
    marginBottom: 4,
  },
  progressCardBackground: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
  progressCardFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 1.5,
  },
  progressCardSubtext: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    width: 80,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statCardIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardTrend: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  statCardProgress: {
    marginTop: "auto",
  },
  statCardProgressBg: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  statCardProgressFill: {
    height: "100%",
    borderRadius: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  myListsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  listCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  listCountText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  remindersSection: {
    paddingHorizontal: 20,
  },
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  flaggedReminderCard: {
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  completedReminderCard: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  flaggedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  flaggedBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reminderHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  reminderIcon: {
    marginRight: 12,
  },
  reminderIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderHeaderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  flaggedReminderTitle: {
    color: "#DC2626",
  },
  reminderCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  reminderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderTime: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timeLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  reminderMenuButton: {
    padding: 6,
  },
  reminderDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 52,
  },
  reminderInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  reminderInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  reminderInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  reminderTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  reminderTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  reminderTagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 11,
    fontWeight: "600",
  },
  reminderFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  remindersList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
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
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1C30A4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default Reminders;
