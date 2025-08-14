import React, { useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import friendsService from '../services/friendsService';
import UserCard from './UserCard';

const FriendInvitations = ({ type = 'received' }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const queryClient = useQueryClient();

  // Fetch invitations based on type
  const {
    data: invitationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['friendInvitations', type],
    queryFn: () => {
      // Note: You'll need to add these methods to your friendsService
      if (type === 'received') {
        return friendsService.getReceivedFriendRequests();
      } else {
        return friendsService.getSentFriendRequests();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Respond to friend request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: ({ requestId, action }) => {
      // You'll need to add this method to your friendsService
      return friendsService.respondToFriendRequest(requestId, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  // Cancel friend request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: (requestId) => {
      return friendsService.cancelFriendRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendInvitations'] });
    },
  });

  const invitations = invitationsData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespondToRequest = async (invitation, action) => {
    try {
      setRespondingTo(invitation.id);
      
      await respondToRequestMutation.mutateAsync({
        requestId: invitation.id,
        action
      });

      const actionText = action === 'accept' ? 'accepted' : 'declined';
      Alert.alert(
        'Success',
        `Friend request ${actionText} successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || `Failed to ${action} friend request`,
        [{ text: 'OK' }]
      );
    } finally {
      setRespondingTo(null);
    }
  };

  const handleCancelRequest = async (invitation) => {
    try {
      setRespondingTo(invitation.id);
      
      await cancelRequestMutation.mutateAsync(invitation.id);
      
      Alert.alert(
        'Success',
        'Friend request cancelled successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to cancel friend request',
        [{ text: 'OK' }]
      );
    } finally {
      setRespondingTo(null);
    }
  };

  const confirmAction = (invitation, action) => {
    const user = type === 'received' ? invitation.requester : invitation.addressee;
    let title, message, onPress;

    if (action === 'accept') {
      title = 'Accept Friend Request';
      message = `Accept friend request from ${user.full_name}?`;
      onPress = () => handleRespondToRequest(invitation, 'accept');
    } else if (action === 'decline') {
      title = 'Decline Friend Request';
      message = `Decline friend request from ${user.full_name}?`;
      onPress = () => handleRespondToRequest(invitation, 'decline');
    } else if (action === 'cancel') {
      title = 'Cancel Friend Request';
      message = `Cancel friend request to ${user.full_name}?`;
      onPress = () => handleCancelRequest(invitation);
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: action === 'decline' ? 'Decline' : 'Confirm', onPress },
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const renderInvitationItem = ({ item: invitation }) => {
    const user = type === 'received' ? invitation.requester : invitation.addressee;
    const isLoading = respondingTo === invitation.id;
    const timeAgo = formatDate(invitation.requested_at);

    const renderActions = () => {
      if (type === 'received') {
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, isLoading && styles.actionButtonDisabled]}
              onPress={() => confirmAction(invitation, 'accept')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton, isLoading && styles.actionButtonDisabled]}
              onPress={() => confirmAction(invitation, 'decline')}
              disabled={isLoading}
            >
              <Ionicons name="close" size={16} color="#EF4444" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <View style={styles.actionsContainer}>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, isLoading && styles.actionButtonDisabled]}
              onPress={() => confirmAction(invitation, 'cancel')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close" size={16} color="#EF4444" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      }
    };

    return (
      <View style={styles.invitationCard}>
        <UserCard
          user={user}
          subtitle={`${type === 'received' ? 'Sent' : 'Sent to'} ${timeAgo}`}
          rightContent={renderActions()}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={type === 'received' ? 'mail-outline' : 'paper-plane-outline'} 
        size={64} 
        color="#D1D5DB" 
      />
      <Text style={styles.emptyTitle}>
        {type === 'received' ? 'No friend requests' : 'No sent requests'}
      </Text>
      <Text style={styles.emptyText}>
        {type === 'received' 
          ? 'You have no pending friend requests'
          : 'You have no pending sent requests'
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to load requests</Text>
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
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={invitations}
        renderItem={renderInvitationItem}
        keyExtractor={(item) => item.id.toString()}
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
          invitations.length === 0 ? styles.emptyContentContainer : styles.listContainer
        }
      />
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
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  declineButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  declineButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
});

export default FriendInvitations;