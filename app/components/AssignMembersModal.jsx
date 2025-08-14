import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAssignUserToTask, useUnassignUserFromTask } from "../hooks/useTaskQueries";

const AssignMembersModal = ({ 
  visible, 
  onClose, 
  task, 
  projectMembers = [], 
  projectOwner = null,
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedMembers, setAssignedMembers] = useState(new Set());
  const [pendingChanges, setPendingChanges] = useState(new Map());

  const assignUserMutation = useAssignUserToTask();
  const unassignUserMutation = useUnassignUserFromTask();

  // Initialize assigned members when modal opens or task changes
  useEffect(() => {
    if (task?.assignedUsers) {
      const assignedIds = new Set(task.assignedUsers.map(user => user.id));
      setAssignedMembers(assignedIds);
      setPendingChanges(new Map());
    }
  }, [task]);

  // Create a combined list of all available members (project members + owner)
  const allMembers = useMemo(() => {
    const members = [];
    
    // Add project owner if exists and not already in members
    if (projectOwner) {
      const ownerInMembers = projectMembers.some(member => member.id === projectOwner.id);
      if (!ownerInMembers) {
        members.push({
          ...projectOwner,
          role: "Project Owner",
          isOwner: true,
        });
      }
    }

    // Add project members
    projectMembers.forEach(member => {
      members.push({
        ...member,
        role: member.role || "Project Member",
        isOwner: projectOwner?.id === member.id,
      });
    });

    return members;
  }, [projectMembers, projectOwner]);

  // Separate and filter members based on assignment status
  const { assignedMembersList, unassignedMembersList } = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const filterMember = (member) => {
      if (!query) return true;
      return (
        member.full_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    };

    const assigned = [];
    const unassigned = [];

    allMembers.forEach(member => {
      if (!filterMember(member)) return;

      const isCurrentlyAssigned = assignedMembers.has(member.id);
      const pendingAction = pendingChanges.get(member.id);
      
      // Determine final status considering pending changes
      let finalStatus = isCurrentlyAssigned;
      if (pendingAction === 'assign') finalStatus = true;
      if (pendingAction === 'unassign') finalStatus = false;

      if (finalStatus) {
        assigned.push({
          ...member,
          pendingAction,
          isCurrentlyAssigned,
        });
      } else {
        unassigned.push({
          ...member,
          pendingAction,
          isCurrentlyAssigned,
        });
      }
    });

    return {
      assignedMembersList: assigned,
      unassignedMembersList: unassigned,
    };
  }, [allMembers, searchQuery, assignedMembers, pendingChanges]);

  // Create sections for SectionList
  const sections = useMemo(() => {
    const sectionsList = [];
    
    if (assignedMembersList.length > 0) {
      sectionsList.push({
        title: `Assigned Members (${assignedMembersList.length})`,
        data: assignedMembersList,
        type: 'assigned'
      });
    }
    
    if (unassignedMembersList.length > 0) {
      sectionsList.push({
        title: `Available Members (${unassignedMembersList.length})`,
        data: unassignedMembersList,
        type: 'unassigned'
      });
    }

    return sectionsList;
  }, [assignedMembersList, unassignedMembersList]);

  const handleMemberAction = useCallback((member) => {
    const isCurrentlyAssigned = assignedMembers.has(member.id);
    const currentPendingAction = pendingChanges.get(member.id);
    
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      
      if (isCurrentlyAssigned) {
        // If currently assigned, toggle between unassign and no change
        if (currentPendingAction === 'unassign') {
          newChanges.delete(member.id); // Remove pending change
        } else {
          newChanges.set(member.id, 'unassign'); // Mark for unassignment
        }
      } else {
        // If not currently assigned, toggle between assign and no change
        if (currentPendingAction === 'assign') {
          newChanges.delete(member.id); // Remove pending change
        } else {
          newChanges.set(member.id, 'assign'); // Mark for assignment
        }
      }
      
      return newChanges;
    });
  }, [assignedMembers, pendingChanges]);

  const handleApplyChanges = useCallback(async () => {
    if (!task || pendingChanges.size === 0) return;

    const toAssign = [];
    const toUnassign = [];

    pendingChanges.forEach((action, userId) => {
      if (action === 'assign') {
        toAssign.push(userId);
      } else if (action === 'unassign') {
        toUnassign.push(userId);
      }
    });

    try {
      // Process assignments
      for (const userId of toAssign) {
        await assignUserMutation.mutateAsync({ taskId: task.id, userId });
      }

      // Process unassignments
      for (const userId of toUnassign) {
        await unassignUserMutation.mutateAsync({ taskId: task.id, userId });
      }

      Alert.alert("Success", "Task assignments updated successfully!");
      setPendingChanges(new Map());
      onClose();
    } catch (error) {
      console.log(error);
    }
  }, [task, pendingChanges, assignUserMutation, unassignUserMutation, onClose]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setPendingChanges(new Map());
    onClose();
  }, [onClose]);

  const renderMemberAvatar = useCallback((member, size = 40) => (
    <View
      style={[
        styles.memberAvatar,
        { width: size, height: size, borderRadius: size / 2 },
        member.isOwner && styles.ownerAvatar,
      ]}
    >
      {member?.profile_picture ? (
        <Image
          source={{ uri: member.profile_picture }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons 
          name={"person"} 
          size={size * 0.5} 
          color={member.isOwner ? "#F59E0B" : "#6B7280"} 
        />
      )}
    </View>
  ), []);

  const getActionButtonStyle = useCallback((member, sectionType) => {
    const { pendingAction, isCurrentlyAssigned } = member;
    
    if (sectionType === 'assigned') {
      if (pendingAction === 'unassign') {
        return {
          style: styles.unassignButton,
          text: "Undo Unassign",
          icon: "refresh",
          color: "#F59E0B"
        };
      }
      return {
        style: styles.unassignButton,
        text: "Unassign",
        icon: "remove-circle-outline",
        color: "#EF4444"
      };
    } else {
      if (pendingAction === 'assign') {
        return {
          style: styles.undoAssignButton,
          text: "Undo Assign",
          icon: "refresh",
          color: "#F59E0B"
        };
      }
      return {
        style: styles.assignButton,
        text: "Assign",
        icon: "add-circle-outline",
        color: "#10B981"
      };
    }
  }, []);

  const renderMemberItem = useCallback(({ item: member, section }) => {
    const actionButton = getActionButtonStyle(member, section.type);
    const hasChange = pendingChanges.has(member.id);
    
    return (
      <View style={[
        styles.memberItem,
        hasChange && styles.memberItemWithPendingChange
      ]}>
        <View style={styles.memberInfo}>
          {renderMemberAvatar(member)}
          <View style={styles.memberDetails}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>
                {member.full_name}
              </Text>
              {hasChange && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {member.pendingAction === 'assign' ? 'WILL ASSIGN' : 'WILL REMOVE'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.memberRole}>{member.role}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            {member.isCurrentlyAssigned && !hasChange && (
              <Text style={styles.currentlyAssignedText}>
                Currently assigned
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[actionButton.style, hasChange && styles.actionButtonPending]}
          onPress={() => handleMemberAction(member)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={actionButton.icon} 
            size={16} 
            color={hasChange ? "#F59E0B" : actionButton.color} 
          />
          <Text style={[
            styles.actionButtonText, 
            { color: hasChange ? "#F59E0B" : actionButton.color }
          ]}>
            {actionButton.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [renderMemberAvatar, getActionButtonStyle, pendingChanges, handleMemberAction]);

  const renderSectionHeader = useCallback(({ section }) => {
    console.log('Rendering section header:', section.title);
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  }, []);

  const hasChanges = pendingChanges.size > 0;
  const isProcessing = assignUserMutation.isLoading || unassignUserMutation.isLoading;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Assign Members</Text>
              <Text style={styles.modalSubtitle}>
                {task?.project?.title || "Task Assignment"}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Summary */}
          {hasChanges && (
            <View style={styles.changesContainer}>
              <View style={styles.changesIndicator}>
                <Ionicons name="sync" size={16} color="#F59E0B" />
                <Text style={styles.changesText}>
                  {pendingChanges.size} pending change{pendingChanges.size !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          )}

          {/* Members List */}
          <View style={styles.membersContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1C30A4" />
                <Text style={styles.loadingText}>Loading members...</Text>
              </View>
            ) : sections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No members found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? "Try adjusting your search" : "No project members available"}
                </Text>
              </View>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMemberItem}
                renderSectionHeader={renderSectionHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sectionListContent}
                stickySectionHeadersEnabled={true}
              />
            )}
          </View>

          {/* Footer Actions */}
          <View style={styles.footerActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.applyButton,
                (!hasChanges || isProcessing) && styles.disabledButton
              ]} 
              onPress={handleApplyChanges}
              disabled={!hasChanges || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>
                  Apply Changes ({pendingChanges.size})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    height: "85%",
    overflow: "hidden",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
  changesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FED7AA",
  },
  changesIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  changesText: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "500",
    marginLeft: 8,
  },
  membersContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  sectionListContent: {
    paddingBottom: 16,
  },
  sectionList: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#fff",
  },
  memberItemWithPendingChange: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FED7AA",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  memberAvatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  ownerAvatar: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  ownerBadgeText: {
    fontSize: 10,
    color: "#F59E0B",
    fontWeight: "600",
    marginLeft: 2,
  },
  pendingBadge: {
    backgroundColor: "#FED7AA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 9,
    color: "#F59E0B",
    fontWeight: "700",
  },
  memberRole: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 1,
  },
  memberEmail: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  currentlyAssignedText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 2,
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  unassignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  undoAssignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  actionButtonPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#1C30A4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default AssignMembersModal;