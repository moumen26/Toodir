import React, { memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabitsForDate, useMarkHabitDone } from '../hooks/useHabitsQueries';
import TodayHabitCard from './TodayHabitCard';

const TodayHabitsSection = memo(() => {
  const today = new Date().toISOString().split('T')[0];
  
  // API Queries
  const {
    data: habitsData,
    isLoading,
    isError,
    refetch,
  } = useHabitsForDate(today);

  const habits = habitsData?.data || {};
  const activeHabits = habits.active_habits || [];
  const completedHabits = habits.completed_habits || [];
  const allHabits = [...activeHabits, ...completedHabits];
  const totalHabits = habits.total_habits || 0;
  const completionRate = habits.completion_rate || 0;

  // Refetch data when component mounts or key changes (for refresh)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const renderHabitItem = useCallback(({ item }) => (
    <TodayHabitCard 
      habit={item} 
    />
  ), []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No habits for today</Text>
      <Text style={styles.emptySubtitle}>
        Create your first habit to start building good routines
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load habits</Text>
      <Text style={styles.errorSubtitle}>
        Please check your connection and try again
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="small" color="#1C30A4" />
      <Text style={styles.loadingText}>Loading habits...</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
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
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <Text style={styles.sectionCount}>Error</Text>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        <View style={styles.sectionStats}>
          {completionRate > 0 && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completionRate}%</Text>
            </View>
          )}
          <Text style={styles.sectionCount}>
            {completedHabits.length}/{totalHabits}
          </Text>
        </View>
      </View>
      
      {allHabits.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={allHabits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.habitsContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 160,
            offset: 160 * index,
            index,
          })}
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
  completionBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completionText: {
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
  habitsContainer: {
    paddingLeft: 20,
    paddingRight: 8,
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

export default TodayHabitsSection;