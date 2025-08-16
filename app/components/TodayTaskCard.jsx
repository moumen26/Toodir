import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TodayTaskCard = memo(({ task, onToggleComplete }) => {
  const handlePress = () => {
    router.push(`/TaskDetails?taskId=${task.id}`);
  };

  const handleToggleComplete = (e) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(task.id, !task.closed);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#22C55E";
      default: return "#6B7280";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isOverdue = () => {
    if (task.closed || !task.end_date) return false;
    return new Date(task.end_date) < new Date();
  };

  const renderAvatar = (user, size = 24) => (
    <View
      key={user.id}
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
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  );

  return (
    <TouchableOpacity 
      style={[
        styles.taskCard,
        task.closed && styles.taskCardCompleted,
        isOverdue() && styles.taskCardOverdue,
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.taskContent}>        
        <View style={styles.taskDetails}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle, 
              task.closed && styles.taskTitleCompleted
            ]} numberOfLines={2}>
              {task.title}
            </Text>
            
            {task.project && (
              <View style={styles.projectBadge}>
                <Text style={styles.projectText} numberOfLines={1}>
                  {task.project.title}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.taskMeta}>
            {formatTime(task.end_date) && (
              <>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={[
                  styles.taskTime,
                  isOverdue() && styles.overdueText
                ]}>
                  {formatTime(task.end_date)}
                </Text>
              </>
            )}
            
            {formatTime(task.end_date) && task.priority && (
              <View style={styles.taskMetaDivider} />
            )}
            
            {task.priority && (
              <>
                <View style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(task.priority) }
                ]} />
                <Text style={styles.taskPriority}>
                  {task.priority}
                </Text>
              </>
            )}
          </View>

          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <View style={styles.assigneesContainer}>
              <View style={styles.assigneesAvatars}>
                {task.assignedUsers.slice(0, 3).map((user) => renderAvatar(user))}
                {task.assignedUsers.length > 3 && (
                  <View style={[styles.avatar, styles.moreAvatar]}>
                    <Text style={styles.moreText}>+{task.assignedUsers.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {isOverdue() && !task.closed && (
        <View style={styles.overdueLabel}>
          <Ionicons name="warning" size={12} color="#EF4444" />
          <Text style={styles.overdueLabelText}>Overdue</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: "#F8FAF8",
    opacity: 0.8,
  },
  taskCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginRight: 16,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckboxCompleted: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  taskDetails: {
    flex: 1,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  projectBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  projectText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTime: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 4,
  },
  overdueText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  taskMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  taskPriority: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  assigneesContainer: {
    marginTop: 4,
  },
  assigneesAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  avatarImage: {
    resizeMode: "cover",
  },
  moreAvatar: {
    backgroundColor: "#E5E7EB",
  },
  moreText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginLeft: 12,
  },
  overdueLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  overdueLabelText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 2,
  },
});

export default TodayTaskCard;