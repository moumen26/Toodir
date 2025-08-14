import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useDebouncedCallback } from "../hooks/useDebounce";
import TaskList from "../components/TaskList";
import StatusFilters from "../components/StatusFilters";
import { useTaskStats } from "../hooks/useTaskQueries";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
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
    { value: "priority", label: "Priority" },
    { value: "end_date", label: "Due Date" },
    { value: "start_date", label: "Start Date" },
    { value: "closed", label: "Status" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  const { data: stats, isLoading: statsLoading } = useTaskStats(
    { enabled: true }
  );
  const statusOptions = [
    {
      id: "all",
      name: "All Tasks",
      icon: "list",
      color: "#1C30A4",
      count: stats?.data?.overview?.total_tasks || 0,
      progress: stats?.data?.productivity?.completion_rate || 0,
    },
    {
      id: "active",
      name: "Active",
      icon: "time",
      color: "#3B82F6",
      count: stats?.data?.overview?.active_tasks || 0,
      progress: stats?.data?.breakdown?.by_status?.active || 0,
    },
    {
      id: "completed",
      name: "Done",
      icon: "checkmark-circle",
      color: "#10B981",
      count: stats?.data?.overview?.closed_tasks || 0,
      progress: stats?.data?.breakdown?.by_status?.closed || 0,
    },
    {
      id: "overdue",
      name: "Overdue",
      icon: "warning",
      color: "#EF4444",
      count: stats?.data?.overview?.overdue_tasks || 0,
      progress: stats?.data?.productivity?.overdue_rate || 0,
    },
    {
      id: "upcoming",
      name: "Upcoming",
      icon: "calendar",
      color: "#F59E0B",
      count: stats?.data?.overview?.upcoming_tasks || 0,
      progress: 0,
    },
  ];

  // Debounced search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((query) => {
    setSearchQuery(query);
  }, 300);

  // Convert filter to API parameters
  const apiFilters = useMemo(() => {
    const filters = {};

    // Add search query
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    // Add status filters
    switch (selectedFilter) {
      case "active":
        filters.status = "active";
        break;
      case "completed":
        filters.status = "closed";
        break;
      case "overdue":
        filters.status = "overdue";
        break;
      case "upcoming":
        filters.status = "upcoming";
        break;
      case "high":
      case "medium":
      case "low":
        filters.priority = selectedFilter;
        break;
      // "all" doesn't need any additional filters
    }

    // Add detailed filters
    if (detailedFilters.priority && !filters.priority) {
      filters.priority = detailedFilters.priority;
    }

    // Add sorting
    filters.sort_by = detailedFilters.sort_by;
    filters.sort_order = sortOrder;

    return filters;
  }, [searchQuery, selectedFilter, sortOrder, detailedFilters]);

  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  const handleSortOrderToggle = useCallback(() => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  }, []);

  const handleDetailedFilterChange = useCallback((field, value) => {
    setDetailedFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleApplyDetailedFilters = useCallback(() => {
    setShowDetailedFilters(false);
  }, []);

  const handleResetDetailedFilters = useCallback(() => {
    setDetailedFilters({
      priority: "",
      sort_by: "created_at",
    });
  }, []);

  const handleTaskPress = useCallback((task) => {
    router.push(`/TaskDetails?taskId=${task.id}`);
  }, []);

  const handleSearchChange = useCallback((text) => {
    debouncedSearch(text);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    debouncedSearch("");
  }, [debouncedSearch]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate("CreateTask/index");
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <View style={styles.headerBadge}>
              <Ionicons name="list" size={12} color="#fff" />
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

      {/* Search Bar and Controls */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, projects, or assignees..."
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
            {(detailedFilters.priority || detailedFilters.sort_by !== "created_at") && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filters */}
      <StatusFilters
        type="tasks"
        filters={statusOptions}
        stats={stats}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Tasks List */}
      <TaskList
        filters={apiFilters}
        onTaskPress={handleTaskPress}
        showProject={true}
        showAssignments={true}
        style={styles.tasksList}
        contentContainerStyle={styles.tasksListContent}
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
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    paddingBottom: 100,
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
    maxHeight: 300,
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

export default Tasks;