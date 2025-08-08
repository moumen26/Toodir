import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

const Habits = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [animationDirection, setAnimationDirection] = useState("next");
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Animation values
  const dateSlideX = useSharedValue(0);
  const dateOpacity = useSharedValue(1);
  const calendarHeight = useSharedValue(0);
  const calendarOpacity = useSharedValue(0);
  const expandIconRotation = useSharedValue(0);
  const miniCalendarMargin = useSharedValue(0); // New animation value for margin

  const navigation = useNavigation();

  // Mock habits data with date-specific completion status
  const habitsData = [
    {
      id: 1,
      name: "Teeth care",
      description: "Maintain good oral hygiene routine",
      category: "Health",
      icon: "medical-outline",
      color: "#3B82F6",
      schedule: "Daily",
      tags: ["Health", "Morning"],
      target: 2,
      unit: "times",
      completionData: {
        "2025-01-08": { completed: 1, total: 2, isCompleted: false },
        "2025-01-07": { completed: 2, total: 2, isCompleted: true },
        "2025-01-06": { completed: 2, total: 2, isCompleted: true },
        "2025-01-05": { completed: 1, total: 2, isCompleted: false },
        "2025-01-09": { completed: 0, total: 2, isCompleted: false },
        "2025-01-10": { completed: 0, total: 2, isCompleted: false },
        "2025-01-11": { completed: 0, total: 2, isCompleted: false },
      },
    },
    {
      id: 2,
      name: "Qiyam Prayer",
      description: "Night prayer for spiritual growth",
      category: "Spiritual",
      icon: "moon-outline",
      color: "#8B5CF6",
      schedule: "Daily",
      tags: ["Prayer", "Night"],
      target: 1,
      unit: "times",
      completionData: {
        "2025-01-08": { completed: 0, total: 1, isCompleted: false },
        "2025-01-07": { completed: 1, total: 1, isCompleted: true },
        "2025-01-06": { completed: 0, total: 1, isCompleted: false },
        "2025-01-05": { completed: 1, total: 1, isCompleted: true },
        "2025-01-09": { completed: 0, total: 1, isCompleted: false },
        "2025-01-10": { completed: 0, total: 1, isCompleted: false },
        "2025-01-11": { completed: 0, total: 1, isCompleted: false },
      },
    },
    {
      id: 3,
      name: "Read my Book",
      description: "Daily reading for personal development",
      category: "Learning",
      icon: "book-outline",
      color: "#10B981",
      schedule: "Daily",
      tags: ["Reading", "Learning"],
      target: 20,
      unit: "pages",
      completionData: {
        "2025-01-08": { completed: 0, total: 20, isCompleted: false },
        "2025-01-07": { completed: 20, total: 20, isCompleted: true },
        "2025-01-06": { completed: 15, total: 20, isCompleted: false },
        "2025-01-05": { completed: 20, total: 20, isCompleted: true },
        "2025-01-09": { completed: 0, total: 20, isCompleted: false },
        "2025-01-10": { completed: 0, total: 20, isCompleted: false },
        "2025-01-11": { completed: 0, total: 20, isCompleted: false },
      },
    },
    {
      id: 4,
      name: "Morning Exercise",
      description: "Physical fitness and health routine",
      category: "Fitness",
      icon: "fitness-outline",
      color: "#F59E0B",
      schedule: "Daily",
      tags: ["Exercise", "Morning"],
      target: 30,
      unit: "minutes",
      completionData: {
        "2025-01-08": { completed: 30, total: 30, isCompleted: true },
        "2025-01-07": { completed: 30, total: 30, isCompleted: true },
        "2025-01-06": { completed: 0, total: 30, isCompleted: false },
        "2025-01-05": { completed: 30, total: 30, isCompleted: true },
        "2025-01-09": { completed: 0, total: 30, isCompleted: false },
        "2025-01-10": { completed: 0, total: 30, isCompleted: false },
        "2025-01-11": { completed: 0, total: 30, isCompleted: false },
      },
    },
  ];

  // Calendar functions
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSameDay = (date1, date2) =>
    date1.toDateString() === date2.toDateString();

  // New function to toggle calendar expansion
  const toggleCalendarExpansion = () => {
    const newExpanded = !isCalendarExpanded;
    setIsCalendarExpanded(newExpanded);

    if (newExpanded) {
      // Expand animation
      calendarHeight.value = withSpring(80, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
      calendarOpacity.value = withTiming(1, { duration: 300 });
      expandIconRotation.value = withSpring(180, {
        damping: 15,
        stiffness: 150,
      });
      miniCalendarMargin.value = withSpring(20, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      // Collapse animation
      calendarHeight.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
      calendarOpacity.value = withTiming(0, { duration: 200 });
      expandIconRotation.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      miniCalendarMargin.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const navigateDay = (direction) => {
    setAnimationDirection(direction);

    // Start animation
    const targetX = direction === "next" ? -50 : 50;
    dateSlideX.value = withTiming(targetX, { duration: 150 });
    dateOpacity.value = withTiming(0, { duration: 150 });

    // Update date after animation starts
    setTimeout(() => {
      const newDate = new Date(selectedDate);
      if (direction === "next") {
        newDate.setDate(newDate.getDate() + 1);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      setSelectedDate(newDate);

      // Animate back to center
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
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return {
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
    };
  };

  // Get habits data for selected date
  const getHabitsForDate = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    return habitsData.map((habit) => {
      const dayData = habit.completionData[dateKey] || {
        completed: 0,
        total: habit.target,
        isCompleted: false,
      };
      return {
        ...habit,
        current: dayData.completed,
        completed: dayData.isCompleted,
        progress: {
          completed: dayData.completed,
          total: dayData.total,
        },
        streak: Math.floor(Math.random() * 15) + 1,
      };
    });
  };

  const habits = getHabitsForDate(selectedDate);
  const completedHabits = habits.filter((habit) => habit.completed);
  const activeHabits = habits.filter((habit) => !habit.completed);

  // Generate week days for calendar dynamically
  const getWeekDays = () => {
    const days = [];
    const today = new Date();

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date,
        day: date.getDate(),
        dayName: date.toLocaleDateString("en", { weekday: "short" }),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isPast: date < today.setHours(0, 0, 0, 0),
        isFuture: date > new Date().setHours(23, 59, 59, 999),
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Filter habits based on search and selected filter
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "completed" && habit.completed) ||
      (selectedFilter === "active" && !habit.completed);

    return matchesSearch && matchesFilter;
  });

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
  const animatedDateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dateSlideX.value }],
      opacity: dateOpacity.value,
    };
  });

  // New animated styles for calendar expansion
  const animatedCalendarStyle = useAnimatedStyle(() => {
    return {
      height: calendarHeight.value,
      opacity: calendarOpacity.value,
    };
  });

  const animatedExpandIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${expandIconRotation.value}deg` }],
    };
  });

  // New animated style for mini calendar margin
  const animatedMiniCalendarStyle = useAnimatedStyle(() => {
    return {
      marginTop: miniCalendarMargin.value,
    };
  });

  const renderCalendarDay = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        item.isToday && styles.todayContainer,
        item.isSelected && styles.selectedDayContainer,
        item.isPast && styles.pastDayContainer,
      ]}
      onPress={() => handleDateSelect(item.date)}
    >
      <Text
        style={[
          styles.dayName,
          (item.isToday || item.isSelected) && styles.activeDayName,
          item.isPast && styles.pastDayName,
        ]}
      >
        {item.dayName}
      </Text>
      <Text
        style={[
          styles.dayNumber,
          (item.isToday || item.isSelected) && styles.activeDayNumber,
          item.isPast && styles.pastDayNumber,
        ]}
      >
        {item.day}
      </Text>
      <View style={styles.dayIndicator}>
        <View
          style={[
            styles.dayIndicatorDot,
            {
              backgroundColor:
                getHabitsForDate(item.date).filter((h) => h.completed).length >
                0
                  ? "#10B981"
                  : "transparent",
            },
          ]}
        />
      </View>
    </TouchableOpacity>
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
              {item.progress.completed}/{item.progress.total}
            </Text>
            <Text style={styles.progressLabel}>times</Text>
          </View>
          <TouchableOpacity style={styles.habitMenuButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
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
          <Ionicons name="target-outline" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>
            {item.current}/{item.target} {item.unit}
          </Text>
        </View>
      </View>

      <View style={styles.habitTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.habitTag}>
            <Text style={styles.habitTagText}>{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <View style={styles.habitTag}>
            <Text style={styles.habitTagText}>+{item.tags.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.habitProgressBar}>
        <View style={styles.habitProgressInfo}>
          <Text style={styles.habitProgressText}>
            Progress: {Math.round(getHabitProgress(item))}%
          </Text>
        </View>
        <View style={styles.habitProgressBarContainer}>
          <View style={styles.habitProgressBackground}>
            <View
              style={[
                styles.habitProgressFill,
                {
                  width: `${getHabitProgress(item)}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {!item.completed && (
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
            onPress={() => navigation.navigate("CreateHabit/index")}
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
          {/* Always visible header */}
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

          {/* Expandable content */}
          <Animated.View
            style={[styles.expandableContent, animatedCalendarStyle]}
          >
            {/* Date Navigation */}
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

          {/* Always visible Mini Week Calendar with animated margin */}
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
                  {getHabitsForDate(item.date).filter((h) => h.completed)
                    .length > 0 && <View style={styles.miniDayIndicator} />}
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
              {Math.round(
                habits.reduce((acc, habit) => {
                  return acc + getHabitProgress(habit);
                }, 0) / habits.length
              )}
              %
            </Text>
            <View style={styles.progressCardBar}>
              <View style={styles.progressCardBackground}>
                <View
                  style={[
                    styles.progressCardFill,
                    {
                      width: `${Math.round(
                        habits.reduce((acc, habit) => {
                          return acc + getHabitProgress(habit);
                        }, 0) / habits.length
                      )}%`,
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
                      width: `${(activeHabits.length / habits.length) * 100}%`,
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
                      width: `${
                        (completedHabits.length / habits.length) * 100
                      }%`,
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Habits List */}
      <FlatList
        data={filteredHabits}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.habitsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No habits found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
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

  // NEW EXPANDABLE CALENDAR STYLES
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
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayDot: {
    width: 6,
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 3,
    marginRight: 6,
  },
  todayBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  todayButtonExpanded: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 6,
  },
  miniCalendarContainer: {
    // Remove marginTop from here since it's now animated
  },
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

  // ORIGINAL STYLES CONTINUE
  todaySection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  calendarContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  calendarContent: {
    justifyContent: "space-between",
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
  },
  statsScrollView: {
    marginBottom: 0,
  },
  statsScrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
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
  habitMenuButton: {
    padding: 6,
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
    backgroundColor: "#F1F5F9",
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
  },
});

export default Habits;
