import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  VirtualizedList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useTasksByUser, useTaskStats, useTaskFilters, usePrefetchTask } from "../hooks/useTasks";
import { useTaskContext } from "../context/TaskContext";
import { useAuthStatus } from "../hooks/useAuth";
import { RefreshControl } from 'react-native';
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import Constants from 'expo-constants';
const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

// Optimized VirtualizedList for better performance than FlatList
const OptimizedList = memo(({ 
  data, 
  renderItem, 
  keyExtractor, 
  refreshControl,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.1,
}) => {
  const getItemCount = useCallback(() => data.length, [data.length]);
  const getItem = useCallback((data, index) => data[index], []);

  return (
    <VirtualizedList
      data={data}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      removeClippedSubviews={true}
      getItemCount={getItemCount}
      getItem={getItem}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tasksList}
    />
  );
});

const FilterChip = memo(({ 
  title, 
  count, 
  isActive, 
  onPress, 
  color,
  icon 
}) => {
  const handlePress = useCallback(() => {
    onPress(title);
  }, [title, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isActive && styles.activeFilterChip,
        { borderColor: color }
      ]}
      onPress={handlePress}
    >
      <View style={styles.filterChipContent}>
        <Ionicons name={icon} size={12} color={isActive ? "#fff" : color} />
        <Text
          style={[
            styles.filterChipText,
            isActive && styles.activeFilterChipText
          ]}
        >
          {title}
        </Text>
        {count !== undefined && (
          <View style={[
            styles.filterChipBadge,
            { backgroundColor: isActive ? "rgba(255,255,255,0.2)" : color + "20" }
          ]}>
            <Text style={[
              styles.filterChipBadgeText,
              { color: isActive ? "#fff" : color }
            ]}>
              {count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const Tasks = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { user } = useAuthStatus();
  
  // Use TaskContext for state management
  const { 
    filters, 
    setFilters, 
    preferences, 
    setPreferences 
  } = useTaskContext();
  
  const { 
    tasks: apiTasks, 
    pagination,
    isLoading,
    isError,
    error, 
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTasksByUser({
    search: filters.search && filters.search.length >= 2 ? filters.search : undefined,
    priority: filters.priority !== "all" ? filters.priority : undefined,
    ...preferences,
  });

  // Apply client-side filtering using useTaskFilters hook
  const { filteredTasks, taskStats } = useTaskFilters(apiTasks, {
    priority: filters.priority !== "all" ? filters.priority : undefined,
    search: filters.search,
    sortBy: preferences.sortBy,
    sortDirection: preferences.sortDirection,
  });
  
  const prefetchTask = usePrefetchTask()

  const handleTaskPress = (task) => {
    router.push({
      pathname: "/TaskDetails",
      params: { taskId: task.id }
    });
  };

  const handleCreateTask = useCallback(() => {
    navigation.navigate("CreateTask/index");
  }, [navigation]);

  const handleFilterPress = useCallback((filter) => {
    setFilters({ priority: filter === "All" ? "all" : filter.toLowerCase() });
    listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, [setFilters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleSearch = useCallback((text) => {
    setFilters({ search: text });
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Search will be triggered by the useTasksByUser hook
    }, 300);
  }, [setFilters]);

  const handlePrefetch = useCallback((taskId) => {
    prefetchTask(taskId);
  }, [prefetchTask]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item) => item.id, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };
  
  const renderAvatarGroup = (users, maxVisible = 3, size = 24) => {   
    const visibleUsers = users.slice(0, maxVisible);
    const remainingCount = users.length - maxVisible;
    const containerWidth = size + (visibleUsers.length - 1) * (size * 0.7);

    return (
      <View style={[styles.avatarGroupContainer, { width: containerWidth, height: size }]}>
        {visibleUsers.map((user, index) => (
          <View
            key={user?.id || index}
            style={[
              styles.avatarGroupItem,
              {
                left: index * (size * 0.7),
                zIndex: visibleUsers.length - index,
                width: size,
                height: size,
              }
            ]}
          >
            <View
              style={[
                styles.avatar,
                styles.avatarGroupAvatar,
                { 
                  width: size, 
                  height: size, 
                  borderRadius: size / 2,
                  borderWidth: 2,
                  borderColor: '#fff',
                },
              ]}
            >
              {user?.profile_picture ? (
                <Image
                  source={{ uri: `${FILES_URL}${user.profile_picture}` }}
                  style={[
                    styles.avatarImage,
                    { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 },
                  ]}
                />
              ) : (
                <Ionicons name="person" size={size * 0.5} color="#9CA3AF" />
              )}
            </View>
          </View>
        ))}
        
        {remainingCount > 0 && (
          <View
            style={[
              styles.avatarGroupCounter,
              {
                left: visibleUsers.length * (size * 0.7),
                width: size,
                height: size,
                borderRadius: size / 2,
                zIndex: 0,
              }
            ]}
          >
            <Text style={[styles.avatarGroupCounterText, { fontSize: size * 0.35 }]}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAvatar = (member, size = 32) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member?.avatar ? (
        <Image
          source={{ uri: member?.avatar }}
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

  const renderTaskCard = ({ item }) => (   
    <TouchableOpacity
      style={[
        styles.taskCard,
      ]}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <View style={styles.taskIcon}>
            <View style={[ styles.taskIconBackground, { backgroundColor: getPriorityColor(item?.priority) + "20" }, ]} >
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text style={[ styles.taskTitle, ]} numberOfLines={2}> {item?.title} </Text>
          </View>
        </View>
        <View style={styles.taskHeaderRight}>
          <TouchableOpacity style={styles.taskMenuButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {item?.description &&
        <Text style={[ styles.taskDescription, ]} numberOfLines={2}> {item?.description} </Text>
      }

      <View style={styles.taskInfo}>
        {item?.project &&
          <View style={styles.taskInfoItem}>
            <Ionicons name="folder-outline" size={14} color="#6B7280" />
            <Text style={styles.taskInfoText}>{item?.project?.title}</Text>
          </View>
        }
        <View style={styles.taskInfoItem}>
          <Ionicons name="calendar-outline" size={14} color={"#6B7280"} />
          <Text style={[ styles.taskInfoText, ]}> {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskFooterLeft}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: getPriorityColor(item?.priority) + "20",
              },
            ]}
          >
            <View style={[ styles.priorityDot, { backgroundColor: getPriorityColor(item?.priority) }, ]} />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item?.priority) },
              ]}
            >
              {item?.priority}
            </Text>
          </View>
        </View>

        {item?.assignedUsers.length > 0 && 
          <View style={styles.taskFooterRight}>
            <Text style={styles.assignedByText}>by</Text>
            <View style={styles.assignedBy}>
              {renderAvatar(item?.project?.owner, 18)}
            </View>
            <Ionicons name="arrow-forward" size={12} color="#9CA3AF" />
            <View style={styles.assignedTo}>
              {renderAvatarGroup(item?.assignedUsers, 3, 22)}
            </View>
          </View>
        }
      </View>
    </TouchableOpacity>
  );

  const renderFilter = useCallback(({ item }) => (
    <FilterChip
      title={item.title}
      count={item.count}
      isActive={filters.priority === (item.title === "All" ? "all" : item.title.toLowerCase())}
      onPress={handleFilterPress}
      color={item.color}
      icon={item.icon}
    />
  ), [filters.priority, handleFilterPress]);

  // Generate filter options with counts from taskStats
  const filterOptions = useMemo(() => [
    { 
      title: "All", 
      count: taskStats.total || 0, 
      color: "#1C30A4", 
      icon: "apps-outline" 
    },
    { 
      title: "High", 
      count: taskStats.byPriority?.high || 0, 
      color: "#EF4444", 
      icon: "flag" 
    },
    { 
      title: "Medium", 
      count: taskStats.byPriority?.medium || 0, 
      color: "#F59E0B", 
      icon: "flag" 
    },
    { 
      title: "Low", 
      count: taskStats.byPriority?.low || 0, 
      color: "#10B981", 
      icon: "flag" 
    },
  ], [taskStats]);

  // Focus effect for refreshing data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !isFetching) {
        refetch();
      }
    }, [isLoading, isFetching, refetch])
  );

  // Loading and error states
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Tasks</Text>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {pagination?.total_items || filteredTasks?.length || 0}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Manage your daily tasks</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleCreateTask}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>New</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks, projects, or assignees..."
              value={filters.search}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {filters.search && filters.search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Tasks</Text>
          </View>
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {error?.message || "Failed to load tasks"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {pagination?.total_items || filteredTasks?.length || 0}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage your daily tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateTask/index")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, projects, or assignees..."
            value={filters.search}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
          {filters.search && filters.search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Task Overview Stats as Filters */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Tasks</Text>
        <FlatList
          horizontal
          data={filterOptions}
          renderItem={renderFilter}
          keyExtractor={(item) => item.title}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState 
          onCreatePress={handleCreateTask} 
          searchQuery={filters.search}
          type={'task'}
        />
      ) : (
        <OptimizedList
          ref={listRef}
          data={filteredTasks}
          renderItem={renderTaskCard}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1C30A4"]}
              tintColor="#1C30A4"
            />
          }
          ListEmptyComponent={
            <EmptyState 
              onCreatePress={handleCreateTask} 
              searchQuery={filters.search}
              type={'task'}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#1C30A4" />
              </View>
            ) : null
          }
        />
      )}
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
  searchContainer: {
    marginTop: 10,
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
  tasksList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueTaskCard: {
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
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
  overdueTaskTitle: {
    color: "#DC2626",
  },
  overdueTaskTime: {
    color: "#EF4444",
    fontWeight: "700",
  },
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  // Checkbox styles
  checkboxContainer: {
    marginRight: 8,
    marginLeft: 4,
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  // Completed Badge
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
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 12,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  taskHeaderInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  taskCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  taskMenuButton: {
    padding: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  taskInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  overdueText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  taskTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  taskTagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  subtasksProgress: {
    marginBottom: 16,
    marginLeft: 88, // Adjusted for checkbox space
  },
  subtasksInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subtasksText: {
    fontSize: 12,
    color: "#6B7280",
  },
  subtasksPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C30A4",
  },
  subtasksProgressBar: {},
  subtasksProgressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
  },
  subtasksProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  taskFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedByText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginRight: 6,
  },
  assignedBy: {
    marginRight: 8,
    opacity: 0.8,
  },
  assignedTo: {
    marginLeft: 8,
    minWidth: 22,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  // Completed task styling
  completedTaskIconBackground: {
    backgroundColor: "#10B981" + "20",
  },
  completedTaskTitle: {
    color: "#6B7280",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "#9CA3AF",
  },
  filtersContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  completedTaskDescription: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "#D1D5DB",
  },
  completedTaskTime: {
    color: "#10B981",
    fontWeight: "600",
  },
  completedPriorityBadge: {
    backgroundColor: "#10B981" + "20",
  },
  completedPriorityDot: {
    backgroundColor: "#10B981",
  },
  completedPriorityText: {
    color: "#10B981",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1C30A4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activeFilterChip: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
    transform: [{ scale: 0.95 }],
  },
  filterChipContent: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
    justifyContent: "center",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 4,
  },
  activeFilterChipText: {
    color: "#fff",
  },
  filterChipBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: "center",
  },
  filterChipBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  avatarGroupContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroupItem: {
    position: 'absolute',
    top: 0,
  },
  avatarGroupAvatar: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarGroupCounter: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#6B7280',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarGroupCounterText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Tasks;