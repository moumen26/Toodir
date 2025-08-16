import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import {
  useInfiniteReminders,
  useCompleteReminder,
  useSnoozeReminder,
  useDeleteReminder
} from "../hooks/useRemindersQueries";
import { useDebouncedCallback } from "../hooks/useDebounce";
import RemindersFilterModal from "../components/RemindersFilterModal";

const Reminders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedTag, setSelectedTag] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    tag_id: '',
    reminder_type: '',
    date_from: '',
    date_to: '',
    search: '',
    sort_by: 'reminder_date_time',
    sort_order: 'ASC',
  });

  // Debounce search
  const debouncedSearch = useDebouncedCallback((query) => {
    setDebouncedQuery(query);
    setAdvancedFilters(prev => ({ ...prev, search: query }));
  });

  // Build filters for API - now combines quick filters and advanced filters
  const filters = useMemo(() => {
    const apiFilters = {
      limit: 10,
      sort_by: advancedFilters.sort_by || 'reminder_date_time',
      sort_order: advancedFilters.sort_order || 'ASC',
    };

    // Add search from advanced filters
    if (advancedFilters.search) {
      apiFilters.search = advancedFilters.search;
    }

    // Add advanced filters
    if (advancedFilters.status) {
      apiFilters.status = advancedFilters.status;
    }
    if (advancedFilters.tag_id) {
      apiFilters.tag_id = advancedFilters.tag_id;
    }
    if (advancedFilters.reminder_type) {
      apiFilters.reminder_type = advancedFilters.reminder_type;
    }
    if (advancedFilters.date_from) {
      apiFilters.date_from = advancedFilters.date_from;
    }
    if (advancedFilters.date_to) {
      apiFilters.date_to = advancedFilters.date_to;
    }

    // Quick filters (only if no advanced filters are set)
    const hasAdvancedFilters = advancedFilters.status || advancedFilters.tag_id ||
      advancedFilters.reminder_type || advancedFilters.date_from ||
      advancedFilters.date_to;

    if (!hasAdvancedFilters) {
      if (selectedFilter !== "All") {
        if (selectedFilter === "today") {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          apiFilters.date_from = today.toISOString().split('T')[0];
          apiFilters.date_to = tomorrow.toISOString().split('T')[0];
          apiFilters.status = 'active';
        } else if (selectedFilter === "scheduled") {
          apiFilters.status = 'active';
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          apiFilters.date_from = tomorrow.toISOString().split('T')[0];
        } else if (selectedFilter === "flagged") {
          apiFilters.status = 'active';
        } else {
          apiFilters.status = selectedFilter;
        }
      }

      if (selectedTag) {
        apiFilters.tag_id = selectedTag.id;
      }
    }

    return apiFilters;
  }, [advancedFilters, selectedFilter, selectedTag]);

  // API Queries
  const {
    data: remindersData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteReminders(filters);

  // Mutations
  const completeReminderMutation = useCompleteReminder();
  const snoozeReminderMutation = useSnoozeReminder();
  const deleteReminderMutation = useDeleteReminder();

  // Flatten reminders from infinite query
  const reminders = useMemo(() => {
    if (!remindersData?.pages) return [];
    return remindersData.pages.flatMap(page => page.data?.reminders || []);
  }, [remindersData]);

  // Check if advanced filters are active
  const hasActiveAdvancedFilters = useMemo(() => {
    return advancedFilters.status || advancedFilters.tag_id ||
      advancedFilters.reminder_type || advancedFilters.date_from ||
      advancedFilters.date_to ||
      advancedFilters.sort_by !== 'reminder_date_time' ||
      advancedFilters.sort_order !== 'ASC';
  }, [advancedFilters]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (advancedFilters.status) count++;
    if (advancedFilters.tag_id) count++;
    if (advancedFilters.reminder_type) count++;
    if (advancedFilters.date_from) count++;
    if (advancedFilters.date_to) count++;
    if (advancedFilters.sort_by !== 'reminder_date_time') count++;
    if (advancedFilters.sort_order !== 'ASC') count++;
    return count;
  };

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleReminderPress = useCallback((reminder) => {
    router.push(`/ReminderDetails?reminderId=${reminder.id}`);
  }, []);

  const handleCreateReminder = useCallback(() => {
    router.push("/CreateReminder");
  }, []);

  const handleApplyAdvancedFilters = useCallback((newFilters) => {
    setAdvancedFilters(newFilters);
    // Clear quick filters when using advanced filters
    setSelectedFilter("All");
    setSelectedTag(null);
  }, []);

  const handleResetAdvancedFilters = useCallback((resetFilters) => {
    setAdvancedFilters(resetFilters);
    setSelectedFilter("All");
    setSelectedTag(null);
    setSearchQuery("");
  }, []);

  const handleCompleteReminder = useCallback(async (reminder) => {
    try {
      await completeReminderMutation.mutateAsync(reminder.id);
      Alert.alert("Success", "Reminder marked as completed!");
    } catch (error) {
      Alert.alert("Error", "Failed to complete reminder");
    }
  }, [completeReminderMutation]);

  const handleSnoozeReminder = useCallback(async (reminder) => {
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
                snoozeMinutes: 15
              });
              Alert.alert("Success", "Reminder snoozed for 15 minutes!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          }
        },
        {
          text: "30 min",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId: reminder.id,
                snoozeMinutes: 30
              });
              Alert.alert("Success", "Reminder snoozed for 30 minutes!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          }
        },
        {
          text: "1 hour",
          onPress: async () => {
            try {
              await snoozeReminderMutation.mutateAsync({
                reminderId: reminder.id,
                snoozeMinutes: 60
              });
              Alert.alert("Success", "Reminder snoozed for 1 hour!");
            } catch (error) {
              Alert.alert("Error", "Failed to snooze reminder");
            }
          }
        },
      ]
    );
  }, [snoozeReminderMutation]);

  const handleDeleteReminder = useCallback((reminder) => {
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
          }
        },
      ]
    );
  }, [deleteReminderMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  const isOverdue = (reminder) => {
    if (reminder.status !== 'active') return false;
    return new Date(reminder.reminder_date_time) < new Date();
  };

  // Header component
  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Reminders</Text>
          </View>
          <Text style={styles.headerSubtitle}>Never miss important tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleCreateReminder}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar with Advanced Filter Button */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reminders..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveAdvancedFilters && styles.activeFilterButton,
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons
            name="funnel-outline"
            size={20}
            color={hasActiveAdvancedFilters ? "#fff" : "#1C30A4"}
          />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Advanced Filters Indicator */}
      {hasActiveAdvancedFilters && (
        <View style={styles.advancedFiltersIndicator}>
          <Text style={styles.advancedFiltersText}>
            Advanced filters active ({getActiveFiltersCount()})
          </Text>
          <TouchableOpacity
            onPress={() => handleResetAdvancedFilters({
              status: '',
              tag_id: '',
              reminder_type: '',
              date_from: '',
              date_to: '',
              search: '',
              sort_by: 'reminder_date_time',
              sort_order: 'ASC',
            })}
            style={styles.clearAdvancedFiltersButton}
          >
            <Text style={styles.clearAdvancedFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active Filter Indicator */}
      {(selectedFilter !== "All" || selectedTag) && !hasActiveAdvancedFilters && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Filtered by: {selectedTag ? selectedTag.name : selectedFilter}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter("All");
              setSelectedTag(null);
            }}
            style={styles.clearFilterButton}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderReminderCard = ({ item: reminder }) => (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        reminder.status === "completed" && styles.completedReminderCard,
        isOverdue(reminder) && styles.overdueReminderCard,
      ]}
      onPress={() => handleReminderPress(reminder)}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderHeaderLeft}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: getStatusColor(reminder.status) + "20" }
            ]}
            onPress={() => {
              if (reminder.status === "active") {
                handleCompleteReminder(reminder);
              }
            }}
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
              onPress={() => handleSnoozeReminder(reminder)}
            >
              <Ionicons name="time-outline" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteReminder(reminder)}
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

      <View style={styles.reminderFooter}>
        <View style={styles.reminderFooterLeft}>
          {reminder.tag && (
            <View style={styles.reminderTag}>
              <View style={[styles.tagDot, { backgroundColor: reminder.tag.color }]} />
              <Text style={styles.tagText}>{reminder.tag.name}</Text>
            </View>
          )}
          {reminder.reminder_type === "recurring" && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat" size={10} color="#8B5CF6" />
              <Text style={styles.recurringText}>Recurring</Text>
            </View>
          )}
        </View>
        <View style={styles.reminderFooterRight}>
          {isOverdue(reminder) && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          )}
          <Text style={styles.statusText}>
            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1C30A4" />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No reminders found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || hasActiveAdvancedFilters || selectedFilter !== "All" || selectedTag
          ? "Try adjusting your search or filter criteria"
          : "Create your first reminder to get started"}
      </Text>
      {!searchQuery && !hasActiveAdvancedFilters && selectedFilter === "All" && !selectedTag && (
        <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateReminder}>
          <Text style={styles.createFirstButtonText}>Create Reminder</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load reminders</Text>
          <Text style={styles.errorText}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reminders}
        renderItem={renderReminderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={["#1C30A4"]}
            tintColor="#1C30A4"
          />
        }
      />

      {/* Loading State Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      )}

      {/* Filter Modal */}
      <RemindersFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
        onResetFilters={handleResetAdvancedFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: '#1C30A4',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  advancedFiltersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C30A4',
  },
  advancedFiltersText: {
    fontSize: 14,
    color: '#1C30A4',
    fontWeight: '500',
  },
  clearAdvancedFiltersButton: {
    padding: 4,
  },
  clearAdvancedFiltersText: {
    color: '#1C30A4',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  activeFilterText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
  },
  clearFilterButton: {
    padding: 4,
  },
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    marginRight: 8,
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
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recurringText: {
    fontSize: 9,
    color: "#8B5CF6",
    fontWeight: "500",
    marginLeft: 2,
  },
  reminderFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  overdueBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  overdueText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    marginBottom: 16,
  },
  createFirstButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
});

export default Reminders;