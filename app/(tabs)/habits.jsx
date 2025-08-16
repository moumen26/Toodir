import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { 
  useHabitsForDate, 
  useHabitStats,
  useMarkHabitDone,
  useMarkHabitSkipped,
  useUndoHabitAction 
} from "../hooks/useHabitsQueries";

const Habits = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Animation values
  const dateSlideX = useSharedValue(0);
  const dateOpacity = useSharedValue(1);
  const calendarHeight = useSharedValue(0);
  const calendarOpacity = useSharedValue(0);
  const expandIconRotation = useSharedValue(0);
  const miniCalendarMargin = useSharedValue(0);

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
    return 'flower-outline';
  };

  // Format date for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = formatDateForAPI(selectedDate);

  // API hooks
  const { 
    data: habitsData, 
    isLoading: habitsLoading, 
    isError: habitsError,
    refetch: refetchHabits 
  } = useHabitsForDate(selectedDateString);

  // Mutations
  const markDoneMutation = useMarkHabitDone();
  const markSkippedMutation = useMarkHabitSkipped();
  const undoActionMutation = useUndoHabitAction();

  // Process habits data
  const habits = useMemo(() => {
    if (!habitsData?.data) return [];
    
    const { active_habits = [], completed_habits = [] } = habitsData.data;
    return [...active_habits, ...completed_habits].map(habit => ({
      id: habit.id,
      name: habit.name,
      completed: habit.status === 'completed',
      current: habit.completed_count || 0,
      target: habit.repetition_count || 1,
      unit: habit.unit || 'times',
      status: habit.status || 'pending',
      skipped: habit.skipped || false,
      progress_percentage: habit.progress_percentage || 0,
      tags: habit.tags || [],
      category: habit.tags?.[0]?.name || 'General',
      color: habit.tags?.[0]?.color || '#3B82F6',
      icon: getHabitIcon(habit.name, habit.tags),
      description: `Complete ${habit.repetition_count} ${habit.unit} daily`,
      schedule: "Daily",
      streak: 0, // This would come from habit details API
    }));
  }, [habitsData]);

  const getScheduleText = (habit) => {
    // This would be based on habit repetition data
    return 'Daily'; // Simplified for now
  };

  // Filter habits
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

  const completedHabits = habits.filter((habit) => habit.completed);
  const activeHabits = habits.filter((habit) => !habit.completed);

  // Calendar functions
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();

  const toggleCalendarExpansion = () => {
    const newExpanded = !isCalendarExpanded;
    setIsCalendarExpanded(newExpanded);

    if (newExpanded) {
      calendarHeight.value = withSpring(80, { damping: 15, stiffness: 150, mass: 1 });
      calendarOpacity.value = withTiming(1, { duration: 300 });
      expandIconRotation.value = withSpring(180, { damping: 15, stiffness: 150 });
      miniCalendarMargin.value = withSpring(20, { damping: 15, stiffness: 150 });
    } else {
      calendarHeight.value = withSpring(0, { damping: 15, stiffness: 150, mass: 1 });
      calendarOpacity.value = withTiming(0, { duration: 200 });
      expandIconRotation.value = withSpring(0, { damping: 15, stiffness: 150 });
      miniCalendarMargin.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  };

  const navigateDay = (direction) => {
    const targetX = direction === "next" ? -50 : 50;
    dateSlideX.value = withTiming(targetX, { duration: 150 });
    dateOpacity.value = withTiming(0, { duration: 150 });

    setTimeout(() => {
      const newDate = new Date(selectedDate);
      if (direction === "next") {
        newDate.setDate(newDate.getDate() + 1);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      setSelectedDate(newDate);

      const startX = direction === "next" ? 50 : -50;
      dateSlideX.value = startX;
      dateSlideX.value = withTiming(0, { duration: 150 });
      dateOpacity.value = withTiming(1, { duration: 150 });
    }, 150);
  };

  const navigateToToday = () => {
    if (!isSameDay(selectedDate, today)) {
      setSelectedDate(new Date(today));
    }
  };

  const formatDate = (date) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return {
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
    };
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const todayDateString = today.toDateString();

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Create comparison dates without time components
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      days.push({
        date: date,
        day: date.getDate(),
        dayName: date.toLocaleDateString("en", { weekday: "short" }),
        isToday: date.toDateString() === todayDateString,
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isPast: dateOnly < todayOnly,
        isFuture: dateOnly > todayOnly,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Habit actions
  const handleHabitAction = async (habit, action) => {
    try {
      const data = { date: selectedDateString };
      
      switch (action) {
        case 'done':
          await markDoneMutation.mutateAsync({ habitId: habit.id, data });
          break;
        case 'skip':
          await markSkippedMutation.mutateAsync({ habitId: habit.id, data });
          break;
        case 'undo':
          await undoActionMutation.mutateAsync({ habitId: habit.id, data });
          break;
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update habit');
    }
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const getHabitProgress = (habit) => {
    return Math.min((habit.current / habit.target) * 100, 100);
  };

  const handleHabitPress = (habit) => {
    router.push(`/HabitDetails?habitId=${habit.id}`);
  };

  const handleDateSelect = (date) => {   
    setSelectedDate(date);
    setSearchQuery("");
    setSelectedFilter("All");
  };

  // Animated styles
  const animatedDateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dateSlideX.value }],
    opacity: dateOpacity.value,
  }));

  const animatedCalendarStyle = useAnimatedStyle(() => ({
    height: calendarHeight.value,
    opacity: calendarOpacity.value,
  }));

  const animatedExpandIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandIconRotation.value}deg` }],
  }));

  const animatedMiniCalendarStyle = useAnimatedStyle(() => ({
    marginTop: miniCalendarMargin.value,
  }));

  // Search and Filter components
  const SearchAndFilters = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search habits, categories, or tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Habit Overview Stats as Filters */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Habits</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsScrollView}
        >
          {/* All Habits Filter */}
          <TouchableOpacity
            style={[
              styles.progressStatCard,
              selectedFilter === "All" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("All")}
          >
            <View style={styles.progressCardHeader}>
              <View style={styles.progressIcon}>
                <Ionicons name="list" size={12} color="#1C30A4" />
              </View>
              <Text style={styles.progressCardTitle}>All Habits</Text>
            </View>
            <Text style={styles.progressCardNumber}>
              {habits.length > 0 ? Math.round(
                habits.reduce((acc, habit) => {
                  return acc + getHabitProgress(habit);
                }, 0) / habits.length
              ) : 0}%
            </Text>
            <View style={styles.progressCardBar}>
              <View style={styles.progressCardBackground}>
                <View
                  style={[
                    styles.progressCardFill,
                    {
                      width: `${habits.length > 0 ? Math.round(
                        habits.reduce((acc, habit) => {
                          return acc + getHabitProgress(habit);
                        }, 0) / habits.length
                      ) : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressCardSubtext}>Avg Progress</Text>
          </TouchableOpacity>

          {/* Active Habits Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
              selectedFilter === "active" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("active")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#3B82F6" }]}
              >
                <Ionicons name="time" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#3B82F6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#3B82F6" }]}>
              {activeHabits.length}
            </Text>
            <Text style={styles.statCardLabel}>Active</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#3B82F6" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: habits.length > 0 ? `${(activeHabits.length / habits.length) * 100}%` : '0%',
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Completed Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
              selectedFilter === "completed" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("completed")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#10B981" }]}
              >
                <Ionicons name="checkmark-circle" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#10B981" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#10B981" }]}>
              {completedHabits.length}
            </Text>
            <Text style={styles.statCardLabel}>Done</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#10B981" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: habits.length > 0 ? `${(completedHabits.length / habits.length) * 100}%` : '0%',
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );

  const renderHabitCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.habitCard, item.completed && styles.completedHabitCard]}
      onPress={() => handleHabitPress(item)}
    >
      {item.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
          <Text style={styles.completedBadgeText}>DONE</Text>
        </View>
      )}

      <View style={styles.habitHeader}>
        <View style={styles.habitHeaderLeft}>
          <View style={styles.habitIcon}>
            <View
              style={[
                styles.habitIconBackground,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
          </View>
          <View style={styles.habitHeaderInfo}>
            <Text
              style={[
                styles.habitTitle,
                item.completed && styles.completedHabitTitle,
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text style={styles.habitCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.habitHeaderRight}>
          <View style={styles.habitProgress}>
            <Text style={[styles.progressText, { color: item.color }]}>
              {item.current}/{item.target}
            </Text>
            <Text style={styles.progressLabel}>{item.unit}</Text>
          </View>
          
          {/* Action Button */}
          <TouchableOpacity
            style={styles.habitActionButton}
            onPress={() => {
              if (item.completed) {
                handleHabitAction(item, 'undo');
              } else if (item.skipped) {
                handleHabitAction(item, 'undo');
              } else {
                // Show action menu
                Alert.alert(
                  'Update Habit',
                  'What would you like to do?',
                  [
                    { text: 'Mark Done', onPress: () => handleHabitAction(item, 'done') },
                    { text: 'Skip Today', onPress: () => handleHabitAction(item, 'skip') },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }
            }}
            disabled={markDoneMutation.isLoading || markSkippedMutation.isLoading || undoActionMutation.isLoading}
          >
            {(markDoneMutation.isLoading || markSkippedMutation.isLoading || undoActionMutation.isLoading) ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons 
                name={item.completed ? "checkmark-circle" : item.skipped ? "close-circle" : "ellipsis-horizontal"} 
                size={18} 
                color={item.completed ? "#10B981" : item.skipped ? "#EF4444" : "#6B7280"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.habitDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.habitInfo}>
        <View style={styles.habitInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>{item.schedule}</Text>
        </View>
        <View style={styles.habitInfoItem}>
          <Ionicons name="trending-up" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>{item.streak} day streak</Text>
        </View>
        <View style={styles.habitInfoItem}>
          <Ionicons name="locate-outline" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>
            {item.current}/{item.target} {item.unit}
          </Text>
        </View>
      </View>

      {item.tags.length > 0 && (
        <View style={styles.habitTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.habitTag, { borderColor: tag.color }]}>
              <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
              <Text style={styles.habitTagText}>{tag.name}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <View style={styles.habitTag}>
              <Text style={styles.habitTagText}>+{item.tags.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.habitProgressBar}>
        <View style={styles.habitProgressInfo}>
          <Text style={styles.habitProgressText}>
            Progress: {Math.round(getHabitProgress(item))}%
          </Text>
          {item.skipped && (
            <Text style={styles.skippedText}>Skipped today</Text>
          )}
        </View>
        <View style={styles.habitProgressBarContainer}>
          <View style={styles.habitProgressBackground}>
            <View
              style={[
                styles.habitProgressFill,
                {
                  width: `${getHabitProgress(item)}%`,
                  backgroundColor: item.skipped ? "#EF4444" : item.color,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {!item.completed && !item.skipped && (
        <View style={styles.habitFooter}>
          <View style={styles.habitFooterLeft}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <View
                style={[styles.categoryDot, { backgroundColor: item.color }]}
              />
              <Text style={[styles.categoryText, { color: item.color }]}>
                {item.category}
              </Text>
            </View>
          </View>
          <View style={styles.habitFooterRight}>
            <Text style={styles.habitTarget}>
              {item.current}/{item.target} {item.unit}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const dateInfo = formatDate(selectedDate);

  if (habitsLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </SafeAreaView>
    );
  }

  if (habitsError) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load habits</Text>
        <Text style={styles.errorText}>Please check your connection and try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetchHabits}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Habits</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{habits.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Build better daily habits</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/CreateHabit")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Calendar Section */}
      <View style={styles.dynamicCalendarSection}>
        <View style={styles.dynamicCalendarContainer}>
          <View style={styles.dynamicCalendarHeader}>
            <Text style={styles.dynamicCalendarTitle}>Today's Habits</Text>
            <View style={styles.headerButtonsContainer}>
              <TouchableOpacity
                onPress={navigateToToday}
                style={styles.todayHeaderButton}
              >
                <Ionicons name="calendar" size={16} color="#fff" />
                <Text style={styles.todayHeaderButtonText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleCalendarExpansion}
                style={styles.expandButton}
              >
                <Animated.View style={animatedExpandIconStyle}>
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            style={[styles.expandableContent, animatedCalendarStyle]}
          >
            <View style={styles.dateNavigationContainer}>
              <TouchableOpacity
                onPress={() => navigateDay("prev")}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={styles.dateDisplayContainer}>
                <Animated.View
                  style={[styles.animatedDateContainer, animatedDateStyle]}
                >
                  <Text style={styles.dateDay}>{dateInfo.day}</Text>
                  <Text style={styles.dateMonth}>
                    {dateInfo.month} {dateInfo.year}
                  </Text>
                  <Text style={styles.dateDayName}>{dateInfo.dayName}</Text>
                </Animated.View>
              </View>

              <TouchableOpacity
                onPress={() => navigateDay("next")}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.miniCalendarContainer, animatedMiniCalendarStyle]}
          >
            <FlatList
              data={weekDays}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDateSelect(item.date)}
                  style={[
                    styles.miniDayContainer,
                    item.isSelected && styles.selectedMiniDay,
                    item.isToday && !item.isSelected && styles.todayMiniDay,
                    item.isPast && styles.pastMiniDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.miniDayName,
                      item.isSelected && styles.selectedMiniDayText,
                      item.isToday &&
                        !item.isSelected &&
                        styles.todayMiniDayText,
                      item.isPast && styles.pastMiniDayText,
                    ]}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.miniDayNumber,
                      item.isSelected && styles.selectedMiniDayText,
                      item.isToday &&
                        !item.isSelected &&
                        styles.todayMiniDayText,
                      item.isPast && styles.pastMiniDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                  {item.isSelected && habits.filter((h) => h.completed).length > 0 && (
                    <View style={styles.miniDayIndicator} />
                  )}
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.miniCalendarContent}
              keyExtractor={(item, index) => index.toString()}
            />
          </Animated.View>
        </View>
      </View>

      {/* Habits List with Search and Filters as ListHeaderComponent */}
      <FlatList
        data={filteredHabits}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.habitsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={habitsLoading}
            onRefresh={refetchHabits}
            colors={["#1C30A4"]}
            tintColor="#1C30A4"
          />
        }
        ListHeaderComponent={<SearchAndFilters />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery || selectedFilter !== "All" 
                ? "No habits found" 
                : "No habits for this date"
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
                <Text style={styles.createHabitButtonText}>Create Your First Habit</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  dynamicCalendarSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  dynamicCalendarContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dynamicCalendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dynamicCalendarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayHeaderButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
  expandButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  expandableContent: {
    overflow: "hidden",
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  dateDisplayContainer: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  animatedDateContainer: {
    alignItems: "center",
  },
  dateDay: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 2,
  },
  dateDayName: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  miniCalendarContainer: {},
  miniCalendarContent: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  miniDayContainer: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    marginHorizontal: 2,
  },
  selectedMiniDay: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  todayMiniDay: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  pastMiniDay: {
    opacity: 0.6,
  },
  miniDayName: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
    marginBottom: 2,
  },
  miniDayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  selectedMiniDayText: {
    color: "#1E293B",
  },
  todayMiniDayText: {
    color: "#fff",
  },
  pastMiniDayText: {
    color: "#64748B",
  },
  miniDayIndicator: {
    width: 4,
    height: 4,
    backgroundColor: "#10B981",
    borderRadius: 2,
    marginTop: 2,
  },
  dayContainer: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 44,
    marginHorizontal: 2,
    position: "relative",
  },
  todayContainer: {
    backgroundColor: "#3B82F6",
  },
  selectedDayContainer: {
    backgroundColor: "#3B82F6",
  },
  pastDayContainer: {
    opacity: 0.6,
  },
  dayName: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 4,
  },
  activeDayName: {
    color: "#fff",
  },
  pastDayName: {
    color: "#64748B",
  },
  dayNumber: {
    fontSize: 16,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 2,
  },
  activeDayNumber: {
    color: "#fff",
  },
  pastDayNumber: {
    color: "#94A3B8",
  },
  dayIndicator: {
    alignItems: "center",
  },
  dayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  statsSection: {
    marginBottom: 16,
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  statsScrollView: {
    marginBottom: 0,
  },
  progressStatCard: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    width: 110,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeFilterCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressIcon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  progressCardTitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  progressCardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  progressCardBar: {
    marginBottom: 4,
  },
  progressCardBackground: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
  progressCardFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 1.5,
  },
  progressCardSubtext: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    width: 80,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statCardIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardTrend: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  statCardProgress: {
    marginTop: "auto",
  },
  statCardProgressBg: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  statCardProgressFill: {
    height: "100%",
    borderRadius: 1,
  },
  habitsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  habitCard: {
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
  },
  completedHabitCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  completedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completedBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  habitHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  habitIcon: {
    marginRight: 12,
  },
  habitIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  habitHeaderInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  completedHabitTitle: {
    color: "#059669",
  },
  habitCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  habitHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitProgress: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  habitActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  habitDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 52,
  },
  habitInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  habitInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  habitInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  habitTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  habitTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  habitTagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    marginLeft: 4,
  },
  tagColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  habitProgressBar: {
    marginBottom: 16,
    marginLeft: 52,
  },
  habitProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  habitProgressText: {
    fontSize: 12,
    color: "#6B7280",
  },
  skippedText: {
    fontSize: 12,
    color: "#EF4444",
    fontStyle: "italic",
  },
  habitProgressBarContainer: {},
  habitProgressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
  },
  habitProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  habitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  habitFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitTarget: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
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
    backgroundColor: "#1C30A4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createHabitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Habits;