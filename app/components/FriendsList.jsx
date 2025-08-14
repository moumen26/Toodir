import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, useSendFriendRequest } from '../hooks/useFriendsQueries';
import { useDebouncedCallback } from '../hooks/useDebounce';
import SearchBar from './SearchBar';
import UserCard from './UserCard';

const FriendsList = ({ 
  searchQuery, 
  onSearchChange, 
  showActions = true,
  selectionMode = false,
  selectedFriends = [],
  onFriendSelect,
  projectMembers = []
}) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch friends data
  const {
    data: friendsData,
    isLoading,
    error,
    refetch
  } = useFriends({
    search: searchQuery,
    limit: 50
  });

  const sendFriendRequestMutation = useSendFriendRequest();

  const friends = friendsData?.data || [];

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    
    const query = searchQuery.toLowerCase();
    return friends.filter(friend => 
      friend.user.full_name.toLowerCase().includes(query) ||
      friend.user.email.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  // Check if friend is already a project member
  const isFriendProjectMember = (friendId) => {
    return projectMembers.some(member => member.id === friendId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleFriendPress = (friend) => {
    if (selectionMode && onFriendSelect) {
      onFriendSelect(friend.user);
    }
  };

  const renderFriendItem = ({ item: friendshipData }) => {
    const friend = friendshipData.user;
    const isSelected = selectedFriends.some(selected => selected.id === friend.id);
    const isMember = isFriendProjectMember(friend.id);
    
    return (
      <UserCard
        user={friend}
        onPress={() => handleFriendPress(friendshipData)}
        showCheckbox={selectionMode}
        isSelected={isSelected}
        disabled={isMember}
        rightContent={
          isMember ? (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Member</Text>
            </View>
          ) : selectionMode ? null : (
            <View style={styles.friendStatusContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.friendStatusText}>Friend</Text>
            </View>
          )
        }
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() ? 'No friends found' : 'No friends yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery.trim() 
          ? 'Try adjusting your search terms'
          : 'Start adding friends to see them here'
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load friends</Text>
      <Text style={styles.errorText}>
        {error?.message || 'Something went wrong'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredFriends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.friendship_id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1C30A4"
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          filteredFriends.length === 0 ? styles.emptyContentContainer : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1C30A4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  memberBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  friendStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendStatusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default FriendsList;