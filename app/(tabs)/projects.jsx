import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  VirtualizedList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation, useFocusEffect } from "expo-router";
import {
  useProjects,
  useDeleteProject,
  usePrefetchProject,
} from "../hooks/useProjects";

// Optimized VirtualizedList for better performance than FlatList
const OptimizedList = React.memo(({ 
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
      contentContainerStyle={styles.projectsList}
    />
  );
});

// Memoized ProjectCard with performance optimizations
const ProjectCard = React.memo(({ 
  item, 
  onPress, 
  onMenuPress, 
  onPrefetch,
  style 
}) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const handleMenuPress = useCallback(() => {
    onMenuPress(item);
  }, [item, onMenuPress]);

  const handlePrefetch = useCallback(() => {
    onPrefetch?.(item.id);
  }, [item.id, onPrefetch]);

  const getPriorityColor = useCallback((priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#10B981";
      default: return "#6B7280";
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "#10B981";
      case "in progress": return "#3B82F6";
      case "review": return "#8B5CF6";
      case "planning": return "#F59E0B";
      default: return "#6B7280";
    }
  }, []);

  const renderAvatar = useCallback((member, size = 24) => (
    <View
      key={member.id}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.avatar ? (
        <Image
          source={{ uri: member.avatar }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  ), []);

  // Memoize calculated values
  const primaryImage = useMemo(() => 
    item.images?.find(img => img.is_primary), [item.images]
  );
  
  const progress = useMemo(() => item.progress || 0, [item.progress]);
  const tasksCompleted = useMemo(() => item.tasks_completed || 0, [item.tasks_completed]);
  const totalTasks = useMemo(() => item.total_tasks || 0, [item.total_tasks]);
  
  const priorityColor = useMemo(() => 
    getPriorityColor(item.priority), [item.priority, getPriorityColor]
  );
  
  const statusColor = useMemo(() => 
    getStatusColor(item.status), [item.status, getStatusColor]
  );

  return (
    <TouchableOpacity
      style={[styles.projectCard, style]}
      onPress={handlePress}
      onPressIn={handlePrefetch}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage.image_url }}
              style={styles.projectImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.projectIconPattern}>
              <View style={[styles.patternLine, styles.patternLine1]} />
              <View style={[styles.patternLine, styles.patternLine2]} />
              <View style={[styles.patternLine, styles.patternLine3]} />
            </View>
          )}
          <View style={styles.projectIconBadge}>
            <Ionicons name="folder-outline" size={16} color="#1C30A4" />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.projectMenuButton}
          onPress={handleMenuPress}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {item.title}
      </Text>
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag) => (
            <View
              key={tag.id}
              style={[
                styles.tagChip,
                { backgroundColor: tag.color + "20" }
              ]}
            >
              <Text style={[styles.tagText, { color: tag.color }]}>
                {tag.name}
              </Text>
            </View>
          ))}
          {item.tags.length > 2 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
          )}
        </View>
      )}

      {item.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.projectInfo}>
        <View style={styles.projectInfoItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>{item.owner?.full_name}</Text>
        </View>
        <View style={styles.projectInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>
            {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.projectStats}>
        <View style={styles.projectTeam}>
          <View style={styles.teamAvatars}>
            {item.members?.slice(0, 3).map((member, memberIndex) => (
              <View
                key={member.id}
                style={[
                  styles.teamMember,
                  { marginLeft: memberIndex > 0 ? -8 : 0 },
                ]}
              >
                {renderAvatar(member, 24)}
              </View>
            ))}
            {item.members && item.members.length > 3 && (
              <View
                style={[
                  styles.teamMember,
                  styles.moreMembers,
                  { marginLeft: -8 },
                ]}
              >
                <Text style={styles.moreMembersText}>
                  +{item.members.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.projectBadges}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColor + "20" },
            ]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: priorityColor },
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: priorityColor },
              ]}
            >
              {item.priority}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.projectProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.tasksText}>
              {tasksCompleted}/{totalTasks} tasks
            </Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: statusColor }]}
          >
            {item.status || 'Active'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.priority === nextProps.item.priority &&
    prevProps.item.progress === nextProps.item.progress &&
    prevProps.item.status === nextProps.item.status
  );
});

const FilterChip = React.memo(({ 
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

const EmptyState = React.memo(({ onCreatePress, searchQuery }) => (
  <View style={styles.emptyState}>
    <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
    <Text style={styles.emptyStateTitle}>
      {searchQuery ? "No projects found" : "No projects yet"}
    </Text>
    <Text style={styles.emptyStateText}>
      {searchQuery 
        ? "Try adjusting your search or filter criteria"
        : "Create your first project to get started"
      }
    </Text>
    {!searchQuery && (
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={onCreatePress}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyStateButtonText}>Create Project</Text>
      </TouchableOpacity>
    )}
  </View>
));

const LoadingState = React.memo(() => (
  <View style={styles.loadingState}>
    <ActivityIndicator size="large" color="#1C30A4" />
    <Text style={styles.loadingText}>Loading projects...</Text>
  </View>
));

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // API hooks
  const {
    projects,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProjects({
    search: searchQuery.length >= 2 ? searchQuery : undefined,
    priority: selectedFilter !== "All" ? selectedFilter.toLowerCase() : undefined,
  });

  const deleteProjectMutation = useDeleteProject();
  const prefetchProject = usePrefetchProject();

  // Memoized data processing
  const processedProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.map(project => ({
      ...project,
      progress: Math.round(
        project.tasks?.length > 0
          ? (project.tasks.filter(task => task.status === 'completed').length / project.tasks.length) * 100
          : 0
      ),
      tasks_completed: project.tasks?.filter(task => task.status === 'completed').length || 0,
      total_tasks: project.tasks?.length || 0,
    }));
  }, [projects]);

  const filterStats = useMemo(() => {
    if (!projects) return {};
    
    return {
      all: projects.length,
      high: projects.filter(p => p.priority === 'high').length,
      medium: projects.filter(p => p.priority === 'medium').length,
      low: projects.filter(p => p.priority === 'low').length,
    };
  }, [projects]);

  const filters = useMemo(() => [
    { 
      title: "All", 
      count: filterStats.all, 
      color: "#1C30A4", 
      icon: "apps-outline" 
    },
    { 
      title: "High", 
      count: filterStats.high, 
      color: "#EF4444", 
      icon: "flag" 
    },
    { 
      title: "Medium", 
      count: filterStats.medium, 
      color: "#F59E0B", 
      icon: "flag" 
    },
    { 
      title: "Low", 
      count: filterStats.low, 
      color: "#10B981", 
      icon: "flag" 
    },
  ], [filterStats]);

  // Callbacks
  const handleProjectPress = useCallback((project) => {
    router.push({
      pathname: "/ProjectDetails",
      params: { projectId: project.id }
    });
  }, []);

  const handleFilterPress = useCallback((filter) => {
    setSelectedFilter(filter);
    listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  const handleCreateProject = useCallback(() => {
    navigation.navigate("CreateProject/index");
  }, [navigation]);

  const handleProjectMenu = useCallback((project) => {
    Alert.alert(
      project.title,
      "Choose an action",
      [
        {
          text: "View Details",
          onPress: () => handleProjectPress(project),
        },
        {
          text: "Edit",
          onPress: () => {
            router.push({
              pathname: "/EditProject",
              params: { projectId: project.id }
            });
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteProject(project),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }, [handleProjectPress]);

  const handleDeleteProject = useCallback((project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProjectMutation.mutate(project.id, {
              onSuccess: () => {
                Alert.alert("Success", "Project deleted successfully");
              },
              onError: (error) => {
                Alert.alert("Error", error.message || "Failed to delete project");
              },
            });
          },
        },
      ]
    );
  }, [deleteProjectMutation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Search will be triggered by the useProjects hook
    }, 300);
  }, []);

  const handlePrefetch = useCallback((projectId) => {
    prefetchProject(projectId);
  }, [prefetchProject]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderProjectCard = useCallback(({ item, index }) => (
    <ProjectCard
      item={item}
      onPress={handleProjectPress}
      onMenuPress={handleProjectMenu}
      onPrefetch={handlePrefetch}
      style={index === 0 && styles.firstProjectCard}
    />
  ), [handleProjectPress, handleProjectMenu, handlePrefetch]);

  const renderFilter = useCallback(({ item }) => (
    <FilterChip
      title={item.title}
      count={item.count}
      isActive={selectedFilter === item.title}
      onPress={handleFilterPress}
      color={item.color}
      icon={item.icon}
    />
  ), [selectedFilter, handleFilterPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  // Focus effect for refreshing data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !isFetching) {
        refetch();
      }
    }, [isLoading, isFetching, refetch])
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Projects</Text>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {pagination?.total_items || processedProjects?.length}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Manage your team projects</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleCreateProject}
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
              placeholder="Search projects..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
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
            <Text style={styles.headerTitle}>Projects</Text>
          </View>
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {error?.message || "Failed to load projects"}
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
            <Text style={styles.headerTitle}>Projects</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {pagination?.total_items || processedProjects.length}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage your team projects</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleCreateProject}
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
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filtersSectionTitle}>Filter Projects</Text>
        <FlatList
          horizontal
          data={filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item.title}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Projects Overview Stats as Filters */}
      {/* <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Projects</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsScrollView}
        >
          <TouchableOpacity
            style={[
              styles.progressStatCard,
              selectedFilter === "All" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("All")}
          >
            <View style={styles.progressCardHeader}>
              <View style={styles.progressIcon}>
                <Ionicons name="trending-up" size={12} color="#1C30A4" />
              </View>
              <Text style={styles.progressCardTitle}>All Projects</Text>
            </View>
            <Text style={styles.progressCardNumber}>
              {Math.round(
                projects.reduce((acc, p) => acc + p.progress, 0) /
                  projects.length
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
                        projects.reduce((acc, p) => acc + p.progress, 0) /
                          projects.length
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressCardSubtext}>Avg Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
              selectedFilter === "Completed" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Completed")}
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
              {projects.filter((p) => p.status === "Completed").length}
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
                        (projects.filter((p) => p.status === "Completed")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
              selectedFilter === "In Progress" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("In Progress")}
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
              {projects.filter((p) => p.status === "In Progress").length}
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
                      width: `${
                        (projects.filter((p) => p.status === "In Progress")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F5F3FF", borderColor: "#8B5CF6" },
              selectedFilter === "Review" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Review")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#8B5CF6" }]}
              >
                <Ionicons name="eye" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="remove" size={8} color="#8B5CF6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#8B5CF6" }]}>
              {projects.filter((p) => p.status === "Review").length}
            </Text>
            <Text style={styles.statCardLabel}>Review</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#8B5CF6" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (projects.filter((p) => p.status === "Review").length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#8B5CF6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FFFBEB", borderColor: "#F59E0B" },
              selectedFilter === "Planning" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("Planning")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#F59E0B" }]}
              >
                <Ionicons name="construct" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-down" size={8} color="#F59E0B" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#F59E0B" }]}>
              {projects.filter((p) => p.status === "Planning").length}
            </Text>
            <Text style={styles.statCardLabel}>Plan</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#F59E0B" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (projects.filter((p) => p.status === "Planning")
                          .length /
                          projects.length) *
                        100
                      }%`,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View> */}
      

      {/* Projects List */}
      {processedProjects.length === 0 ? (
        <EmptyState 
          onCreatePress={handleCreateProject} 
          searchQuery={searchQuery}
        />
      ) : (
        <OptimizedList
          ref={listRef}
          data={processedProjects}
          renderItem={renderProjectCard}
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
              onCreatePress={handleCreateProject} 
              searchQuery={searchQuery}
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

// Same styles as before...
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
    backgroundColor: "#fff",
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 2 },
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
  filtersSection: {
    marginBottom: 16,
  },
  filtersSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  filtersContainer: {
    paddingLeft: 20,
    paddingRight: 20,
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
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  firstProjectCard: {
    marginTop: 0,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  projectIconPattern: {
    flex: 1,
    padding: 8,
  },
  patternLine: {
    height: 2,
    backgroundColor: "#1C30A4",
    marginVertical: 1,
    borderRadius: 1,
  },
  patternLine1: { width: "60%" },
  patternLine2: { width: "40%" },
  patternLine3: { width: "80%" },
  projectIconBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
  },
  projectMenuButton: {
    padding: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  projectDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 12,
  },
  projectInfo: {
    marginBottom: 16,
  },
  projectInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  projectStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  projectTeam: {
    flex: 1,
  },
  teamAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamMember: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
  },
  moreMembers: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  projectBadges: {
    marginLeft: 12,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  projectProgress: {
    flex: 1,
    marginRight: 12,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tasksText: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C30A4",
  },
  progressBar: {
    width: "100%",
  },
  progressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C30A4",
    borderRadius: 3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: "#1C30A4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Stats section styles
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
  
  // Progress stat card styles
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
  
  // Stat card styles
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
});

export default Projects;