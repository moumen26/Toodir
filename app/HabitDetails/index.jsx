import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { 
  useHabitDetails,
  useMarkHabitDone,
  useMarkHabitSkipped,
  useUndoHabitAction,
  useDeleteHabit 
} from "../hooks/useHabitsQueries";

const { width } = Dimensions.get('window');

const HabitDetails = () => {
  const { habitId } = useLocalSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // API hooks
  const { 
    data: habitData, 
    isLoading, 
    isError,
    refetch 
  } = useHabitDetails(habitId);

  const markDoneMutation = useMarkHabitDone();
  const markSkippedMutation = useMarkHabitSkipped();
  const undoActionMutation = useUndoHabitAction();
  const deleteHabitMutation = useDeleteHabit();

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

  // Process habit data
  const habit = useMemo(() => {
    if (!habitData?.data?.habit) return null;
    
    const { habit: h, statistics, calendar_data } = habitData.data;
    return {
      id: h.id,
      name: h.name,
      repetition_count: h.repetition_count,
      unit: h.unit,
      repetition_type: h.repetition_type,
      frequency_description: h.frequency_description,
      reminder_time: h.reminder_time,
      is_active: h.is_active,
      tags: h.tags || [],
      created_at: statistics.created_at,
      statistics: {
        days_since_created: statistics.days_since_created,
        current_streak: statistics.current_streak,
        best_streak: statistics.best_streak,
        total_completions: statistics.total_completions,
      },
      calendar_data: calendar_data || [],
      color: h.tags?.[0]?.color || '#3B82F6',
      icon: getHabitIcon(h.name, h.tags),
    };
  }, [habitData]);

  // Calendar heatmap data processing
  const getCalendarHeatmapData = () => {
    if (!habit?.calendar_data) return [];
    
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const data = [];
    const currentDate = new Date(threeMonthsAgo);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = habit.calendar_data.find(d => d.date === dateStr);
      
      data.push({
        date: dateStr,
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        isCompleted: dayData?.is_completed || false,
        status: dayData?.status || 'pending',
        completed_count: dayData?.completed_count || 0,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const heatmapData = getCalendarHeatmapData();

  // Group heatmap data by weeks
  const getHeatmapWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    
    heatmapData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (index === 0) {
        // Fill empty days at the beginning of first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      // Fill empty days at the end of last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const heatmapWeeks = getHeatmapWeeks();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/EditHabit?habitId=${habitId}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabitMutation.mutateAsync(habitId);
              router.back();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete habit");
            }
          },
        },
      ]
    );
  };

  const handleHabitAction = async (action) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = { date: today };
      
      switch (action) {
        case 'done':
          await markDoneMutation.mutateAsync({ habitId, data });
          break;
        case 'skip':
          await markSkippedMutation.mutateAsync({ habitId, data });
          break;
        case 'undo':
          await undoActionMutation.mutateAsync({ habitId, data });
          break;
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update habit');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getHeatmapColor = (day) => {
    if (!day) return 'transparent';
    if (day.isCompleted) return habit?.color || '#10B981';
    if (day.status === 'skipped') return '#EF4444';
    if (day.completed_count > 0) return (habit?.color || '#3B82F6') + '60';
    return '#F1F5F9';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading habit details...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !habit) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load habit</Text>
        <Text style={styles.errorText}>Please check your connection and try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Habit Details</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#1C30A4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Habit Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: habit.color + '15' }]}>
          <View style={styles.heroContent}>
            <View style={styles.habitIconLarge}>
              <View style={[styles.habitIconBackground, { backgroundColor: habit.color + '20' }]}>
                <Ionicons name={habit.icon} size={40} color={habit.color} />
              </View>
            </View>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitFrequency}>{habit.frequency_description}</Text>
            <Text style={styles.habitTarget}>
              {habit.repetition_count} {habit.unit} per session
            </Text>
            
            {habit.tags.length > 0 && (
              <View style={styles.habitTagsContainer}>
                {habit.tags.map((tag) => (
                  <View key={tag.id} style={[styles.habitTag, { borderColor: tag.color }]}>
                    <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
                    <Text style={styles.habitTagText}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {habit.reminder_time && (
              <View style={styles.reminderContainer}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.reminderText}>Reminder at {habit.reminder_time}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            {/* Current Streak */}
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="flame" size={24} color="#F59E0B" />
                <View style={styles.statTrendUp}>
                  <Ionicons name="trending-up" size={12} color="#F59E0B" />
                </View>
              </View>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {habit.statistics.current_streak}
              </Text>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statSubtext}>days in a row</Text>
            </View>

            {/* Best Streak */}
            <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="trophy" size={24} color="#3B82F6" />
                <View style={styles.statTrendUp}>
                  <Ionicons name="star" size={12} color="#3B82F6" />
                </View>
              </View>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                {habit.statistics.best_streak}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
              <Text style={styles.statSubtext}>personal record</Text>
            </View>

            {/* Total Completions */}
            <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={styles.statTrendUp}>
                  <Ionicons name="trending-up" size={12} color="#10B981" />
                </View>
              </View>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {habit.statistics.total_completions}
              </Text>
              <Text style={styles.statLabel}>Total Done</Text>
              <Text style={styles.statSubtext}>times completed</Text>
            </View>

            {/* Days Since Created */}
            <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="calendar" size={24} color="#8B5CF6" />
                <View style={styles.statTrendUp}>
                  <Ionicons name="time" size={12} color="#8B5CF6" />
                </View>
              </View>
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
                {habit.statistics.days_since_created}
              </Text>
              <Text style={styles.statLabel}>Days Active</Text>
              <Text style={styles.statSubtext}>since creation</Text>
            </View>
          </View>
        </View>

        {/* Progress Heatmap */}
        <View style={styles.heatmapContainer}>
          <Text style={styles.sectionTitle}>Progress Calendar</Text>
          <Text style={styles.sectionSubtitle}>Last 3 months activity</Text>
          
          <View style={styles.heatmapGrid}>
            {/* Week days header */}
            <View style={styles.weekDaysHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.weekDayLabel}>{day}</Text>
              ))}
            </View>
            
            {/* Heatmap weeks */}
            {heatmapWeeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapWeek}>
                {week.map((day, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.heatmapDay,
                      { backgroundColor: getHeatmapColor(day) }
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          
          {/* Heatmap Legend */}
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendText}>Less</Text>
            <View style={styles.legendDots}>
              <View style={[styles.legendDot, { backgroundColor: '#F1F5F9' }]} />
              <View style={[styles.legendDot, { backgroundColor: (habit.color || '#3B82F6') + '40' }]} />
              <View style={[styles.legendDot, { backgroundColor: (habit.color || '#3B82F6') + '80' }]} />
              <View style={[styles.legendDot, { backgroundColor: habit.color || '#3B82F6' }]} />
            </View>
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleHabitAction('done')}
              disabled={markDoneMutation.isLoading}
            >
              {markDoneMutation.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Mark Done</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleHabitAction('skip')}
              disabled={markSkippedMutation.isLoading}
            >
              {markSkippedMutation.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Skip Today</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
              onPress={() => handleHabitAction('undo')}
              disabled={undoActionMutation.isLoading}
            >
              {undoActionMutation.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="arrow-undo" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Undo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Habit Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(habit.created_at)}</Text>
            </View>
            
            <View style={styles.infoDivider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Frequency</Text>
              <Text style={styles.infoValue}>{habit.frequency_description}</Text>
            </View>
            
            <View style={styles.infoDivider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Target</Text>
              <Text style={styles.infoValue}>
                {habit.repetition_count} {habit.unit} per session
              </Text>
            </View>
            
            {habit.reminder_time && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Reminder</Text>
                  <Text style={styles.infoValue}>{habit.reminder_time}</Text>
                </View>
              </>
            )}
            
            <View style={styles.infoDivider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: habit.is_active ? '#10B981' : '#EF4444' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: habit.is_active ? '#10B981' : '#EF4444' }
                ]}>
                  {habit.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleteHabitMutation.isLoading}
          >
            {deleteHabitMutation.isLoading ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete Habit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  heroContent: {
    alignItems: "center",
  },
  habitIconLarge: {
    marginBottom: 16,
  },
  habitIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  habitName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  habitFrequency: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  habitTarget: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  habitTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  habitTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  tagColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  habitTagText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statTrendUp: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  heatmapContainer: {
    padding: 20,
    paddingTop: 0,
  },
  heatmapGrid: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    width: 20,
    textAlign: "center",
  },
  heatmapWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
  },
  heatmapDay: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#F1F5F9",
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 8,
  },
  legendDots: {
    flexDirection: "row",
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dangerZone: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default HabitDetails;