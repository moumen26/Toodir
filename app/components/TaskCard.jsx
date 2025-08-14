import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCloseTask } from "../hooks/useTaskQueries";

const TaskCard = memo(({ 
  task, 
  onPress, 
  showProject = true, 
  showAssignments = true,
  style,
  showCloseButton = true
}) => {
  const closeTaskMutation = useCloseTask();
  
  const handleTaskPress = () => {
    if (onPress) {
      onPress(task);
    }
  };

  const handleToggleCompletion = (e) => {
    e.stopPropagation();
    closeTaskMutation.mutate({
      taskId: task.id,
      closed: !task.closed
    });
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
    if (task.closed) return "#10B981";
    if (task.is_overdue) return "#EF4444";
    return "#3B82F6";
  };

  const getStatusIcon = () => {
    if (task.closed) return "checkmark-circle";
    if (task.is_overdue) return "warning";
    return "time";
  };

  const getCategoryIcon = (project) => {
    return "folder-outline";
  };

  const renderAvatar = (member, size = 24) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.profile_picture ? (
        <Image
          source={{ uri: member.profile_picture }}
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
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        task.is_overdue && styles.overdueTaskCard,
        task.closed && styles.completedTaskCard,
        style,
      ]}
      onPress={handleTaskPress}
    >
      {/* Overdue Badge */}
      {task.is_overdue && !task.closed && (
        <View style={styles.overdueBadge}>
          <Ionicons name="warning" size={12} color="#fff" />
          <Text style={styles.overdueBadgeText}>OVERDUE</Text>
        </View>
      )}

      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <View style={styles.taskIcon}>
            <View
              style={[
                styles.taskIconBackground,
                { backgroundColor: (task.color || getPriorityColor(task.priority)) + "20" },
                task.closed && styles.completedTaskIconBackground,
              ]}
            >
              {task.closed ? (
                <Ionicons name="checkmark" size={20} color="#10B981" />
              ) : (
                <Ionicons
                  name={getCategoryIcon(task.project)}
                  size={20}
                  color={task.color || getPriorityColor(task.priority)}
                />
              )}
            </View>
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text
              style={[
                styles.taskTitle,
                task.is_overdue && !task.closed && styles.overdueTaskTitle,
                task.closed && styles.completedTaskTitle,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {showProject && task.project && (
              <Text style={styles.taskCategory}>{task.project.title}</Text>
            )}
          </View>
        </View>
        <View style={styles.taskHeaderRight}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor() + "20",
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon()}
              size={14}
              color={getStatusColor()}
            />
          </View>
          {/* Checkbox for completion */}
          {showCloseButton && 
            <TouchableOpacity
              style={styles.taskMenuButton}
              onPress={handleToggleCompletion}
              disabled={closeTaskMutation.isLoading}
            >
              <View
                style={[
                  styles.checkbox,
                  task.closed && styles.checkboxCompleted,
                ]}
              >
                {task.closed && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          }
        </View>
      </View>

      {task.description && (
        <Text
          style={[
            styles.taskDescription,
            task.closed && styles.completedTaskDescription,
          ]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      )}

      <View style={styles.taskInfo}>
        {task.start_date && (
          <View style={styles.taskInfoItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.taskInfoText}>
              {formatDate(task.start_date)}
              {task.end_date && ` - ${formatDate(task.end_date)}`}
            </Text>
          </View>
        )}
        {task.estimated_time && (
          <View style={styles.taskInfoItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.taskInfoText}>{task.estimated_time}</Text>
          </View>
        )}
        {task.comment_count > 0 && (
          <View style={styles.taskInfoItem}>
            <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
            <Text style={styles.taskInfoText}>{task.comment_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskFooterLeft}>
          {task.priority && (
            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor: getPriorityColor(task.priority) + "20",
                },
                task.closed && styles.completedPriorityBadge,
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(task.priority) },
                  task.closed && styles.completedPriorityDot,
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(task.priority) },
                  task.closed && styles.completedPriorityText,
                ]}
              >
                {task.priority}
              </Text>
            </View>
          )}
          
          <Text
            style={[
              styles.taskTime,
              task.is_overdue && !task.closed && styles.overdueTaskTime,
              task.closed && styles.completedTaskTime,
            ]}
          >
            {task.closed ? "Completed" : task.end_date ? formatDate(task.end_date) : "No deadline"}
          </Text>
        </View>

        {showAssignments && task.assignedUsers && task.assignedUsers.length > 0 && (
          <View style={styles.taskFooterRight}>
            <Text style={styles.assignedByText}>to</Text>
            <View style={styles.assignedUsersContainer}>
              {task.assignedUsers.slice(0, 3).map((user, index) => (
                <View
                  key={user.id}
                  style={[
                    styles.assignedUserAvatar,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                >
                  {renderAvatar(user, 24)}
                </View>
              ))}
              {task.assignedUsers.length > 3 && (
                <View style={[styles.assignedUserAvatar, { marginLeft: -8 }]}>
                  <View style={[styles.avatar, { width: 24, height: 24 }]}>
                    <Text style={styles.moreUsersText}>
                      +{task.assignedUsers.length - 3}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  taskCard: {
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
    position: 'relative',
  },
  overdueTaskCard: {
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
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  overdueBadge: {
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
  overdueBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedTaskIconBackground: {
    backgroundColor: "#10B981" + "20",
  },
  taskHeaderInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  overdueTaskTitle: {
    color: "#DC2626",
  },
  completedTaskTitle: {
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  taskCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  taskMenuButton: {
    padding: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 52,
  },
  completedTaskDescription: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  taskInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  taskInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  taskInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  completedPriorityBadge: {
    backgroundColor: "#10B981" + "20",
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  completedPriorityDot: {
    backgroundColor: "#10B981",
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  completedPriorityText: {
    color: "#10B981",
  },
  taskTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  overdueTaskTime: {
    color: "#EF4444",
  },
  completedTaskTime: {
    color: "#10B981",
  },
  taskFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedByText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginRight: 6,
  },
  assignedUsersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedUserAvatar: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  avatarImage: {
    resizeMode: "cover",
  },
  moreUsersText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  checkboxContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;