// ProjectDetails/index.jsx - Updated with enhanced edit functionality
import { useState, useMemo, useCallback } from "react";
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
  FlatList,
  Platform,
} from "react-native";
import { router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { useProject, useProjectStats } from "../hooks/useProjectQueries";
import { useProjectTasks } from "../hooks/useTaskQueries";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStatus } from "../hooks/useAuth";
import TaskCard from '../components/TaskCard';
import SwipeableMemberCard from '../components/SwipeableMemberCard';
import ProjectMembersPopup from '../components/ProjectMembersPopup';
import projectMemberService from '../services/projectMemberService';
import Constants from 'expo-constants';

const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const ProjectDetails = () => {
  const { user } = useAuthStatus();
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState("all");
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  
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

  // Fetch project tasks
  const {
    data: projectTasksData,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useProjectTasks(projectId);

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberID) => {      
      return projectMemberService.removeProjectMember(memberID, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.log('Remove member error:', error);
    },
  });
  
  const project = projectData?.data;
  const average_progress = projectData?.average_progress;
  const stats = statsData?.data;
  const projectTasks = projectTasksData?.data || [];
  const isOwner = user?.id == project?.owner_id;
  const canEdit = isOwner; // Add more complex permission logic here if needed

  const tabs = ["Overview", "Tasks", "Team"];

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toProjectUpdate = useCallback((projectId, options = {}) => {
    if (!projectId) {
      Alert.alert('Error', 'Project ID is required');
      return;
    }
    
    const route = `/UpdateProject?projectId=${projectId}`;
    
    // Check if user has permission (optional callback)
    if (options.checkPermission && typeof options.checkPermission === 'function') {
      const hasPermission = options.checkPermission();
      if (!hasPermission) {
        Alert.alert('Access Denied', 'You don\'t have permission to edit this project');
        return;
      }
    }
    
    // Show confirmation if there are unsaved changes elsewhere
    if (options.confirmNavigation) {
      Alert.alert(
        'Navigate to Edit',
        'Are you sure you want to navigate to edit this project?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              if (options.replace) {
                router.replace(route);
              } else {
                router.push(route);
              }
            }
          },
        ]
      );
    } else {
      if (options.replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
    }
  }, [canEdit, projectId]);

  // Enhanced edit project handler
  const handleEditProject = useCallback(() => {
    if (!canEdit) {
      Alert.alert(
        "Access Denied", 
        "You don't have permission to edit this project.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!project) {
      Alert.alert("Error", "Project data not loaded");
      return;
    }

    // For now, directly navigate to update screen
    toProjectUpdate(project.id, {
      checkPermission: () => canEdit
    });
  }, [canEdit, project, projectId]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate("CreateTask/index");
  }, [projectId]);

  const handleTaskPress = useCallback((task) => {
  }, []);

  const handleTaskFilterChange = useCallback((filter) => {
    setSelectedTaskFilter(filter);
  }, []);

  const handleRemoveMember = async (member) => {        
    if (member.id === project?.owner_id) {
      Alert.alert('Cannot Remove Owner', 'The project owner cannot be removed from the project.');
      return;
    }

    if (member.id === user?.id) {
      Alert.alert('Cannot Remove Yourself', 'You cannot remove yourself from the project. Transfer ownership first if needed.');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Remove ${member.full_name} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingMember(member.id);
              await removeMemberMutation.mutateAsync(member.id);
              Alert.alert(
                'Success',
                `${member.full_name} has been removed from the project.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to remove member',
                [{ text: 'OK' }]
              );
            } finally {
              setRemovingMember(null);
            }
          }
        }
      ]
    );
  };

  const handleAddMembers = useCallback(() => {
    setShowMembersPopup(true);
  }, []);

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    if (!projectTasks.length) return [];
    
    switch (selectedTaskFilter) {
      case "active":
        return projectTasks.filter(task => !task.closed && !task.is_overdue);
      case "completed":
        return projectTasks.filter(task => task.closed);
      case "overdue":
        return projectTasks.filter(task => task.is_overdue && !task.closed);
      case "upcoming":
        return projectTasks.filter(task => {
          if (!task.start_date) return false;
          const startDate = new Date(task.start_date);
          const now = new Date();
          return startDate > now;
        });
      case "high":
      case "medium":
      case "low":
        return projectTasks.filter(task => task.priority?.toLowerCase() === selectedTaskFilter);
      default:
        return projectTasks;
    }
  }, [projectTasks, selectedTaskFilter]);

  const getPriorityColor = useCallback((priority) => {
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
  }, []);

  const renderAvatar = useCallback((member, size = 32) => (    
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {member.profile_picture ? (
        <Image
          source={{ uri:`${FILES_URL}${member.profile_picture}` }}
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  ), []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Calculate task statistics
  const taskStats = useMemo(() => {
    if (stats?.task_summary) {
      return {
        total: stats.task_summary.total_tasks,
        completed: stats.task_summary.closed_tasks,
        active: stats.task_summary.active_tasks,
        overdue: stats.task_summary.overdue_tasks,
        high: stats.task_breakdown?.by_priority?.high || 0,
        medium: stats.task_breakdown?.by_priority?.medium || 0,
        low: stats.task_breakdown?.by_priority?.low || 0,
        completion_rate: stats.task_summary.progress_percentage,
        overdue_rate: stats.performance_metrics?.overdue_rate || 0,
        efficiency_score: stats.performance_metrics?.efficiency_score || 0,
      };
    }
    
    if (!projectTasks.length) return {};
    
    const total = projectTasks.length;
    const completed = projectTasks.filter(task => task.closed).length;
    const active = projectTasks.filter(task => !task.closed && !task.is_overdue).length;
    const overdue = projectTasks.filter(task => task.is_overdue && !task.closed).length;
    const high = projectTasks.filter(task => task.priority?.toLowerCase() === 'high').length;
    const medium = projectTasks.filter(task => task.priority?.toLowerCase() === 'medium').length;
    const low = projectTasks.filter(task => task.priority?.toLowerCase() === 'low').length;
    
    return {
      total,
      completed,
      active,
      overdue,
      high,
      medium,
      low,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      overdue_rate: total > 0 ? Math.round((overdue / total) * 100) : 0,
      efficiency_score: total > 0 ? Math.round(((completed / total) * (100 - (overdue / total) * 100)) / 100 * 100) : 100,
    };
  }, [stats, projectTasks]);

  // Render functions for different tabs...
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Project Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats?.task_summary?.progress_percentage || average_progress || 0}%
          </Text>
          <Text style={styles.statLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats?.task_summary?.progress_percentage || average_progress || 0}%` }
                ]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{taskStats.total || 0}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats?.project_resources?.total_members || project?.members?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Team</Text>
        </View>
      </View>

      {/* Enhanced Stats Row */}
      <View style={styles.enhancedStatsContainer}>
        <View style={styles.enhancedStatCard}>
          <View style={styles.enhancedStatIcon}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
          </View>
          <View style={styles.enhancedStatInfo}>
            <Text style={styles.enhancedStatNumber}>{taskStats.efficiency_score || 0}%</Text>
            <Text style={styles.enhancedStatLabel}>Efficiency</Text>
          </View>
        </View>
        
        <View style={styles.enhancedStatCard}>
          <View style={styles.enhancedStatIcon}>
            <Ionicons name="warning" size={20} color="#EF4444" />
          </View>
          <View style={styles.enhancedStatInfo}>
            <Text style={styles.enhancedStatNumber}>{taskStats.overdue_rate || 0}%</Text>
            <Text style={styles.enhancedStatLabel}>Overdue</Text>
          </View>
        </View>

        {stats?.timeline && (
          <View style={styles.enhancedStatCard}>
            <View style={styles.enhancedStatIcon}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <View style={styles.enhancedStatInfo}>
              <Text style={styles.enhancedStatNumber}>{stats.timeline.days_remaining}</Text>
              <Text style={styles.enhancedStatLabel}>Days Left</Text>
            </View>
          </View>
        )}
      </View>

      {/* Project Details and other sections... */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {project?.description || 'No description available'}
        </Text>
      </View>

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
                <Image 
                  source={{ uri: `${FILES_URL}${image.image_url}` }} 
                  style={styles.projectDetailImage} 
                />
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

  // Tasks tab render function
  const renderTasksTab = () => {
    const renderTaskFilters = () => (
      <View style={styles.taskFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.taskFiltersContent}
        >
          {[
            { id: "all", name: "All", count: taskStats.total },
            { id: "active", name: "Active", count: taskStats.active },
            { id: "completed", name: "Completed", count: taskStats.completed },
            { id: "overdue", name: "Overdue", count: taskStats.overdue },
            { id: "high", name: "High", count: taskStats.high },
            { id: "medium", name: "Medium", count: taskStats.medium },
            { id: "low", name: "Low", count: taskStats.low },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.taskFilterChip,
                selectedTaskFilter === filter.id && styles.activeTaskFilterChip,
              ]}
              onPress={() => handleTaskFilterChange(filter.id)}
            >
              <Text
                style={[
                  styles.taskFilterText,
                  selectedTaskFilter === filter.id && styles.activeTaskFilterText,
                ]}
              >
                {filter.name}
              </Text>
              <View style={[
                styles.taskFilterBadge,
                selectedTaskFilter === filter.id && styles.activeTaskFilterBadge,
              ]}>
                <Text style={[
                  styles.taskFilterBadgeText,
                  selectedTaskFilter === filter.id && styles.activeTaskFilterBadgeText,
                ]}>
                  {filter.count || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );

    const renderTaskItem = ({ item: task, index }) => (
      <TaskCard
        task={task}
        onPress={handleTaskPress}
        showProject={false}
        showAssignments={true}
        style={index === 0 ? styles.firstTask : undefined}
        showCloseButton={true}
      />
    );

    const renderTaskHeader = () => (
      <View>
        <View style={styles.tasksHeader}>
          <View style={styles.tasksHeaderLeft}>
            <Text style={styles.sectionTitle}>
              Project Tasks ({taskStats.total || 0})
            </Text>
            <Text style={styles.tasksSubtitle}>
              {taskStats.completed || 0} completed • {taskStats.active || 0} active
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={handleCreateTask}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        {renderTaskFilters()}
      </View>
    );

    const renderEmptyTasks = () => (
      <View style={styles.emptyTasksContainer}>
        <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTasksTitle}>
          {selectedTaskFilter === "all" ? "No tasks yet" : `No ${selectedTaskFilter} tasks`}
        </Text>
        <Text style={styles.emptyTasksText}>
          {selectedTaskFilter === "all" 
            ? "Create your first task to get started"
            : "Try selecting a different filter"
          }
        </Text>
        {selectedTaskFilter === "all" && (
          <TouchableOpacity 
            style={styles.createFirstTaskButton}
            onPress={handleCreateTask}
          >
            <Text style={styles.createFirstTaskText}>Create First Task</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <FlatList
        style={styles.tasksTabContainer}
        contentContainerStyle={styles.tasksTabContent}
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderTaskHeader}
        ListEmptyComponent={renderEmptyTasks}
        showsVerticalScrollIndicator={false}
        refreshing={isTasksLoading}
        onRefresh={refetchTasks}
      />
    );
  };

  // Team tab render function
  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Team Members ({project?.members?.length || 0})
        </Text>
        {isOwner && (
          <TouchableOpacity 
            style={styles.addMemberButton}
            onPress={handleAddMembers}
          >
            <Ionicons name="person-add" size={16} color="#1C30A4" />
            <Text style={styles.addMemberText}>Add Member</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {project?.members && project?.members?.length > 0 ? (
        project?.members?.map((member) => (
          <SwipeableMemberCard
            key={member.id}
            member={member}
            isOwner={isOwner}
            isProjectOwner={member.id === project?.owner_id}
            isCurrentUser={member.id === user?.id}
            isRemoving={removingMember === member.id}
            onRemove={() => handleRemoveMember(member)}
            renderAvatar={() => renderAvatar(member, 40)}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No team members</Text>
          {isOwner && (
            <TouchableOpacity 
              style={styles.emptyAddMemberButton}
              onPress={handleAddMembers}
            >
              <Text style={styles.emptyAddMemberText}>Add team members</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
        
        {/* Enhanced Edit Button with permission check */}
        {canEdit && (
          <TouchableOpacity 
            onPress={handleEditProject} 
            style={[
              styles.editButton,
              !canEdit && styles.disabledEditButton
            ]}
            disabled={!canEdit}
          >
            <Ionicons 
              name="create-outline" 
              size={20} 
              color={canEdit ? "#1C30A4" : "#9CA3AF"} 
            />
            <Text style={[
              styles.editButtonText,
              !canEdit && styles.disabledEditButtonText
            ]}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Project Header Card */}
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          {project?.images && project?.images?.length > 0 ? (
            <Image
              source={{ 
                uri: `${FILES_URL}${project?.images?.find(img => img.is_primary)?.image_url || project.images[0].image_url}` 
              }}
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
      {selectedTab === "Tasks" ? (
        renderTasksTab()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      )}

      {/* Project Members Popup */}
      {isOwner && (
        <ProjectMembersPopup
          visible={showMembersPopup}
          onClose={() => setShowMembersPopup(false)}
          project={project}
          projectMembers={project?.members || []}
          isOwner={isOwner}
        />
      )}
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  disabledEditButton: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  editButtonText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "600",
    marginLeft: 4,
  },
  disabledEditButtonText: {
    color: "#9CA3AF",
  },
  projectHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    minWidth: "22%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  enhancedStatsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  enhancedStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  enhancedStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  enhancedStatInfo: {
    flex: 1,
  },
  enhancedStatNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  enhancedStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
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
  // Tasks Tab Styles
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  tasksHeaderLeft: {
    flex: 1,
  },
  tasksSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  addTaskButton: {
    backgroundColor: "#1C30A4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#1C30A4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  tasksTabContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tasksTabContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskFiltersContainer: {
    marginBottom: 16,
  },
  taskFiltersContent: {
    paddingRight: 20,
  },
  taskFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeTaskFilterChip: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  taskFilterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 6,
  },
  activeTaskFilterText: {
    color: "#fff",
  },
  taskFilterBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  activeTaskFilterBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  taskFilterBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  activeTaskFilterBadgeText: {
    color: "#fff",
  },
  firstTask: {
    marginTop: 0,
  },
  emptyTasksContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTasksTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyTasksText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstTaskButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstTaskText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Team Tab Styles
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  addMemberText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "600",
    marginLeft: 4,
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
    marginBottom: 16,
  },
  emptyAddMemberButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyAddMemberText: {
    fontSize: 14,
    color: "#6B7280",
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
});

export default ProjectDetails;