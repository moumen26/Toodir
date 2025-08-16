import React, { memo, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteTasks, useCloseTask } from '../hooks/useTaskQueries';
import TodayTaskCard from './TodayTaskCard';

const TodayTasksSection = memo(() => {
  const today = new Date().toISOString().split('T')[0];
  
  // Create filters for today's tasks
  const todayFilters = useMemo(() => ({
    status: 'active',
    assigned_to_me: true,
    page: 1,
    limit: 20,
  }), []);

  // API Queries
  const {
    data: tasksData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteTasks(todayFilters);
  
  // Refetch data when component mounts or key changes
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter tasks for today (due today or overdue)
  const todayTasks = useMemo(() => {
    if (!tasksData?.pages) return [];
    
    const allTasks = tasksData.pages.flatMap(page => page.data || []);
    
    return allTasks.filter(task => {
      if (!task.end_date) return false;
      
      const taskDate = new Date(task.start_date);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      
      // Include tasks due today or overdue
      return taskDateStr == today;
    }).slice(0, 10); // Limit to 10 tasks for home screen
  }, [tasksData, today]);  

  const renderTaskItem = useCallback(({ item }) => (
    <TodayTaskCard 
      task={item} 
    />
  ), []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No tasks for today</Text>
      <Text style={styles.emptySubtitle}>
        Great job! You're all caught up for today
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load tasks</Text>
      <Text style={styles.errorSubtitle}>
        Please check your connection and try again
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="small" color="#1C30A4" />
      <Text style={styles.loadingText}>Loading tasks...</Text>
    </View>
  );

  const getTaskStats = () => {
    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(task => task.closed).length;
    const overdueTasks = todayTasks.filter(task => 
      !task.closed && task.end_date && new Date(task.end_date) < new Date()
    ).length;
    
    return { totalTasks, completedTasks, overdueTasks };
  };

  const { totalTasks, completedTasks, overdueTasks } = getTaskStats();

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={styles.sectionCount}>
            <ActivityIndicator size="small" color="#6B7280" />
          </View>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.sectionCount}>Error</Text>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <View style={styles.sectionStats}>
          {overdueTasks > 0 && (
            <View style={styles.overdueBadge}>
              <Ionicons name="warning" size={12} color="#fff" />
              <Text style={styles.overdueText}>{overdueTasks}</Text>
            </View>
          )}
          <Text style={styles.sectionCount}>
            {completedTasks}/{totalTasks}
          </Text>
        </View>
      </View>
      
      {todayTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={todayTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  sectionStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overdueBadge: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 12,
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  updateOverlay: {
    position: "absolute",
    top: 0,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
  },
});

export default TodayTasksSection;