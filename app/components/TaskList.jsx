import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteTasks } from "../hooks/useTaskQueries";
import TaskCard from "./TaskCard";

const TaskList = memo(({ 
  filters = {}, 
  onTaskPress, 
  showProject = true,
  showAssignments = true,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInfiniteTasks(filters);

  // Flatten all pages into a single array
  const tasks = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page?.data || []);
  }, [data?.pages]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderTask = useCallback(({ item, index }) => (
    <TaskCard
      task={item}
      onPress={onTaskPress}
      showProject={showProject}
      showAssignments={showAssignments}
      style={index === 0 ? styles.firstTask : undefined}
      showCloseButton={true}
    />
  ), [onTaskPress, showProject, showAssignments]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading more tasks...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Tasks</Text>
          <Text style={styles.errorText}>
            {error?.message || "Failed to load tasks. Please try again."}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No tasks found</Text>
        <Text style={styles.emptyText}>
          {Object.keys(filters).length > 0 
            ? "Try adjusting your filters or search criteria"
            : "Create your first task to get started"
          }
        </Text>
      </View>
    );
  }, [isLoading, isError, error, filters]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback((data, index) => ({
    length: 200, // Approximate height of task card
    offset: 200 * index,
    index,
  }), []);

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={["#1C30A4"]}
          tintColor="#1C30A4"
        />
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        tasks.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      getItemLayout={tasks.length > 100 ? getItemLayout : undefined}
    />
  );
});

const TaskListSkeleton = memo(() => {
  const skeletonItems = Array(5).fill(0);

  const renderSkeletonItem = useCallback(({ index }) => (
    <View key={index} style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTextContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
        <View style={styles.skeletonStatus} />
      </View>
      <View style={styles.skeletonDescription} />
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonPriority} />
        <View style={styles.skeletonAvatars}>
          <View style={styles.skeletonAvatar} />
          <View style={[styles.skeletonAvatar, { marginLeft: -8 }]} />
        </View>
      </View>
    </View>
  ), []);

  return (
    <FlatList
      data={skeletonItems}
      renderItem={renderSkeletonItem}
      keyExtractor={(_, index) => `skeleton-${index}`}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  firstTask: {
    marginTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: 'center',
    lineHeight: 20,
  },
  // Skeleton styles
  skeletonCard: {
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
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    width: "70%",
    height: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonSubtitle: {
    width: "40%",
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  skeletonStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  skeletonDescription: {
    width: "90%",
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonPriority: {
    width: 60,
    height: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  skeletonAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
});

TaskList.displayName = 'TaskList';
TaskListSkeleton.displayName = 'TaskListSkeleton';

export { TaskList as default, TaskListSkeleton };