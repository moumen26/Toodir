import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TaskFilters = memo(({ 
  filters,
  stats,
  type,
  selectedFilter, 
  onFilterChange,
}) => {

  const handleFilterPress = useCallback((filterId) => {
    onFilterChange(filterId);
  }, [onFilterChange]);

  const renderFilterCard = useCallback((filter, isMainFilter = true) => {
    const isSelected = selectedFilter === filter.id;
    
    if (isMainFilter) {
      return (
        <TouchableOpacity
          key={filter.id}
          style={[
            filter.id === "all" ? styles.progressStatCard : styles.statCard,
            { 
              backgroundColor: filter.id === "all" ? filter.color : "#fff",
              borderColor: filter.color 
            },
            isSelected && styles.activeFilterCard,
          ]}
          onPress={() => handleFilterPress(filter.id)}
        >
          {filter.id === "all" ? (
            // Special card for "All Tasks" with progress
            <>
              <View style={styles.progressCardHeader}>
                <View style={styles.progressIcon}>
                  <Ionicons name={filter.icon} size={12} color="#fff" />
                </View>
                <Text style={styles.progressCardTitle}>{filter.name}</Text>
              </View>
              <Text style={styles.progressCardNumber}>
                {filter.progress}%
              </Text>
              <View style={styles.progressCardBar}>
                <View style={styles.progressCardBackground}>
                  <View
                    style={[
                      styles.progressCardFill,
                      { width: `${filter.progress}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.progressCardSubtext}>
                Completion Rate
              </Text>
            </>
          ) : (
            // Regular stat cards
            <>
              <View style={styles.statCardHeader}>
                <View
                  style={[styles.statCardIcon, { backgroundColor: filter.color }]}
                >
                  <Ionicons name={filter.icon} size={10} color="#fff" />
                </View>
                <View style={styles.statCardTrend}>
                  <Ionicons 
                    name={filter.count > 0 ? "arrow-up" : "remove"} 
                    size={8} 
                    color={filter.color} 
                  />
                </View>
              </View>
              <Text style={[styles.statCardNumber, { color: filter.color }]}>
                {filter.count}
              </Text>
              <Text style={styles.statCardLabel}>{filter.name}</Text>
              <View style={styles.statCardProgress}>
                <View
                  style={[
                    styles.statCardProgressBg,
                    { backgroundColor: filter.color + "30" },
                  ]}
                >
                  <View
                    style={[
                      styles.statCardProgressFill,
                      {
                        width: `${Math.min(filter.progress, 100)}%`,
                        backgroundColor: filter.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      );
    } else {
      // Priority filters (smaller cards)
      return (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.priorityCard,
            { borderColor: filter.color },
            isSelected && styles.activePriorityCard,
          ]}
          onPress={() => handleFilterPress(filter.id)}
        >
          <View style={styles.priorityCardContent}>
            <Ionicons name={filter.icon} size={14} color={filter.color} />
            <Text style={[styles.priorityCardNumber, { color: filter.color }]}>
              {filter.count}
            </Text>
          </View>
          <Text style={styles.priorityCardLabel}>{filter.name}</Text>
        </TouchableOpacity>
      );
    }
  }, [selectedFilter, handleFilterPress]);

  return (
    <View style={styles.container}>      
      {/* Main Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContainer}
        style={styles.filtersScrollView}
      >
        {filters.map((filter) => renderFilterCard(filter, true))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  totalCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  filtersScrollView: {
    marginBottom: 16,
  },
  filtersScrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  priorityFiltersScrollView: {
    marginBottom: 0,
  },
  priorityFiltersContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  progressStatCard: {
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
  statCard: {
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
  priorityCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    width: 70,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  activePriorityCard: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.3,
    elevation: 4,
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
  priorityCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  priorityCardNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  priorityCardLabel: {
    fontSize: 8,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
});

TaskFilters.displayName = 'TaskFilters';

export default TaskFilters;