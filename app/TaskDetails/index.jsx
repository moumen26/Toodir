import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTask, useUpdateTask, useDeleteTask, useCloseTask } from "../hooks/useTaskQueries";
import TaskCard from "../components/TaskCard";
import AssignMembersModal from "../components/AssignMembersModal";

const TaskDetail = () => {
  const { taskId } = useLocalSearchParams();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const projectMembers = [];
  const projectOwner = null
  // Queries and mutations
  const { 
    data: taskData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching 
  } = useTask(taskId);
  
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const closeTaskMutation = useCloseTask();

  const task = taskData?.data;

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleEdit = useCallback(() => {
    if (task) {
      router.push(`/EditTask?taskId=${task.id}`);
    }
  }, [task]);

  const handleDelete = useCallback(() => {
    if (!task) return;

    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTaskMutation.mutateAsync(task.id);
              Alert.alert("Success", "Task deleted successfully", [
                { text: "OK", onPress: () => router.back() }
              ]);
            } catch (error) {
              console.log(error);
              
            }
          },
        },
      ]
    );
  }, [task, deleteTaskMutation]);

  const handleToggleComplete = useCallback(async () => {
    if (!task) return;

    try {
      await closeTaskMutation.mutateAsync({
        taskId: task.id,
        closed: !task.closed
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update task status"
      );
    }
  }, [task, closeTaskMutation]);

  const handleAssignUser = useCallback(() => {
    if (task) {
      setShowAssignModal(true)
    }
  }, [task]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getStatusColor = useCallback(() => {
    if (task?.closed) return "#10B981";
    if (task?.is_overdue) return "#EF4444";
    return "#3B82F6";
  }, [task]);

  const getStatusText = useCallback(() => {
    if (task?.closed) return "Completed";
    if (task?.is_overdue) return "Overdue";
    return "Active";
  }, [task]);

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

  const renderInfoSection = useCallback((title, children) => (
    <View style={styles.infoSection}>
      <Text style={styles.infoSectionTitle}>{title}</Text>
      <View style={styles.infoSectionContent}>
        {children}
      </View>
    </View>
  ), []);

  const renderInfoItem = useCallback((icon, label, value, color = "#374151") => (
    <View style={styles.infoItem}>
      <View style={styles.infoItemIcon}>
        <Ionicons name={icon} size={16} color="#6B7280" />
      </View>
      <View style={styles.infoItemContent}>
        <Text style={styles.infoItemLabel}>{label}</Text>
        <Text style={[styles.infoItemValue, { color }]}>{value}</Text>
      </View>
    </View>
  ), []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Task</Text>
          <Text style={styles.errorText}>
            {error?.message || "Failed to load task details"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerAction} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color="#1C30A4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={["#1C30A4"]}
            tintColor="#1C30A4"
          />
        }
      >
        {/* Task Card Preview */}
        <View style={styles.taskPreviewContainer}>
          <TaskCard
            task={task}
            showProject={true}
            showAssignments={true}
            style={styles.taskPreview}
            showCloseButton={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              task.closed && styles.quickActionButtonCompleted
            ]}
            onPress={handleToggleComplete}
            disabled={closeTaskMutation.isLoading}
          >
            <Ionicons 
              name={task.closed ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={20} 
              color={task.closed ? "#10B981" : "#1C30A4"} 
            />
            <Text style={[
              styles.quickActionText,
              task.closed && styles.quickActionTextCompleted
            ]}>
              {task.closed ? "Mark Incomplete" : "Mark Complete"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleAssignUser}
          >
            <Ionicons name="person-add-outline" size={20} color="#1C30A4" />
            <Text style={styles.quickActionText}>Manage Assignees</Text>
          </TouchableOpacity>
        </View>

        {/* Task Information */}
        {renderInfoSection(
          "Task Information",
          <>
            {renderInfoItem("flag", "Priority", task.priority || "Not set", getPriorityColor(task.priority))}
            {renderInfoItem("information-circle", "Status", getStatusText(), getStatusColor())}
            {task.project && renderInfoItem("folder", "Project", task.project.title)}
            {task.color && renderInfoItem("color-palette", "Color", task.color, task.color)}
          </>
        )}

        {/* Timeline */}
        {(task.start_date || task.end_date || task.created_at) && renderInfoSection(
          "Timeline",
          <>
            {task.start_date && renderInfoItem("calendar", "Start Date", formatDate(task.start_date))}
            {task.end_date && renderInfoItem("calendar", "End Date", formatDate(task.end_date))}
            {task.created_at && renderInfoItem("time", "Created", formatDate(task.created_at))}
            {task.updated_at && renderInfoItem("refresh", "Last Updated", formatDate(task.updated_at))}
          </>
        )}

        {/* Repetition */}
        {task.repetition_type && task.repetition_type !== "none" && renderInfoSection(
          "Repetition",
          <>
            {renderInfoItem("repeat", "Type", task.repetition_type)}
            {task.repetition_interval && renderInfoItem("timer", "Interval", `Every ${task.repetition_interval} ${task.repetition_type}${task.repetition_interval > 1 ? 's' : ''}`)}
            {task.repetition_day_of_week && task.repetition_day_of_week.length > 0 && 
              renderInfoItem("calendar", "Days", task.repetition_day_of_week.join(", "))}
          </>
        )}

        {/* Assigned Users */}
        {task.assignedUsers && task.assignedUsers.length > 0 && renderInfoSection(
          "Assigned To",
          <View style={styles.assignedUsersContainer}>
            {task.assignedUsers.map((user) => (
              <View key={user.id} style={styles.assignedUserItem}>
                <View style={styles.assignedUserAvatar}>
                  <Ionicons name="person" size={16} color="#6B7280" />
                </View>
                <View style={styles.assignedUserInfo}>
                  <Text style={styles.assignedUserName}>{user.full_name}</Text>
                  <Text style={styles.assignedUserEmail}>{user.email}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {task.description && renderInfoSection(
          "Description",
          <Text style={styles.descriptionText}>{task.description}</Text>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.infoSectionTitle}>Comments</Text>
            <TouchableOpacity style={styles.addCommentButton}>
              <Ionicons name="add" size={16} color="#1C30A4" />
              <Text style={styles.addCommentText}>Add Comment</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.commentsPlaceholder}>
            Comments feature coming soon...
          </Text>
        </View>
      </ScrollView>

      {/* Assign Members Modal */}
      <AssignMembersModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        task={task}
        projectMembers={task?.project?.members}
        projectOwner={task?.project?.owner}
        isLoading={isLoading}
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
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  taskPreviewContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  taskPreview: {
    marginBottom: 0,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionButtonCompleted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C30A4",
    marginLeft: 8,
  },
  quickActionTextCompleted: {
    color: "#10B981",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  infoSectionContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoItemValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  assignedUsersContainer: {
    gap: 12,
  },
  assignedUserItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assignedUserInfo: {
    flex: 1,
  },
  assignedUserName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  assignedUserEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  commentsSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addCommentText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 4,
  },
  commentsPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default TaskDetail;