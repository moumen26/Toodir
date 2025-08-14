import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  useReceivedProjectInvitations,
  useSentProjectInvitations,
  useRespondToProjectInvitation,
  useCancelProjectInvitation,
} from '../hooks/useProjectInvitations';
import ProjectInvitationCard from '../components/ProjectInvitationCard';

const ManageProjectInvitations = () => {
  const [selectedTab, setSelectedTab] = useState('received');
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const navigation = useNavigation();

  // Fetch invitations
  const {
    data: receivedData,
    isLoading: isLoadingReceived,
    error: receivedError,
    refetch: refetchReceived,
  } = useReceivedProjectInvitations({ limit: 50 });

  const {
    data: sentData,
    isLoading: isLoadingSent,
    error: sentError,
    refetch: refetchSent,
  } = useSentProjectInvitations({ limit: 50 });

  // Mutations
  const respondToInvitationMutation = useRespondToProjectInvitation();
  const cancelInvitationMutation = useCancelProjectInvitation();

  const receivedInvitations = receivedData?.data || [];
  const sentInvitations = sentData?.data || [];

  const tabs = [
    { id: 'received', name: 'Received', icon: 'mail', count: receivedInvitations.length },
    { id: 'sent', name: 'Sent', icon: 'paper-plane', count: sentInvitations.length },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === 'received') {
      await refetchReceived();
    } else {
      await refetchSent();
    }
    setRefreshing(false);
  };

  const handleAcceptInvitation = async (invitation) => {
    Alert.alert(
      'Accept Invitation',
      `Accept invitation to join "${invitation.project.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setRespondingTo(invitation.id);
              await respondToInvitationMutation.mutateAsync({
                invitationId: invitation.id,
                action: 'accept'
              });
              Alert.alert('Success', 'Project invitation accepted successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to accept invitation');
            } finally {
              setRespondingTo(null);
            }
          }
        }
      ]
    );
  };

  const handleDeclineInvitation = async (invitation) => {
    Alert.alert(
      'Decline Invitation',
      `Decline invitation to join "${invitation.project.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setRespondingTo(invitation.id);
              await respondToInvitationMutation.mutateAsync({
                invitationId: invitation.id,
                action: 'decline'
              });
              Alert.alert('Success', 'Project invitation declined successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to decline invitation');
            } finally {
              setRespondingTo(null);
            }
          }
        }
      ]
    );
  };

  const handleCancelInvitation = async (invitation) => {
    Alert.alert(
      'Cancel Invitation',
      `Cancel invitation to ${invitation?.user?.full_name} for "${invitation?.project?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRespondingTo(invitation.id);
              await cancelInvitationMutation.mutateAsync(invitation.id);
              Alert.alert('Success', 'Invitation cancelled successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to cancel invitation');
            } finally {
              setRespondingTo(null);
            }
          }
        }
      ]
    );
  };

  const renderReceivedInvitation = ({ item }) => (
    <ProjectInvitationCard
      invitation={item}
      type="received"
      onAccept={() => handleAcceptInvitation(item)}
      onDecline={() => handleDeclineInvitation(item)}
      isLoading={respondingTo === item.id}
    />
  );

  const renderSentInvitation = ({ item }) => (
    <ProjectInvitationCard
      invitation={item}
      type="sent"
      onCancel={() => handleCancelInvitation(item)}
      isLoading={respondingTo === item.id}
    />
  );

  const renderEmptyState = () => {
    const isReceived = selectedTab === 'received';
    
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons 
            name={isReceived ? "mail-outline" : "paper-plane-outline"} 
            size={64} 
            color="#D1D5DB" 
          />
        </View>
        <Text style={styles.emptyTitle}>
          {isReceived ? 'No project invitations' : 'No sent invitations'}
        </Text>
        <Text style={styles.emptyText}>
          {isReceived 
            ? 'You have no pending project invitations'
            : 'You haven\'t sent any project invitations yet'
          }
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    const isLoading = selectedTab === 'received' ? isLoadingReceived : isLoadingSent;
    const error = selectedTab === 'received' ? receivedError : sentError;
    const data = selectedTab === 'received' ? receivedInvitations : sentInvitations;
    const renderItem = selectedTab === 'received' ? renderReceivedInvitation : renderSentInvitation;

    if (isLoading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading invitations...</Text>
        </View>
      );
    }

    if (error && !refreshing) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load invitations</Text>
          <Text style={styles.errorText}>{error.message || 'Something went wrong'}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={selectedTab === 'received' ? refetchReceived : refetchSent}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
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
          data.length === 0 ? styles.emptyContentContainer : styles.listContainer
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Invitations</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <View style={styles.tabContent}>
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={selectedTab === tab.id ? '#1C30A4' : '#6B7280'} 
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.tabBadge,
                  selectedTab === tab.id && styles.activeTabBadge,
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedTab === tab.id && styles.activeTabBadgeText,
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#EEF2FF',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#1C30A4',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#1C30A4',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabBadgeText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ManageProjectInvitations;