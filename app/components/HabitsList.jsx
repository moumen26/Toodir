import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import HabitCard from "./HabitCard";
import { 
  useInfiniteHabits,
  useMarkHabitDone,
  useMarkHabitSkipped,
  useUndoHabitAction 
} from "../hooks/useHabitsQueries";

const HabitsList = memo(({ 
  filters = {}, 
  searchQuery = "",
  selectedFilter = "All",
  onHabitPress 
}) => {
  // API hooks
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useInfiniteHabits(filters);

  // Mutations
  const markDoneMutation = useMarkHabitDone();
  const markSkippedMutation = useMarkHabitSkipped();
  const undoActionMutation = useUndoHabitAction();

  // Process and flatten the infinite data
  const habits = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => 
      (page.data || []).map(habit => ({
        id: habit.id,
        name: habit.name,
        completed: habit.today_progress?.status === 'completed',
        current: habit.today_progress?.completed_count || 0,
        target: habit.repetition_count || 1,
        unit: habit.unit || 'times',
        status: habit.today_progress?.status || 'pending',
        skipped: habit.today_progress?.skipped || false,
        progress_percentage: habit.today_progress?.progress_percentage || 0,
        tags: habit.tags || [],
        category: habit.tags?.[0]?.name || 'General',
        color: habit.tags?.[0]?.color || '#3B82F6',
        icon: getHabitIcon(habit.name, habit.tags),
        description: `Complete ${habit.repetition_count} ${habit.unit} ${getFrequencyText(habit)}`,
        schedule: getFrequencyText(habit),
        streak: 0, // This would come from habit details API
        repetition_type: habit.repetition_type,
        is_active: habit.is_active,
      }))
    );
  }, [data]);

  // Helper functions
  const getHabitIcon = (name, tags) => {
    const nameUpper = name.toUpperCase();
    if (nameUpper.includes('EXERCISE') || nameUpper.includes('GYM') || nameUpper.includes('WORKOUT')) return 'fitness-outline';
    if (nameUpper.includes('READ') || nameUpper.includes('BOOK')) return 'book-outline';
    if (nameUpper.includes('WATER') || nameUpper.includes('DRINK')) return 'water-outline';
    if (nameUpper.includes('SLEEP') || nameUpper.includes('PRAYER') || nameUpper.includes('QIYAM')) return 'moon-outline';
    if (nameUpper.includes('TEETH') || nameUpper.includes('BRUSH')) return 'medical-outline';
    if (nameUpper.includes('WALK') || nameUpper.includes('STEP')) return 'walk-outline';
    if (nameUpper.includes('MEDITAT')) return 'flower-outline';
    return 'checkmark-circle-outline';
  };

  const getFrequencyText = (habit) => {
    switch (habit.repetition_type) {
      case 'daily': return 'daily';
      case 'weekly': return 'weekly';
      case 'monthly': return 'monthly';
      case 'yearly': return 'yearly';
      case 'none': return 'manual';
      default: return 'daily';
    }
  };

  // Filter habits based on search and selected filter
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch =
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.tags.some((tag) =>
          tag.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "completed" && habit.completed) ||
        (selectedFilter === "active" && !habit.completed);

      return matchesSearch && matchesFilter;
    });
  }, [habits, searchQuery, selectedFilter]);

  // Event handlers
  const handleHabitPress = useCallback((habit) => {
    if (onHabitPress) {
      onHabitPress(habit);
    } else {
      router.push(`/HabitDetails?habitId=${habit.id}`);
    }
  }, [onHabitPress]);

  const handleMarkDone = useCallback(async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markDoneMutation.mutateAsync({ 
        habitId: habit.id, 
        data: { date: today } 
      });
    } catch (error) {
      console.log('Failed to mark habit as done:', error);
    }
  }, [markDoneMutation]);

  const handleMarkSkipped = useCallback(async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markSkippedMutation.mutateAsync({ 
        habitId: habit.id, 
        data: { date: today } 
      });
    } catch (error) {
      console.log('Failed to mark habit as skipped:', error);
    }
  }, [markSkippedMutation]);

  const handleUndo = useCallback(async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await undoActionMutation.mutateAsync({ 
        habitId: habit.id, 
        data: { date: today } 
      });
    } catch (error) {
      console.log('Failed to undo habit action:', error);
    }
  }, [undoActionMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderHabitCard = useCallback(({ item }) => (
    <HabitCard
      habit={item}
      onPress={handleHabitPress}
      onMarkDone={handleMarkDone}
      onMarkSkipped={handleMarkSkipped}
      onUndo={handleUndo}
      isActionLoading={
        markDoneMutation.isLoading || 
        markSkippedMutation.isLoading || 
        undoActionMutation.isLoading
      }
    />
  ), [
    handleHabitPress,
    handleMarkDone,
    handleMarkSkipped,
    handleUndo,
    markDoneMutation.isLoading,
    markSkippedMutation.isLoading,
    undoActionMutation.isLoading
  ]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1C30A4" />
        <Text style={styles.footerLoaderText}>Loading more habits...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedFilter !== "All" 
          ? "No habits found" 
          : "No habits yet"
        }
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedFilter !== "All"
          ? "Try adjusting your search or filter criteria"
          : "Create your first habit to get started"
        }
      </Text>
      {!searchQuery && selectedFilter === "All" && (
        <TouchableOpacity
          style={styles.createHabitButton}
          onPress={() => router.push("/CreateHabit")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createHabitButtonText}>Create Your First Habit</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, selectedFilter]);

  const renderError = useCallback(() => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load habits</Text>
      <Text style={styles.errorText}>Please check your connection and try again</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  ), [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return renderError();
  }

  return (
    <FlatList
      data={filteredHabits}
      renderItem={renderHabitCard}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={["#1C30A4"]}
          tintColor="#1C30A4"
        />
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
      getItemLayout={(data, index) => ({
        length: 220, // Approximate height of habit card
        offset: 220 * index,
        index,
      })}
    />
  );
});

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
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
    marginBottom: 20,
  },
  createHabitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C30A4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createHabitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
});

HabitsList.displayName = 'HabitsList';

export default HabitsList;