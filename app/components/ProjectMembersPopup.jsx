import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFriends } from '../hooks/useFriendsQueries';
import { useAuthStatus } from '../hooks/useAuth';
import SearchBar from './SearchBar';
import UserCard from './UserCard';
import projectMemberService from '../services/projectMemberService';

const ProjectMembersPopup = ({ 
  visible, 
  onClose, 
  project, 
  projectMembers = [],
  isOwner = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [invitingFriends, setInvitingFriends] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);

  const { user } = useAuthStatus();
  const queryClient = useQueryClient();

  // Fetch user's friends
  const {
    data: friendsData,
    isLoading: loadingFriends,
    error: friendsError,
  } = useFriends({ limit: 100 });

  // Invite friends mutation
  const inviteFriendsMutation = useMutation({
    mutationFn: async (friendsToInvite) => {
      const invitePromises = friendsToInvite.map(friend =>
        projectMemberService.inviteFriendToProject({
          friend_id: friend.id,
          project_id: project.id
        })
      );
      return Promise.all(invitePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projectInvitations'] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (membershipId) => {
      return projectMemberService.removeProjectMember(membershipId, project.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
  });

  const friends = friendsData?.data || [];

  // Filter friends based on search and exclude existing members
  const filteredFriends = useMemo(() => {
    if (!friends.length) return [];

    let filtered = friends.filter(friendshipData => {
      const friend = friendshipData.user;
      // Exclude current members
      const isAlreadyMember = projectMembers.some(member => member.id === friend.id);
      return !isAlreadyMember;
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(friendshipData => {
        const friend = friendshipData.user;
        return friend.full_name.toLowerCase().includes(query) ||
               friend.email.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [friends, projectMembers, searchQuery]);

  const handleFriendSelect = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(selected => selected.id === friend.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('No Selection', 'Please select at least one friend to invite.');
      return;
    }

    try {
      setInvitingFriends(true);
      await inviteFriendsMutation.mutateAsync(selectedFriends);
      
      Alert.alert(
        'Success',
        `Successfully sent ${selectedFriends.length} invitation(s)!`,
        [{ 
          text: 'OK', 
          onPress: () => {
            setSelectedFriends([]);
            onClose();
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send invitations',
        [{ text: 'OK' }]
      );
    } finally {
      setInvitingFriends(false);
    }
  };

  const handleRemoveMember = async (member) => {    
    // Find the membership record for this member
    const membershipId = member.membershipId || member.id;
    
    Alert.alert(
      'Remove Member',
      `Remove ${member.full_name} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingMember(member.id);
              await removeMemberMutation.mutateAsync(membershipId);
              
              Alert.alert(
                'Success',
                `${member.full_name} has been removed from the project.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to remove member',
                [{ text: 'OK' }]
              );
            } finally {
              setRemovingMember(null);
            }
          }
        }
      ]
    );
  };

  const renderFriendItem = (friendshipData) => {
    const friend = friendshipData.user;
    const isSelected = selectedFriends.some(selected => selected.id === friend.id);
    
    return (
      <UserCard
        key={friend.id}
        user={friend}
        onPress={() => handleFriendSelect(friend)}
        showCheckbox={true}
        isSelected={isSelected}
        style={styles.friendItem}
      />
    );
  };

  const renderMemberItem = (member) => {
    const isCurrentUser = member.id === user?.id;
    const isProjectOwner = member.id === project?.owner_id;
    const isRemoving = removingMember === member.id;
    
    return (
      <UserCard
        key={member.id}
        user={member}
        subtitle={isProjectOwner ? 'Owner' : 'Member'}
        rightContent={
          isOwner && !isCurrentUser && !isProjectOwner ? (
            <TouchableOpacity
              style={[styles.removeButton, isRemoving && styles.removeButtonDisabled]}
              onPress={() => handleRemoveMember(member)}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="person-remove" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>
          ) : isProjectOwner ? (
            <View style={styles.ownerBadge}>
              <Ionicons name="crown" size={14} color="#F59E0B" />
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          ) : null
        }
        style={styles.memberItem}
      />
    );
  };

  const renderContent = () => {
    if (loadingFriends) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C30A4" />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      );
    }

    if (friendsError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load friends</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Current Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Members ({projectMembers.length})
          </Text>
          <View style={styles.membersList}>
            {projectMembers.map(renderMemberItem)}
          </View>
        </View>

        {/* Invite Friends Section - Only show if user is owner */}
        {isOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Invite Friends ({selectedFriends.length} selected)
            </Text>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search friends..."
              style={styles.searchBar}
            />

            <View style={styles.friendsList}>
              {filteredFriends.length > 0 ? (
                filteredFriends.map(renderFriendItem)
              ) : (
                <View style={styles.emptyFriends}>
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyFriendsText}>
                    {searchQuery.trim() ? 'No friends found' : 'No friends to invite'}
                  </Text>
                </View>
              )}
            </View>

            {selectedFriends.length > 0 && (
              <TouchableOpacity
                style={[styles.inviteButton, invitingFriends && styles.inviteButtonDisabled]}
                onPress={handleInviteFriends}
                disabled={invitingFriends}
              >
                {invitingFriends ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={16} color="#fff" />
                    <Text style={styles.inviteButtonText}>
                      Invite {selectedFriends.length} Friend{selectedFriends.length > 1 ? 's' : ''}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Members</Text>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project?.title}</Text>
          <Text style={styles.projectSubtitle}>
            {isOwner ? 'You can invite friends and manage members' : 'View project members'}
          </Text>
        </View>

        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

ProjectMembersPopup.displayName = 'ProjectMembersPopup';

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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  projectInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  membersList: {
    paddingHorizontal: 20,
  },
  memberItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendsList: {
    paddingHorizontal: 20,
  },
  friendItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyFriends: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFriendsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#1C30A4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#1C30A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProjectMembersPopup;