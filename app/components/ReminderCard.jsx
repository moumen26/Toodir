import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useCompleteReminder,
  useSnoozeReminder,
  useDeleteReminder,
} from "../hooks/useRemindersQueries";

const ReminderCard = memo(({ reminder, onPress, style }) => {
  // Mutations
  const completeReminderMutation = useCompleteReminder();
  const snoozeReminderMutation = useSnoozeReminder();
  const deleteReminderMutation = useDeleteReminder();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(reminder);
    } else {
      router.push(`/ReminderDetails?reminderId=${reminder.id}`);
    }
  }, [reminder, onPress]);

  const handleCompleteReminder = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await completeReminderMutation.mutateAsync(reminder.id);
      Alert.alert("Success", "Reminder marked as completed!");
    } catch (error) {
      Alert.alert("Error", "Failed to complete reminder");
    }
  }, [reminder.id, completeReminderMutation]);

  const handleSnoozeReminder = useCallback((e) => {
    e.stopPropagation();
    Alert.alert(
      "Snooze Reminder",
      "How long would you like to snooze this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "15 min",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId: reminder.id,
                snoozeMinutes: 15,
              });
              Alert.alert("Success", "Reminder snoozed for 15 minutes!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          },
        },
        {
          text: "30 min",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId: reminder.id,
                snoozeMinutes: 30,
              });
              Alert.alert("Success", "Reminder snoozed for 30 minutes!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          },
        },
        {
          text: "1 hour",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId: reminder.id,
                snoozeMinutes: 60,
              });
              Alert.alert("Success", "Reminder snoozed for 1 hour!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          },
        },
      ]
    );
  }, [reminder.id, snoozeReminderMutation]);

  const handleDeleteReminder = useCallback((e) => {
    e.stopPropagation();
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReminderMutation.mutateAsync(reminder.id);
              Alert.alert("Success", "Reminder deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete reminder");
            }
          },
        },
      ]
    );
  }, [reminder.id, deleteReminderMutation]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#3B82F6";
      case "completed": return "#10B981";
      case "snoozed": return "#8B5CF6";
      case "cancelled": return "#6B7280";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return "radio-button-off";
      case "completed": return "checkmark-circle";
      case "snoozed": return "time";
      case "cancelled": return "close-circle";
      default: return "radio-button-off";
    }
  };

  const isOverdue = () => {
    if (reminder.status !== 'active') return false;
    return new Date(reminder.reminder_date_time) < new Date();
  };

  const getNotificationMethodsText = () => {
    if (!reminder.notification_methods || reminder.notification_methods.length === 0) {
      return "";
    }
    return reminder.notification_methods.join(", ");
  };

  return (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        reminder.status === "completed" && styles.completedReminderCard,
        isOverdue() && styles.overdueReminderCard,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Overdue Badge */}
      {isOverdue() && (
        <View style={styles.overdueBadge}>
          <Ionicons name="warning" size={12} color="#fff" />
          <Text style={styles.overdueBadgeText}>OVERDUE</Text>
        </View>
      )}

      <View style={styles.reminderHeader}>
        <View style={styles.reminderHeaderLeft}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: getStatusColor(reminder.status) + "20" }
            ]}
            onPress={reminder.status === "active" ? handleCompleteReminder : undefined}
          >
            <Ionicons
              name={getStatusIcon(reminder.status)}
              size={16}
              color={getStatusColor(reminder.status)}
            />
          </TouchableOpacity>
          <View style={styles.reminderInfo}>
            <Text
              style={[
                styles.reminderTitle,
                reminder.status === "completed" && styles.completedTitle,
              ]}
              numberOfLines={2}
            >
              {reminder.title}
            </Text>
            <Text style={styles.reminderDateTime}>
              {formatDateTime(reminder.reminder_date_time)}
            </Text>
          </View>
        </View>
        <View style={styles.reminderActions}>
          {reminder.status === "active" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSnoozeReminder}
            >
              <Ionicons name="time-outline" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeleteReminder}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {reminder.description && (
        <Text style={styles.reminderDescription} numberOfLines={2}>
          {reminder.description}
        </Text>
      )}

      {/* Reminder Details */}
      <View style={styles.reminderDetails}>
        {reminder.reminder_type === "recurring" && (
          <View style={styles.detailItem}>
            <Ionicons name="repeat" size={12} color="#8B5CF6" />
            <Text style={styles.detailText}>
              {reminder.recurrence_pattern?.charAt(0).toUpperCase() + reminder.recurrence_pattern?.slice(1)}
            </Text>
          </View>
        )}
        
        {reminder.advance_notification_minutes > 0 && (
          <View style={styles.detailItem}>
            <Ionicons name="alarm" size={12} color="#F59E0B" />
            <Text style={styles.detailText}>
              {reminder.advance_notification_minutes < 60 
                ? `${reminder.advance_notification_minutes}m before`
                : `${Math.floor(reminder.advance_notification_minutes / 60)}h before`}
            </Text>
          </View>
        )}

        {getNotificationMethodsText() && (
          <View style={styles.detailItem}>
            <Ionicons name="notifications" size={12} color="#3B82F6" />
            <Text style={styles.detailText} numberOfLines={1}>
              {getNotificationMethodsText()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.reminderFooter}>
        <View style={styles.reminderFooterLeft}>
          {reminder.tag && (
            <View style={styles.reminderTag}>
              <View style={[styles.tagDot, { backgroundColor: reminder.tag.color }]} />
              <Text style={styles.tagText}>{reminder.tag.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.reminderFooterRight}>
          <Text style={[styles.statusText, { color: getStatusColor(reminder.status) }]}>
            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ReminderCard.displayName = "ReminderCard";

const styles = StyleSheet.create({
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
  completedReminderCard: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  overdueReminderCard: {
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reminderHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  reminderDateTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  reminderDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 44,
  },
  reminderDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 44,
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailText: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 4,
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
    flex: 1,
  },
  reminderTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  reminderFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ReminderCard;