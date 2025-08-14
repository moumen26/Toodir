// components/SwipeableMemberCard.jsx - Simple version without gesture handler
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SwipeableMemberCard = ({
  member,
  isOwner,
  isProjectOwner,
  isCurrentUser,
  isRemoving,
  onRemove,
  renderAvatar,
}) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleLongPress = () => {
    if (canDelete) {
      setShowDeleteButton(true);
    }
  };

  const handleDeletePress = () => {
    setShowDeleteButton(false);
    onRemove();
  };

  const handleCancelDelete = () => {
    setShowDeleteButton(false);
  };

  const canDelete = isOwner && !isProjectOwner && !isCurrentUser;

  if (!canDelete) {
    // Render normal member card without swipe functionality
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatarContainer}>
            {renderAvatar()}
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.full_name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            <Text style={styles.memberRole}>
              {isProjectOwner ? 'Owner' : 'Member'}
            </Text>
          </View>
        </View>
        <View style={styles.memberActionContainer}>
          {isProjectOwner && (
            <View style={styles.ownerBadge}>
              <Ionicons name="crown" size={14} color="#F59E0B" />
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
          {isCurrentUser && !isProjectOwner && (
            <View style={styles.currentUserBadge}>
              <Text style={styles.currentUserBadgeText}>You</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (showDeleteButton) {
    return (
      <View style={[styles.memberCard, styles.deleteMode]}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatarContainer}>
            {renderAvatar()}
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.full_name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            <Text style={styles.memberRole}>Member</Text>
          </View>
        </View>
        <View style={styles.deleteActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelDelete}
            disabled={isRemoving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, isRemoving && styles.deleteButtonDisabled]}
            onPress={handleDeletePress}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.deleteButtonText}>Remove</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatarContainer}>
            {renderAvatar()}
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.full_name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            <Text style={styles.memberRole}>Member</Text>
          </View>
        </View>
        <View style={styles.longPressIndicator}>
          <Text style={styles.longPressText}>Hold to remove</Text>
          <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 70,
  },
  deleteMode: {
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatarContainer: {
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  memberActionContainer: {
    marginLeft: 12,
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
  currentUserBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentUserBadgeText: {
    fontSize: 12,
    color: '#1C30A4',
    fontWeight: '500',
  },
  longPressIndicator: {
    alignItems: 'center',
  },
  longPressText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  deleteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SwipeableMemberCard;