import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  useReminder,
  useUpdateReminder,
  useCompleteReminder,
  useSnoozeReminder,
  useDeleteReminder,
} from "../hooks/useRemindersQueries";

const ReminderDetailsScreen = () => {
  const { reminderId } = useLocalSearchParams();
  const [showActionsModal, setShowActionsModal] = useState(false);

  // API Queries
  const {
    data: reminderData,
    isLoading,
    isError,
    refetch,
  } = useReminder(reminderId);

  // Mutations
  const updateReminderMutation = useUpdateReminder();
  const completeReminderMutation = useCompleteReminder();
  const snoozeReminderMutation = useSnoozeReminder();
  const deleteReminderMutation = useDeleteReminder();

  const reminder = reminderData?.data;

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleEdit = useCallback(() => {
    // Navigate to edit screen (would need to be implemented)
    router.push(`/EditReminder?reminderId=${reminderId}`);
  }, [reminderId]);

  const handleComplete = useCallback(async () => {
    try {
      await completeReminderMutation.mutateAsync(reminderId);
      Alert.alert("Success", "Reminder marked as completed!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to complete reminder");
    }
  }, [reminderId, completeReminderMutation]);

  const handleSnooze = useCallback(() => {
    Alert.alert(
      "Snooze Reminder",
      "How long would you like to snooze this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "15 minutes",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId,
                snoozeMinutes: 15,
              });
              Alert.alert("Success", "Reminder snoozed for 15 minutes!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          },
        },
        {
          text: "30 minutes",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId,
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
                reminderId,
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
  }, [reminderId, snoozeReminderMutation]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReminderMutation.mutateAsync(reminderId);
              Alert.alert("Success", "Reminder deleted successfully!", [
                { text: "OK", onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to delete reminder");
            }
          },
        },
      ]
    );
  }, [reminderId, deleteReminderMutation]);

  const handleShare = useCallback(async () => {
    if (!reminder) return;

    try {
      const shareMessage = `Reminder: ${reminder.title}\n\nScheduled for: ${formatDateTime(reminder.reminder_date_time)}\n\n${reminder.description || ''}`;
      
      await Share.share({
        message: shareMessage,
        title: reminder.title,
      });
    } catch (error) {
      console.log("Error sharing reminder:", error);
    }
  }, [reminder]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const formatNotificationMethods = (methods) => {
    if (!methods || methods.length === 0) return "None";
    return methods.map(method => {
      switch (method) {
        case "email": return "Email";
        case "push": return "Push Notification";
        case "sms": return "SMS";
        default: return method;
      }
    }).join(", ");
  };

  const formatAdvanceNotification = (minutes) => {
    if (minutes === 0) return "At time of reminder";
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''} before`;
    return `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''} before`;
  };

  const formatRecurrence = (reminder) => {
    if (reminder.reminder_type !== "recurring" || !reminder.recurrence_pattern) {
      return "None";
    }

    let text = `Every ${reminder.recurrence_interval || 1} ${reminder.recurrence_pattern}`;
    if (reminder.recurrence_interval > 1) {
      text += "s";
    }

    if (reminder.recurrence_pattern === "weekly" && reminder.recurrence_days_of_week?.length > 0) {
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const selectedDays = reminder.recurrence_days_of_week.map(day => dayNames[day]).join(", ");
      text += ` on ${selectedDays}`;
    }

    if (reminder.recurrence_end_date) {
      text += ` until ${formatDateTime(reminder.recurrence_end_date)}`;
    }

    return text;
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

  const isOverdue = (reminder) => {
    if (reminder.status !== 'active') return false;
    return new Date(reminder.reminder_date_time) < new Date();
  };

  const renderInfoSection = (title, content, icon) => (
    <View style={styles.infoSection}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={16} color="#1C30A4" />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  );

  const renderActionButton = (title, icon, color, onPress, disabled = false) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: color + "15" },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color={disabled ? "#9CA3AF" : color} />
      <Text style={[styles.actionButtonText, { color: disabled ? "#9CA3AF" : color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading reminder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !reminder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load reminder</Text>
          <Text style={styles.errorText}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
        <Text style={styles.headerTitle}>Reminder Details</Text>
        <TouchableOpacity
          onPress={() => setShowActionsModal(true)}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={[
          styles.statusHeader,
          isOverdue(reminder) && styles.overdueHeader,
          reminder.status === "completed" && styles.completedHeader,
        ]}>
          <View style={styles.statusLeft}>
            <View style={[
              styles.statusIcon,
              { backgroundColor: getStatusColor(reminder.status) + "20" }
            ]}>
              <Ionicons
                name={getStatusIcon(reminder.status)}
                size={24}
                color={getStatusColor(reminder.status)}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(reminder.status) }
              ]}>
                {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
              </Text>
              {isOverdue(reminder) && (
                <Text style={styles.overdueText}>Overdue</Text>
              )}
              {reminder.status === "snoozed" && reminder.snooze_until && (
                <Text style={styles.snoozeText}>
                  Snoozed until {formatDateTime(reminder.snooze_until)}
                </Text>
              )}
            </View>
          </View>
          {reminder.tag && (
            <View style={styles.tagContainer}>
              <View style={[styles.tagDot, { backgroundColor: reminder.tag.color }]} />
              <Text style={styles.tagText}>{reminder.tag.name}</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title */}
          <Text style={[
            styles.reminderTitle,
            reminder.status === "completed" && styles.completedTitle,
          ]}>
            {reminder.title}
          </Text>

          {/* Description */}
          {reminder.description && (
            <Text style={styles.reminderDescription}>{reminder.description}</Text>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {renderActionButton(
              "Complete",
              "checkmark-circle-outline",
              "#10B981",
              handleComplete,
              reminder.status !== "active"
            )}
            {renderActionButton(
              "Snooze",
              "time-outline",
              "#8B5CF6",
              handleSnooze,
              reminder.status !== "active"
            )}
            {renderActionButton(
              "Edit",
              "pencil-outline",
              "#1C30A4",
              handleEdit
            )}
            {renderActionButton(
              "Share",
              "share-outline",
              "#6B7280",
              handleShare
            )}
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>

            {renderInfoSection(
              "Scheduled Time",
              formatDateTime(reminder.reminder_date_time),
              "calendar-outline"
            )}

            {renderInfoSection(
              "Type",
              reminder.reminder_type === "one_time" ? "One Time" : "Recurring",
              "repeat-outline"
            )}

            {reminder.reminder_type === "recurring" && (
              renderInfoSection(
                "Recurrence",
                formatRecurrence(reminder),
                "refresh-outline"
              )
            )}

            {renderInfoSection(
              "Notification Methods",
              formatNotificationMethods(reminder.notification_methods),
              "notifications-outline"
            )}

            {renderInfoSection(
              "Advance Notice",
              formatAdvanceNotification(reminder.advance_notification_minutes),
              "alarm-outline"
            )}

            {reminder.completed_at && (
              renderInfoSection(
                "Completed At",
                formatDateTime(reminder.completed_at),
                "checkmark-circle-outline"
              )
            )}

            {renderInfoSection(
              "Created",
              formatDateTime(reminder.createdAt),
              "add-circle-outline"
            )}

            {reminder.updated_at !== reminder.created_at && (
              renderInfoSection(
                "Last Updated",
                formatDateTime(reminder.updated_at),
                "create-outline"
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.actionsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reminder Actions</Text>
              <TouchableOpacity onPress={() => setShowActionsModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => {
                  setShowActionsModal(false);
                  handleEdit();
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#1C30A4" />
                <Text style={styles.modalActionText}>Edit Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => {
                  setShowActionsModal(false);
                  handleShare();
                }}
              >
                <Ionicons name="share-outline" size={20} color="#6B7280" />
                <Text style={styles.modalActionText}>Share Reminder</Text>
              </TouchableOpacity>

              {reminder.status === "active" && (
                <>
                  <TouchableOpacity
                    style={styles.modalAction}
                    onPress={() => {
                      setShowActionsModal(false);
                      handleComplete();
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                    <Text style={styles.modalActionText}>Mark as Complete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalAction}
                    onPress={() => {
                      setShowActionsModal(false);
                      handleSnooze();
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.modalActionText}>Snooze Reminder</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalAction, styles.deleteAction]}
                onPress={() => {
                  setShowActionsModal(false);
                  handleDelete();
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={[styles.modalActionText, styles.deleteActionText]}>
                  Delete Reminder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueHeader: {
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  completedHeader: {
    backgroundColor: "#F0FDF4",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  overdueText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  snoozeText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  mainContent: {
    padding: 20,
  },
  reminderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    lineHeight: 32,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  reminderDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: "48%",
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  detailsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
  },
  infoContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
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
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  actionsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  modalActions: {
    padding: 20,
  },
  modalAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
  },
  deleteAction: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteActionText: {
    color: "#EF4444",
  },
});

export default ReminderDetailsScreen;