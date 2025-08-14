// ProjectDetails/index.jsx
import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { useProject, useProjectStats } from "../hooks/useProjectQueries";
import Constants from 'expo-constants';

// Get API URL from Expo Constants
const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const ProjectDetails = () => {
  const [selectedTab, setSelectedTab] = useState("Overview");
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams();
  
  // Fetch project data
  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProject(projectId);  

  // Fetch project statistics
  const {
    data: statsData,
    isLoading: isStatsLoading,
  } = useProjectStats(projectId);

  const project = projectData?.data;
  const average_progress = projectData?.average_progress;
  
  const stats = statsData?.data;

  const tabs = ["Overview", "Tasks", "Team", "Files"];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditProject = () => {
    Alert.alert("Edit Project", "Navigate to edit project screen");
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return "#10B981";
      case "active":
      case "in progress":
      case "in-progress":
        return "#3B82F6";
      case "review":
        return "#8B5CF6";
      case "planning":
      case "pending":
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
      {member.profile_picture ? (
        <Image
          source={{ uri:`${FILES_URL}${member.profile_picture}` }}
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Project Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{average_progress || 0}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${average_progress || 0}%` }
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{project?.tasks?.length || 0}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{project?.members?.length || 0}</Text>
          <Text style={styles.statLabel}>Team</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {project?.description || 'No description available'}
        </Text>
      </View>

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{formatDate(project?.start_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>End Date</Text>
            <Text style={styles.detailValue}>{formatDate(project?.end_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Owner</Text>
            <Text style={styles.detailValue}>{project?.owner?.full_name || 'Unknown'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="flag-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={[styles.detailValue, { color: getPriorityColor(project?.priority) }]}>
              {project?.priority || 'Low'}
            </Text>
          </View>
        </View>
      </View>

      {/* Project Images */}
      {project?.images && project?.images?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {project.images.map((image, index) => (
              <View key={image.id} style={styles.imageContainer}>
                <Image source={{ uri: `${FILES_URL}${image.image_url}` }} style={styles.projectDetailImage} />
                {image.is_primary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks ({project?.tasks?.length || 0})</Text>
      </View>

      {project?.tasks && project.tasks.length > 0 ? (
        project?.tasks?.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) + "20" },
                ]}
              >
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(task.priority) },
                  ]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(task.priority) },
                  ]}
                >
                  {task.priority || 'Low'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.taskDescription}>{task.description}</Text>
            
            <View style={styles.taskDetails}>
              <View style={styles.taskLeftDetails}>
                <View style={styles.taskDetail}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.taskDetailText}>{formatDate(task.end_date)}</Text>
                </View>
                {task?.assignedUsers && task?.assignedUsers?.length > 0 && (
                  <View style={styles.taskDetail}>
                    <Ionicons name="person-outline" size={12} color="#6B7280" />
                    <Text style={styles.taskDetailText}>
                      {task?.assignedUsers[0]?.full_name}
                      {task?.assignedUsers?.length > 1 && ` +${task?.assignedUsers?.length - 1}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No tasks available</Text>
        </View>
      )}
    </View>
  );

  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        Team Members ({project?.members?.length || 0})
      </Text>
      
      {project?.members && project?.members?.length > 0 ? (
        project?.members?.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberAvatarContainer}>
                {renderAvatar(member, 40)}
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.full_name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No team members</Text>
        </View>
      )}
    </View>
  );

  const renderFilesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Project Files</Text>
      <View style={styles.emptyState}>
        <Ionicons name="folder-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>File management coming soon</Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Overview":
        return renderOverviewTab();
      case "Tasks":
        return renderTasksTab();
      case "Team":
        return renderTeamTab();
      case "Files":
        return renderFilesTab();
      default:
        return renderOverviewTab();
    }
  };

  if (isProjectLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (projectError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load project</Text>
          <Text style={styles.errorText}>
            {projectError.message || "Something went wrong"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchProject}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="folder-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Project not found</Text>
          <Text style={styles.errorText}>
            The project you're looking for doesn't exist or has been deleted.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <TouchableOpacity onPress={handleEditProject} style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#1C30A4" />
        </TouchableOpacity>
      </View>

      {/* Project Header Card */}
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          {project?.images && project?.images?.length > 0 ? (
            <Image
              source={{ uri: `${FILES_URL}${project?.images?.find(img => img.is_primary)?.image_url || project.images[0].image_url}` }}
              style={styles.projectHeaderImage}
            />
          ) : (
            <>
              <View style={styles.projectIconPattern}>
                <View style={[styles.patternLine, styles.patternLine1]} />
                <View style={[styles.patternLine, styles.patternLine2]} />
                <View style={[styles.patternLine, styles.patternLine3]} />
              </View>
              <View style={styles.projectIconBadge}>
                <Ionicons name="folder-outline" size={16} color="#1C30A4" />
              </View>
            </>
          )}
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{project.title}</Text>
          <Text style={styles.projectCategory}>
            {project?.tags && project?.tags?.length > 0 
              ? project?.tags[0]?.name 
              : 'General Project'
            }
          </Text>
          <View style={styles.projectMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(project.priority) + "20" },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(project.priority) },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(project.priority) },
                ]}
              >
                {project.priority || 'Low'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  editButton: {
    padding: 8,
  },
  projectHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    marginRight: 16,
  },
  projectHeaderImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  projectIconPattern: {
    flex: 1,
    padding: 10,
  },
  patternLine: {
    height: 3,
    backgroundColor: "#1C30A4",
    marginVertical: 2,
    borderRadius: 1.5,
  },
  patternLine1: { width: "70%" },
  patternLine2: { width: "50%" },
  patternLine3: { width: "90%" },
  projectIconBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  projectMeta: {
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
    fontSize: 12,
    fontWeight: "500",
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: "#1C30A4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -2,
    height: 2,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C30A4",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
  },
  progressBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C30A4",
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  projectDetailImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  primaryBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#1C30A4",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
    marginRight: 12,
  },
  taskDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 16,
  },
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskLeftDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  taskDetailText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatarContainer: {
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
});

export default ProjectDetails;