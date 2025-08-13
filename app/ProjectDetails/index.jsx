import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { useProject, useProjectStats } from "../hooks/useProjects";
import { useTasksByProject } from "../hooks/useTasks";
import { useTaskComments, useCreateComment } from "../hooks/useTaskComments";
import { useAuthStatus } from "../hooks/useAuth";
import Constants from 'expo-constants';
import LoadingState from '../components/LoadingState'

const ProjectDetails = () => {
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [expandedTask, setExpandedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newProjectComment, setNewProjectComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedAssignedUsers, setExpandedAssignedUsers] = useState({});

  // Helper function to toggle assigned users visibility
  const toggleAssignedUsers = (taskId) => {
    setExpandedAssignedUsers(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

  // Get project ID from route params
  const { projectId } = useLocalSearchParams();
  
  // Add API hooks
  const { user } = useAuthStatus();
  const { project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { stats } = useProjectStats(projectId);
  const createCommentMutation = useCreateComment();

  // Process project data for display
  const displayProject = {
    ...project,
  };  

  // Handle task comment creation
  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        taskId,
        commentData: {
          content: newComment.trim(),
          parent_comment_id: null,
        }
      });

      setNewComment("");
    } catch (error) {
      console.log("Failed to add comment");
    }
  };

  // Update renderOverviewTab to use real data
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Project Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {displayProject?.tasks.filter((t) => t.closed).length}/
            {displayProject?.tasks.length}
          </Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{displayProject?.members.length}</Text>
          <Text style={styles.statLabel}>Team</Text>
        </View>
      </View>

      {/* Description */}
      {displayProject.description &&
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{displayProject.description}</Text>
        </View>
      }

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Owner</Text>
            <Text style={styles.detailValue}>{project.owner?.full_name || 'Unknown'}</Text>
          </View>
          {displayProject.end_date && 
            <>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Start date</Text>
                <Text style={styles.detailValue}>{new Date(displayProject.start_date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>End date</Text>
                <Text style={styles.detailValue}>{new Date(displayProject.end_date).toLocaleDateString()}</Text>
              </View>
            </>
          }
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Rest remains the same but with real comment handling */}
    </View>
  );

  // Update renderTasksTab to use real data
  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks ({displayProject?.tasks.length})</Text>
        <TouchableOpacity onPress={handleAddTask} style={styles.addTaskButton}>
          <Ionicons name="add" size={16} color="#1C30A4" />
          <Text style={styles.addTaskText}>Add</Text>
        </TouchableOpacity>
      </View>

      {displayProject?.tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>No tasks yet</Text>
        </View>
      ) : (
        displayProject.tasks.map((task) => (         
          <View key={task?.id} style={styles.taskCard}>
            <TouchableOpacity onPress={() => handleTaskPress(task)}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskHeaderRight}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) + "20" },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(task.priority) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(task.priority) },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedTask === task.id ? "chevron-up" : "chevron-down"
                    }
                    size={16}
                    color="#9CA3AF"
                    style={styles.expandIcon}
                  />
                </View>
              </View>
              {task.description &&
                <View style={styles.taskHeader}>
                    <Text style={styles.projectCategory}>{task.description}</Text>
                </View>
              }
              <View style={styles.taskDetails}>
                <View style={styles.taskLeftDetails}>
                  {task.end_date &&
                    <View style={styles.taskDetail}>
                      <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                      <Text style={styles.taskDetailText}>
                        {new Date(task.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                  }
                  <View style={styles.taskDetail}>
                    <Ionicons name="person-outline" size={12} color="#6B7280" />
                    <View style={styles.assignedUsersContainer}>
                      <Text style={styles.taskDetailText}>
                        {task.assignedUsers[0]?.full_name || 'Unassigned'}
                      </Text>
                      {/* Show "more" button if there are additional users */}
                      {task.assignedUsers && task.assignedUsers.length > 1 && (
                        <TouchableOpacity 
                          onPress={() => toggleAssignedUsers(task.id)}
                          style={styles.moreButton}
                        >
                          <Text style={styles.moreButtonText}>
                            {expandedAssignedUsers[task.id] ? 'less' : `+${task.assignedUsers.length - 1} more`}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Show additional assigned users when expanded */}
                      {expandedAssignedUsers[task.id] && task.assignedUsers.slice(1).map((user, index) => (
                        <Text key={`${task.id}-user-${index}`} style={styles.additionalUserText}>
                          {user.full_name}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Expanded Comments Section */}
            {expandedTask === task.id && (
              <TaskCommentSection
                taskId={task.id}
                newComment={newComment}
                setNewComment={setNewComment}
                onAddComment={() => handleAddComment(task.id)}
              />
            )}
          </View>
        ))
      )}
    </View>
  );

  // Create a separate component for task comments to optimize performance
  const TaskCommentSection = ({ taskId, newComment, setNewComment, onAddComment }) => {
    const { comments, isLoading: commentsLoading } = useTaskComments(taskId);    
    return (
      <View style={styles.commentsSection}>
        <View style={styles.commentsDivider} />

        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments ({comments?.length || 0})
          </Text>
        </View>

        {commentsLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingState />
          </View>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <View key={comment.id} style={styles.taskCommentCard}>
              <View style={styles.taskCommentHeader}>
                {renderAvatar(
                  { avatar: comment.author.profile_picture, name: comment.author.full_name },
                  20
                )}
                <View style={styles.taskCommentInfo}>
                  <Text style={styles.taskCommentAuthor}>
                    {comment.author.full_name}
                  </Text>
                  <Text style={styles.taskCommentTime}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskCommentText}>
                {comment.content}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noCommentsText}>No comments yet</Text>
        )}

        {/* Add Comment Input */}
        <View style={styles.addCommentContainer}>
          <View style={styles.addCommentInputContainer}>
            <TextInput
              style={styles.addCommentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[
                styles.sendCommentButton,
                !newComment.trim() && styles.sendCommentButtonDisabled,
              ]}
              onPress={onAddComment}
              disabled={!newComment.trim() || createCommentMutation.isLoading}
            >
              <Ionicons
                name="send"
                size={16}
                color={newComment.trim() ? "#1C30A4" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Update renderTeamTab to use real data
  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Team Members ({displayProject?.members.length})
        </Text>
        <TouchableOpacity onPress={handleAddMembers} style={styles.addTaskButton}>
          <Ionicons name="add" size={16} color="#1C30A4" />
          <Text style={styles.addTaskText}>Add</Text>
        </TouchableOpacity>
      </View>
      {displayProject.members.map((member) => (
        <TouchableOpacity
          key={member.id}
          style={styles.memberCard}
          onPress={() => handleMemberPress(member)}
        >
          <View style={styles.memberInfo}>
            <View style={styles.memberAvatarContainer}>
              {renderAvatar(member, 40)}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: '#10B981' }, // Default to online
                ]}
              />
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{member.full_name}</Text>
              <Text style={styles.memberRole}>{member.role || 'Team Member'}</Text>
            </View>
          </View>
          <View style={styles.memberStatus}>
            <Text
              style={[
                styles.statusText,
                { color: '#10B981' }, // Default to online
              ]}
            >
              online
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
      
      {displayProject.members.length === 0 && (
        <View style={styles.emptyState}>
          <Text>No team members yet</Text>
        </View>
      )}
    </View>
  );

  // Update renderFilesTab to use real data
  const renderFilesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Project Files ({displayProject?.images.length})
        </Text>
        <TouchableOpacity onPress={handleAddFiles} style={styles.addTaskButton}>
          <Ionicons name="add" size={16} color="#1C30A4" />
          <Text style={styles.addTaskText}>Add</Text>
        </TouchableOpacity>
      </View>
      {displayProject?.images.length > 0 ? (
        displayProject?.images.map((file) => (
          <TouchableOpacity
            key={file.id}
            style={styles.fileCard}
            onPress={() => handleFilePress(file)}
          >
            <View style={styles.fileInfo}>
              <View style={styles.fileIcon}>
                <Ionicons
                  name="image-outline"
                  size={24}
                  color="#1C30A4"
                />
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName}>{file.image_url}</Text>
                <Text style={styles.fileMetadata}>
                  Image
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text>No files uploaded yet</Text>
        </View>
      )}
    </View>
  );

  const navigation = useNavigation();
  const tabs = ["Overview", "Tasks", "Team", "Files"];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditProject = () => {
    Alert.alert("Edit Project", "Navigate to edit project screen");
  };

  const handleAddTask = () => {
    Alert.alert("Add Task", "Create new task");
  };

  const handleAddMembers = () => {
    Alert.alert("Add members", "Add new members");
  };

  const handleAddFiles = () => {
    Alert.alert("Add files", "Add new files");
  };

  const handleTaskPress = (task) => {
    setExpandedTask(expandedTask === task.id ? null : task.id);
  };
  
  const handleMemberPress = (member) => {
    Alert.alert("Team Member", `View profile: ${member.name}`);
  };

  const handleFilePress = (file) => {
    Alert.alert("File", `Open: ${file.name}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const renderAvatar = (member, size = 32) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.profile_picture ? (
        <Image
          source={{ uri: `${FILES_URL}${member.profile_picture}` }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Overview":
        return renderOverviewTab();
      case "Tasks":
        return renderTasksTab();
      case "Team":
        return renderTeamTab();
      case "Files":
        return renderFilesTab();
      default:
        return renderOverviewTab();
    }
  };

  // Loading state
  if (projectLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingState />
        </View>
      </SafeAreaView>
    );
  }

  if (projectError || !project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error loading project</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <TouchableOpacity onPress={handleEditProject} style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#1C30A4" />
        </TouchableOpacity>
      </View>

      {/* Project Header Card */}
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          <View style={styles.projectIconPattern}>
            <View style={[styles.patternLine, styles.patternLine1]} />
            <View style={[styles.patternLine, styles.patternLine2]} />
            <View style={[styles.patternLine, styles.patternLine3]} />
          </View>
          <View style={styles.projectIconBadge}>
            <Ionicons name="folder-outline" size={16} color="#1C30A4" />
          </View>
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{project.title}</Text>
          {project?.tags && project.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {project.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    { backgroundColor: tag.color + "20" }
                  ]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>
                    {tag.name}
                  </Text>
                </View>
              ))}
              {project.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{project.tags.length - 2}</Text>
              )}
            </View>
          )}
          <View style={styles.projectMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(project.priority) + "20" },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(project.priority) },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(project.priority) },
                ]}
              >
                {project.priority}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  editButton: {
    padding: 8,
  },
  projectHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    marginRight: 16,
  },
  projectIconPattern: {
    flex: 1,
    padding: 10,
  },
  patternLine: {
    height: 3,
    backgroundColor: "#1C30A4",
    marginVertical: 2,
    borderRadius: 1.5,
  },
  patternLine1: { width: "70%" },
  patternLine2: { width: "50%" },
  patternLine3: { width: "90%" },
  projectIconBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: "#1C30A4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -2,
    height: 2,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C30A4",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
  },
  progressBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1C30A4",
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  commentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentsContainer: {
    marginBottom: 4,
  },
  projectCommentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  commentActionText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  likedText: {
    color: "#EF4444",
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#F1F5F9",
  },
  replyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  replyInfo: {
    marginLeft: 8,
    flex: 1,
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  replyTime: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  replyText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginLeft: 32,
  },
  replyActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 32,
  },
  replyAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  replyActionText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginLeft: 4,
    fontWeight: "500",
  },
  replyInputContainer: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
  },
  replyInputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  replyInputBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  replyInput: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    maxHeight: 60,
    paddingVertical: 0,
  },
  sendReplyButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendReplyButtonDisabled: {
    opacity: 0.5,
  },
  addProjectCommentContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addProjectCommentHeader: {
    marginBottom: 12,
  },
  addCommentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  addProjectCommentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentInputAvatar: {
    marginRight: 12,
    marginTop: 2,
  },
  commentInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addProjectCommentInput: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    maxHeight: 80,
    paddingVertical: 0,
  },
  sendProjectCommentButton: {
    marginLeft: 8,
    padding: 6,
  },
  sendProjectCommentButtonDisabled: {
    opacity: 0.5,
  },
  noCommentsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  commentTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
  },
  addTaskText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 4,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
    marginRight: 12,
  },
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskLeftDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  taskDetailText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  commentsHeader: {
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  taskCommentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  taskCommentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  taskCommentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  taskCommentAuthor: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  taskCommentTime: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  taskCommentText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 14,
  },
  noCommentsText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 12,
    fontStyle: "italic",
  },
  addCommentContainer: {
    marginTop: 8,
  },
  addCommentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addCommentInput: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    maxHeight: 60,
    paddingVertical: 0,
  },
  sendCommentButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendCommentButtonDisabled: {
    opacity: 0.5,
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: "#6B7280",
  },
  memberStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  fileMetadata: {
    fontSize: 12,
    color: "#6B7280",
  },
  downloadButton: {
    padding: 8,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  assignedUsersContainer: {
    flex: 1,
    marginLeft: 4,
  },
  moreButtonText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  additionalUserText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default ProjectDetails;
