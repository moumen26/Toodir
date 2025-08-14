import { useState, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../hooks/useFriendsQueries';
import { useDebouncedCallback } from '../hooks/useDebounce';

const MembersSelectorModal = memo(({
  visible,
  onClose,
  selectedMembers = [],
  onMembersChange,
  title = "Select Team Members"
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback((query) => {
    setDebouncedQuery(query);
  }, 300);

  // Fetch friends with search
  const {
    data: friendsData,
    isLoading,
    error,
    refetch
  } = useFriends({ 
    search: debouncedQuery,
    limit: 50 
  });

  const friends = friendsData?.data || [];
  const selectedMemberIds = useMemo(() => 
    selectedMembers.map(member => member.id), 
    [selectedMembers]
  );

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleMemberToggle = useCallback((friend) => {
    const isSelected = selectedMemberIds.includes(friend.user.id);
    let newSelectedMembers;

    if (isSelected) {
      newSelectedMembers = selectedMembers.filter(m => m.id !== friend.user.id);
    } else {
      newSelectedMembers = [...selectedMembers, {
        id: friend.user.id,
        full_name: friend.user.full_name,
        email: friend.user.email,
        profile_picture: friend.user.profile_picture,
      }];
    }

    onMembersChange(newSelectedMembers);
  }, [selectedMembers, selectedMemberIds, onMembersChange]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    onClose();
  }, [onClose]);

  const renderAvatar = useCallback((user, size = 40) => (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {user.profile_picture ? (
        <Image
          source={{ uri: user.profile_picture }}
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  ), []);

  const renderMemberItem = useCallback(({ item: friend }) => {
    const isSelected = selectedMemberIds.includes(friend.user.id);
    
    return (
      <TouchableOpacity
        style={[styles.memberItem, isSelected && styles.selectedMemberItem]}
        onPress={() => handleMemberToggle(friend)}
        activeOpacity={0.7}
      >
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatarContainer}>
            {renderAvatar(friend.user, 48)}
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.memberDetails}>
            <Text style={[styles.memberName, isSelected && styles.selectedMemberName]}>
              {friend.user.full_name}
            </Text>
            <Text style={styles.memberEmail}>{friend.user.email}</Text>
            <Text style={styles.friendsSince}>
              Friends since {new Date(friend.friends_since).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedMemberIds, handleMemberToggle, renderAvatar]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyStateTitle}>Failed to load friends</Text>
          <Text style={styles.emptyStateText}>Please try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (debouncedQuery && friends.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No friends found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No friends yet</Text>
          <Text style={styles.emptyStateText}>
            Add friends to invite them to projects
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoading, error, debouncedQuery, friends.length, refetch]);

  const keyExtractor = useCallback((item) => item.friendship_id.toString(), []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedMembers.length} of {friends.length} selected
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchChange("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Members List */}
          <View style={styles.membersContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1C30A4" />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderMemberItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                style={styles.membersList}
                contentContainerStyle={styles.membersListContent}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>
                Done ({selectedMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

MembersSelectorModal.displayName = 'MembersSelectorModal';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  membersContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  membersList: {
    flex: 1,
  },
  membersListContent: {
    paddingBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedMemberItem: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1C30A4',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1C30A4',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  selectedMemberName: {
    color: '#1C30A4',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  friendsSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#1C30A4',
    borderColor: '#1C30A4',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1C30A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#1C30A4',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
});

export default MembersSelectorModal;