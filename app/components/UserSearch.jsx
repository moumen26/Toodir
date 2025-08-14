import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useSendFriendRequest } from '../hooks/useFriendsQueries';
import { useDebouncedCallback } from '../hooks/useDebounce';
import UserCard from './UserCard';

const UserSearch = ({ searchQuery, onSearchChange }) => {
  const [sendingRequestTo, setSendingRequestTo] = useState(null);

  // Search users hook
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSearchUsers(searchQuery, {
    enabled: searchQuery.length >= 2,
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useSendFriendRequest();

  const searchResults = searchData?.data || [];

  const handleSendFriendRequest = async (userId) => {
    try {
      setSendingRequestTo(userId);
      
      await sendFriendRequestMutation.mutateAsync(userId);
      
      Alert.alert(
        'Success',
        'Friend request sent successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send friend request',
        [{ text: 'OK' }]
      );
    } finally {
      setSendingRequestTo(null);
    }
  };

  const confirmSendFriendRequest = (user) => {
    Alert.alert(
      'Send Friend Request',
      `Send a friend request to ${user.full_name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: () => handleSendFriendRequest(user.id),
        },
      ]
    );
  };

  const renderUserItem = ({ item: user }) => {
    const isLoading = sendingRequestTo === user.id;
    
    return (
      <UserCard
        user={user}
        rightContent={
          <TouchableOpacity
            style={[
              styles.addButton,
              isLoading && styles.addButtonDisabled
            ]}
            onPress={() => confirmSendFriendRequest(user)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#1C30A4" />
            ) : (
              <>
                <Ionicons name="person-add" size={16} color="#1C30A4" />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        }
      />
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Search for users</Text>
          <Text style={styles.emptyText}>
            Enter at least 2 characters to search for users by name or email
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No users found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your search terms or search by email address
        </Text>
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Search failed</Text>
      <Text style={styles.errorText}>
        {searchError?.message || 'Something went wrong while searching'}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1C30A4" />
      <Text style={styles.loadingText}>Searching users...</Text>
    </View>
  );

  const renderContent = () => {
    if (searchError) {
      return renderErrorState();
    }

    if (isSearching) {
      return renderLoadingState();
    }

    if (searchResults.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1C30A4',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 12,
    color: '#1C30A4',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default UserSearch;