// (tabs)/projects.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useInfiniteProjects } from "../hooks/useProjectQueries";
import ProjectSearch from "../components/ProjectSearch";
import ProjectStatusFilter from "../components/ProjectStatusFilter";
import ProjectPriorityFilter from "../components/ProjectPriorityFilter";
import InfiniteProjectsList from "../components/InfiniteProjectsList";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("");
  const navigation = useNavigation();

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj = {};
    
    if (searchQuery.trim()) {
      filterObj.search = searchQuery.trim();
    }
    
    if (selectedStatusFilter) {
      filterObj.status = selectedStatusFilter.toLowerCase();
    }
    
    if (selectedPriorityFilter) {
      filterObj.priority = selectedPriorityFilter.toLowerCase();
    }
    
    return filterObj;
  }, [searchQuery, selectedStatusFilter, selectedPriorityFilter]);

  // Fetch projects with infinite scroll
  const {
    data,
    isLoading,
    isFetching,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteProjects(filters);

  // Calculate project statistics for filters
  const projectStats = useMemo(() => {
    if (!data?.pages) return {};    
    const summary = data.pages[0]?.summary || {};    
    const stats = {
      total: summary.total_projects || 0,
      completed: summary.done_projects || 0,
      inProgress: summary.active_projects || 0,
      avgProgress: summary.average_progress || 0,
      high: summary.high_priority || 0,
      medium: summary.medium_priority || 0,
      low: summary.low_priority || 0,
    };

    return stats;
  }, [data]);

  const handleProjectPress = useCallback((project) => {
    navigation.navigate("ProjectDetails/index", { projectId: project.id });
  }, [navigation]);

  const handleProjectMenuPress = useCallback((project) => {
    Alert.alert(
      "Project Options",
      `Manage ${project.title}`,
      [
        { text: "Edit", onPress: () => handleEditProject(project) },
        { text: "Delete", onPress: () => handleDeleteProject(project), style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, []);

  const handleEditProject = useCallback((project) => {
    // Navigate to edit project screen
    Alert.alert("Edit Project", `Edit ${project.title}`);
  }, []);

  const handleDeleteProject = useCallback((project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // TODO: Implement delete mutation
            Alert.alert("Success", "Project deleted successfully");
          }
        },
      ]
    );
  }, []);

  const handleCreateProject = useCallback(() => {
    navigation.navigate("CreateProject/index");
  }, [navigation]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilterChange = useCallback((filter) => {
    setSelectedStatusFilter(filter);
  }, []);

  const handlePriorityFilterChange = useCallback((filter) => {
    setSelectedPriorityFilter(filter);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatusFilter) count++;
    if (selectedPriorityFilter) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedStatusFilter, selectedPriorityFilter, searchQuery]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedStatusFilter("");
    setSelectedPriorityFilter("");
    setSearchQuery("");
  }, []);

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {error.message || "Failed to load projects"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
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
                {projectStats.total || 0}
              </Text>
            </View>
            {activeFiltersCount > 0 && (
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitle}>Manage your team projects</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={handleClearAllFilters}
              >
                <Ionicons name="close-circle" size={16} color="#6B7280" />
                <Text style={styles.clearFiltersText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
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
      <ProjectSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Projects List with Filters and Infinite Scroll */}
      <InfiniteProjectsList
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isRefreshing={isRefreshing}
        hasNextPage={hasNextPage}
        onEndReached={handleEndReached}
        onRefresh={handleRefresh}
        onProjectPress={handleProjectPress}
        onProjectMenuPress={handleProjectMenuPress}
        ListHeaderComponent={
          <View>
            {/* Priority Filter */}
            <ProjectPriorityFilter
              selectedPriority={selectedPriorityFilter}
              onPriorityChange={handlePriorityFilterChange}
              projectStats={projectStats}
              totalProjects={projectStats.total}
            />
            {/* Status Filter */}
            <ProjectStatusFilter
              selectedFilter={selectedStatusFilter}
              onFilterChange={handleStatusFilterChange}
              projectStats={projectStats}
              totalProjects={projectStats.total}
            />
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
    alignItems: "flex-start",
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
    marginBottom: 4,
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
    marginRight: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  filtersBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  filtersBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  clearFiltersText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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
    marginBottom: 24,
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

export default Projects;