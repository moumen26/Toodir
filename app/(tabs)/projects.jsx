import React, { useState } from "react";
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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const navigation = useNavigation();

  // Extended projects data
  const projects = [
    {
      id: 1,
      name: "E-commerce Mobile App",
      category: "Mobile Development",
      progress: 75,
      teamMembers: [
        { id: 1, avatar: null, name: "John Doe" },
        { id: 2, avatar: null, name: "Jane Smith" },
        { id: 3, avatar: null, name: "Mike Johnson" },
      ],
      priority: "High",
      status: "In Progress",
      dueDate: "2025-01-15",
      description: "Complete mobile shopping platform with payment integration",
      tasksCompleted: 18,
      totalTasks: 24,
      client: "TechCorp Inc.",
    },
    {
      id: 2,
      name: "Dashboard Analytics UI",
      category: "UI/UX Design",
      progress: 90,
      teamMembers: [
        { id: 4, avatar: null, name: "Sarah Wilson" },
        { id: 5, avatar: null, name: "Alex Chen" },
      ],
      priority: "Medium",
      status: "Review",
      dueDate: "2025-01-08",
      description:
        "Modern analytics dashboard with real-time data visualization",
      tasksCompleted: 27,
      totalTasks: 30,
      client: "DataFlow Solutions",
    },
    {
      id: 3,
      name: "Website Redesign",
      category: "Web Development",
      progress: 45,
      teamMembers: [
        { id: 6, avatar: null, name: "Emma Davis" },
        { id: 7, avatar: null, name: "Tom Brown" },
        { id: 8, avatar: null, name: "Lisa Garcia" },
        { id: 9, avatar: null, name: "Ryan Lee" },
      ],
      priority: "High",
      status: "In Progress",
      dueDate: "2025-02-01",
      description:
        "Complete website overhaul with modern design and improved UX",
      tasksCompleted: 12,
      totalTasks: 28,
      client: "Creative Agency",
    },
    {
      id: 4,
      name: "API Integration",
      category: "Backend Development",
      progress: 100,
      teamMembers: [
        { id: 10, avatar: null, name: "David Kim" },
        { id: 11, avatar: null, name: "Maria Rodriguez" },
      ],
      priority: "Low",
      status: "Completed",
      dueDate: "2024-12-20",
      description: "RESTful API integration with third-party services",
      tasksCompleted: 15,
      totalTasks: 15,
      client: "StartupXYZ",
    },
    {
      id: 5,
      name: "Mobile Game Development",
      category: "Game Development",
      progress: 30,
      teamMembers: [
        { id: 12, avatar: null, name: "Chris Taylor" },
        { id: 13, avatar: null, name: "Anna White" },
        { id: 14, avatar: null, name: "James Miller" },
      ],
      priority: "Medium",
      status: "Planning",
      dueDate: "2025-03-15",
      description: "Casual puzzle game with multiplayer functionality",
      tasksCompleted: 8,
      totalTasks: 25,
      client: "GameStudio Pro",
    },
    {
      id: 6,
      name: "Cloud Migration",
      category: "DevOps",
      progress: 65,
      teamMembers: [
        { id: 15, avatar: null, name: "Kevin Zhang" },
        { id: 16, avatar: null, name: "Sophie Turner" },
      ],
      priority: "High",
      status: "In Progress",
      dueDate: "2025-01-25",
      description: "Migrate existing infrastructure to cloud platform",
      tasksCompleted: 13,
      totalTasks: 20,
      client: "Enterprise Corp",
    },
  ];

  const filters = ["All", "In Progress", "Review", "Completed", "Planning"];

  // Filter projects based on search and selected filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "All" || project.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleProjectPress = (project) => {
    router.push(`/ProjectDetails?projectId=${project.id}`);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10B981";
      case "in progress":
        return "#3B82F6";
      case "review":
        return "#8B5CF6";
      case "planning":
        return "#F59E0B";
      default:
        return "#6B7280";
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

  const renderProjectCard = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
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
      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.projectInfo}>
        <View style={styles.projectInfoItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>{item.client}</Text>
        </View>
        <View style={styles.projectInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>{item.dueDate}</Text>
        </View>
      </View>

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
        <View style={styles.projectBadges}>
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
        <View style={styles.projectProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.tasksText}>
              {item.tasksCompleted}/{item.totalTasks} tasks
            </Text>
            <Text style={styles.progressPercent}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${item.progress}%` }]}
              />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(item.status) + "20",
            },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Projects</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{projects.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage your team projects</Text>
        </View>
        <View style={styles.headerRight}>
          {/* <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter-outline" size={20} color="#6B7280" />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateProject/index")}
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
            placeholder="Search projects, clients, or categories..."
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

      {/* Projects Overview Stats as Filters */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Projects</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsScrollView}
        >
          {/* All Projects Filter */}
          <TouchableOpacity
            style={[
              styles.progressStatCard,
              selectedFilter === "All" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("All")}
          >
            <View style={styles.progressCardHeader}>
              <View style={styles.progressIcon}>
                <Ionicons name="trending-up" size={12} color="#1C30A4" />
              </View>
              <Text style={styles.progressCardTitle}>All Projects</Text>
            </View>
            <Text style={styles.progressCardNumber}>
              {Math.round(
                projects.reduce((acc, p) => acc + p.progress, 0) /
                  projects.length
              )}
              %
            </Text>
            <View style={styles.progressCardBar}>
              <View style={styles.progressCardBackground}>
                <View
                  style={[
                    styles.progressCardFill,
                    {
                      width: `${Math.round(
                        projects.reduce((acc, p) => acc + p.progress, 0) /
                          projects.length
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressCardSubtext}>Avg Progress</Text>
          </TouchableOpacity>

          {/* Completed Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
              selectedFilter === "Completed" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Completed")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#10B981" }]}
              >
                <Ionicons name="checkmark-circle" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#10B981" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#10B981" }]}>
              {projects.filter((p) => p.status === "Completed").length}
            </Text>
            <Text style={styles.statCardLabel}>Done</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#10B981" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (projects.filter((p) => p.status === "Completed")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* In Progress Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
              selectedFilter === "In Progress" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("In Progress")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#3B82F6" }]}
              >
                <Ionicons name="time" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#3B82F6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#3B82F6" }]}>
              {projects.filter((p) => p.status === "In Progress").length}
            </Text>
            <Text style={styles.statCardLabel}>Active</Text>
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
                        (projects.filter((p) => p.status === "In Progress")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Review Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F5F3FF", borderColor: "#8B5CF6" },
              selectedFilter === "Review" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Review")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#8B5CF6" }]}
              >
                <Ionicons name="eye" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="remove" size={8} color="#8B5CF6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#8B5CF6" }]}>
              {projects.filter((p) => p.status === "Review").length}
            </Text>
            <Text style={styles.statCardLabel}>Review</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#8B5CF6" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (projects.filter((p) => p.status === "Review").length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#8B5CF6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Planning Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FFFBEB", borderColor: "#F59E0B" },
              selectedFilter === "Planning" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Planning")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#F59E0B" }]}
              >
                <Ionicons name="construct" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-down" size={8} color="#F59E0B" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#F59E0B" }]}>
              {projects.filter((p) => p.status === "Planning").length}
            </Text>
            <Text style={styles.statCardLabel}>Plan</Text>
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
                        (projects.filter((p) => p.status === "Planning")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.projectsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No projects found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  searchContainer: {
    marginTop: 10,
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
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    lineHeight: 24,
  },
  projectCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 12,
  },
  projectInfo: {
    marginBottom: 16,
  },
  projectInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
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
  projectBadges: {
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
    alignItems: "flex-end",
  },
  projectProgress: {
    flex: 1,
    marginRight: 12,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tasksText: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C30A4",
  },
  progressBar: {
    width: "100%",
  },
  progressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C30A4",
    borderRadius: 3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
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
});

export default Projects;
