// (tabs)/projects.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useDebouncedCallback } from "../hooks/useDebounce";
import { useInfiniteProjects } from "../hooks/useProjectQueries";
import ProjectStatusFilter from "../components/ProjectStatusFilter";
import ProjectPriorityFilter from "../components/ProjectPriorityFilter";
import InfiniteProjectsList from "../components/InfiniteProjectsList";
import { useTaskStats } from "../hooks/useTaskQueries";
import StatusFilters from "../components/StatusFilters";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDetailedFilters, setShowDetailedFilters] = useState(false);
  const [detailedFilters, setDetailedFilters] = useState({
    priority: "",
    sort_by: "created_at",
  });
  const navigation = useNavigation();

  // Sort and filter options
  const sortByOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "title", label: "Title" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  // Debounced search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((query) => {
    setSearchQuery(query);
  }, 300);

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj = {};
    
    if (searchQuery.trim()) {
      filterObj.search = searchQuery.trim();
    }
    
    // Use detailed filters if they exist, otherwise use quick filters
    const finalStatus = detailedFilters.status || selectedStatusFilter;
    const finalPriority = detailedFilters.priority || selectedPriorityFilter;
    
    if (finalStatus) {
      filterObj.status = finalStatus.toLowerCase();
    }
    
    if (finalPriority) {
      filterObj.priority = finalPriority.toLowerCase();
    }

    // Add sorting
    filterObj.sort_by = detailedFilters.sort_by;
    filterObj.sort_order = sortOrder;
    
    return filterObj;
  }, [searchQuery, selectedStatusFilter, selectedPriorityFilter, sortOrder, detailedFilters]);

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

  const statusOptions = [
    {
      id: "all",
      name: "All Tasks",
      icon: "list",
      color: "#1C30A4",
      count: projectStats.avgProgress || 0,
      progress: projectStats.avgProgress || 0,
    },
    {
      id: "active",
      name: "Active",
      icon: "time",
      color: "#3B82F6",
      count: projectStats.inProgress || 0,
      progress: (projectStats.inProgress/projectStats.total)*100 || 0,
    },
    {
      id: "done",
      name: "Done",
      icon: "checkmark-circle",
      color: "#10B981",
      count: projectStats.completed || 0,
      progress: (projectStats.completed/projectStats.total)*100 || 0,
    }
  ];

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

  const handleSearchChange = useCallback((text) => {
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleStatusFilterChange = useCallback((filter) => {
    setSelectedStatusFilter(filter);
  }, []);

  const handleSortOrderToggle = useCallback(() => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  }, []);

  const handleDetailedFilterChange = useCallback((field, value) => {
    setDetailedFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear quick filters when using detailed filters
    if (field === "status") {
      setSelectedStatusFilter("");
    }
    if (field === "priority") {
      setSelectedPriorityFilter("");
    }
  }, []);

  const handleApplyDetailedFilters = useCallback(() => {
    setShowDetailedFilters(false);
  }, []);

  const handleResetDetailedFilters = useCallback(() => {
    setDetailedFilters({
      priority: "",
      status: "",
      sort_by: "created_at",
    });
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    debouncedSearch("");
  }, [debouncedSearch]);

  // Show active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStatusFilter || detailedFilters.status) count++;
    if (selectedPriorityFilter || detailedFilters.priority) count++;
    if (searchQuery.trim()) count++;
    if (detailedFilters.sort_by !== "created_at") count++;
    return count;
  }, [selectedStatusFilter, selectedPriorityFilter, searchQuery, detailedFilters]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedStatusFilter("");
    setSelectedPriorityFilter("");
    setSearchQuery("");
    debouncedSearch("");
    setDetailedFilters({
      priority: "",
      status: "",
      sort_by: "created_at",
    });
    setSortOrder("desc");
  }, [debouncedSearch]);

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

      {/* Search Bar and Controls */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, clients, or categories..."
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
            defaultValue={searchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Sort and Filter Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSortOrderToggle}
          >
            <Ionicons 
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"} 
              size={16} 
              color="#1C30A4" 
            />
            <Text style={styles.sortButtonText}>
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDetailedFilters(true)}
          >
            <Ionicons name="options" size={16} color="#1C30A4" />
            <Text style={styles.filterButtonText}>Filters</Text>
            {(detailedFilters.priority || detailedFilters.status || detailedFilters.sort_by !== "created_at") && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
            {/* Status Filters */}
            <StatusFilters
              type="projects"
              filters={statusOptions}
              stats={projectStats}
              selectedFilter={selectedStatusFilter}
              onFilterChange={handleStatusFilterChange}
            />
          </View>
        }
      />

      {/* Detailed Filters Modal */}
      <Modal
        visible={showDetailedFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailedFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailedFilters(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDetailedFilters(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Priority Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Priority</Text>
                <View style={styles.optionsGrid}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        detailedFilters.priority === option.value && styles.selectedOption,
                      ]}
                      onPress={() => handleDetailedFilterChange("priority", option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          detailedFilters.priority === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.optionsGrid}>
                  {sortByOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        detailedFilters.sort_by === option.value && styles.selectedOption,
                      ]}
                      onPress={() => handleDetailedFilterChange("sort_by", option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          detailedFilters.sort_by === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetDetailedFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyDetailedFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 6,
  },
  filterIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 0,
    width: "90%",
    maxWidth: 400,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: "48%",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#1C30A4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default Projects;