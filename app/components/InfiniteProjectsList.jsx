// components/InfiniteProjectsList.jsx
import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectCard from './ProjectCard';

const InfiniteProjectsList = memo(({
  data,
  isLoading,
  isFetching,
  isRefreshing,
  hasNextPage,
  onEndReached,
  onRefresh,
  onProjectPress,
  onProjectMenuPress,
  ListHeaderComponent,
  contentContainerStyle,
}) => {
  // Flatten the paginated data
  const projects = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data || []);
  }, [data]);

  const renderProject = useCallback(({ item }) => (
    <ProjectCard
      project={item}
      onPress={onProjectPress}
      onMenuPress={onProjectMenuPress}
    />
  ), [onProjectPress, onProjectMenuPress]);

  const renderFooter = useCallback(() => {
    if (!hasNextPage) {
      return projects.length > 0 ? (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>You've reached the end!</Text>
        </View>
      ) : null;
    }

    return isFetching ? (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading more projects...</Text>
      </View>
    ) : null;
  }, [hasNextPage, isFetching, projects.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyStateTitle}>No projects found</Text>
        <Text style={styles.emptyStateText}>
          Try adjusting your search or filter criteria
        </Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      onEndReached();
    }
  }, [hasNextPage, isFetching, onEndReached]);

  if (isLoading) {
    return (
      <View style={styles.initialLoading}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={projects}
      renderItem={renderProject}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.listContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#1C30A4']}
          tintColor="#1C30A4"
        />
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={undefined} // Let FlatList calculate dynamic heights
    />
  );
});

InfiniteProjectsList.displayName = 'InfiniteProjectsList';

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  initialLoading: {
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
    color: '#6B7280',
    marginLeft: 8,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endMessageText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default InfiniteProjectsList;