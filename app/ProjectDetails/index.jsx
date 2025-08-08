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
import { useNavigation } from "expo-router";

const ProjectDetails = () => {
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [expandedTask, setExpandedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newProjectComment, setNewProjectComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Sample project data
  const project = {
    id: 1,
    name: "E-commerce Mobile App",
    category: "Mobile Development",
    progress: 75,
    status: "In Progress",
    priority: "High",
    dueDate: "2025-01-15",
    client: "TechCorp Inc.",
    description:
      "Complete mobile shopping platform with payment integration and user management system. This project includes modern UI/UX design, secure payment processing, inventory management, and real-time notifications.",
    budget: "$45,000",
    spent: "$33,750",
    teamMembers: [
      {
        id: 1,
        avatar: null,
        name: "John Doe",
        role: "Lead Developer",
        status: "online",
      },
      {
        id: 2,
        avatar: null,
        name: "Jane Smith",
        role: "UI/UX Designer",
        status: "away",
      },
      {
        id: 3,
        avatar: null,
        name: "Mike Johnson",
        role: "Backend Developer",
        status: "online",
      },
      {
        id: 4,
        avatar: null,
        name: "Sarah Wilson",
        role: "QA Tester",
        status: "offline",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Design user authentication flow",
        status: "completed",
        assignee: "Jane Smith",
        dueDate: "2024-12-20",
        priority: "High",
      },
      {
        id: 2,
        title: "Implement payment gateway",
        status: "in-progress",
        assignee: "John Doe",
        dueDate: "2025-01-05",
        priority: "High",
      },
      {
        id: 3,
        title: "Create product catalog API",
        status: "in-progress",
        assignee: "Mike Johnson",
        dueDate: "2025-01-08",
        priority: "Medium",
      },
      {
        id: 4,
        title: "Set up testing environment",
        status: "pending",
        assignee: "Sarah Wilson",
        dueDate: "2025-01-10",
        priority: "Low",
      },
      {
        id: 5,
        title: "Mobile app optimization",
        status: "pending",
        assignee: "John Doe",
        dueDate: "2025-01-12",
        priority: "Medium",
      },
    ],
    files: [
      {
        id: 1,
        name: "UI_Mockups.fig",
        type: "figma",
        size: "2.4 MB",
        uploadedBy: "Jane Smith",
        date: "2024-12-18",
      },
      {
        id: 2,
        name: "API_Documentation.pdf",
        type: "pdf",
        size: "1.2 MB",
        uploadedBy: "Mike Johnson",
        date: "2024-12-19",
      },
      {
        id: 3,
        name: "Project_Requirements.docx",
        type: "document",
        size: "856 KB",
        uploadedBy: "John Doe",
        date: "2024-12-15",
      },
    ],
    comments: [
      {
        id: 1,
        author: "John Doe",
        content:
          "Great progress on the authentication module! The flow looks smooth.",
        time: "2 hours ago",
        avatar: null,
      },
      {
        id: 2,
        author: "Jane Smith",
        content:
          "Updated the design mockups based on client feedback. Please review.",
        time: "5 hours ago",
        avatar: null,
      },
      {
        id: 3,
        author: "Mike Johnson",
        content: "API endpoints are ready for testing. Documentation uploaded.",
        time: "1 day ago",
        avatar: null,
      },
    ],
  };

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

  const handleTaskPress = (task) => {
    setExpandedTask(expandedTask === task.id ? null : task.id);
  };

  const handleAddComment = (taskId) => {
    if (newComment.trim()) {
      // Here you would typically add the comment to your state/database
      Alert.alert("Comment Added", `Comment added to task: ${newComment}`);
      setNewComment("");
    }
  };

  const handleAddProjectComment = () => {
    if (newProjectComment.trim()) {
      Alert.alert("Comment Added", `Project comment: ${newProjectComment}`);
      setNewProjectComment("");
    }
  };

  const handleLikeComment = (commentId) => {
    Alert.alert("Like", `Liked comment ${commentId}`);
  };

  const handleReplyToComment = (commentId, commentAuthor) => {
    setReplyingTo({ id: commentId, author: commentAuthor });
    setReplyText("");
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      Alert.alert("Reply Sent", `Reply: ${replyText}`);
      setReplyingTo(null);
      setReplyText("");
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const handleMemberPress = (member) => {
    Alert.alert("Team Member", `View profile: ${member.name}`);
  };

  const handleFilePress = (file) => {
    Alert.alert("File", `Open: ${file.name}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10B981";
      case "in-progress":
        return "#3B82F6";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "figma":
        return "color-palette-outline";
      case "pdf":
        return "document-text-outline";
      case "document":
        return "document-outline";
      default:
        return "document-outline";
    }
  };

  const getMemberStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#10B981";
      case "away":
        return "#F59E0B";
      case "offline":
        return "#6B7280";
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
      {member.avatar ? (
        <Image
          source={{ uri: member.avatar }}
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

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Project Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{project.progress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${project.progress}%` }]}
              />
            </View>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {project.tasks.filter((t) => t.status === "completed").length}/
            {project.tasks.length}
          </Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{project.teamMembers.length}</Text>
          <Text style={styles.statLabel}>Team</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{project.description}</Text>
      </View>

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{project.dueDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Client</Text>
            <Text style={styles.detailValue}>{project.client}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue}>{project.budget}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Spent</Text>
            <Text style={styles.detailValue}>{project.spent}</Text>
          </View>
        </View>
      </View>

      {/* Recent Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Comments</Text>

        {/* Comments List */}
        <View style={styles.commentsContainer}>
          {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment) => (
              <View key={comment.id} style={styles.projectCommentCard}>
                {/* Main Comment */}
                <View style={styles.commentHeader}>
                  {renderAvatar(
                    { avatar: comment.avatar, name: comment.author },
                    32
                  )}
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>

                {/* Comment Actions */}
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() => handleLikeComment(comment.id)}
                  >
                    <Ionicons
                      name={comment.isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={comment.isLiked ? "#EF4444" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.commentActionText,
                        comment.isLiked && styles.likedText,
                      ]}
                    >
                      {comment.likes > 0 ? comment.likes : "Like"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() =>
                      handleReplyToComment(comment.id, comment.author)
                    }
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.commentActionText}>Reply</Text>
                  </TouchableOpacity>
                </View>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {comment.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyCard}>
                        <View style={styles.replyHeader}>
                          {renderAvatar(
                            { avatar: reply.avatar, name: reply.author },
                            24
                          )}
                          <View style={styles.replyInfo}>
                            <Text style={styles.replyAuthor}>
                              {reply.author}
                            </Text>
                            <Text style={styles.replyTime}>{reply.time}</Text>
                          </View>
                        </View>
                        <Text style={styles.replyText}>{reply.content}</Text>

                        {/* Reply Actions */}
                        <View style={styles.replyActions}>
                          <TouchableOpacity
                            style={styles.replyAction}
                            onPress={() => handleLikeComment(reply.id)}
                          >
                            <Ionicons
                              name={reply.isLiked ? "heart" : "heart-outline"}
                              size={12}
                              color={reply.isLiked ? "#EF4444" : "#9CA3AF"}
                            />
                            <Text
                              style={[
                                styles.replyActionText,
                                reply.isLiked && styles.likedText,
                              ]}
                            >
                              {reply.likes > 0 ? reply.likes : "Like"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.replyAction}
                            onPress={() =>
                              handleReplyToComment(comment.id, reply.author)
                            }
                          >
                            <Ionicons
                              name="chatbubble-outline"
                              size={12}
                              color="#9CA3AF"
                            />
                            <Text style={styles.replyActionText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Reply Input (when replying to this comment) */}
                {replyingTo && replyingTo.id === comment.id && (
                  <View style={styles.replyInputContainer}>
                    <View style={styles.replyInputHeader}>
                      <Text style={styles.replyingToText}>
                        Replying to {replyingTo.author}
                      </Text>
                      <TouchableOpacity onPress={handleCancelReply}>
                        <Ionicons name="close" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.replyInputBox}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Write a reply..."
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        style={[
                          styles.sendReplyButton,
                          !replyText.trim() && styles.sendReplyButtonDisabled,
                        ]}
                        onPress={handleSendReply}
                        disabled={!replyText.trim()}
                      >
                        <Ionicons
                          name="send"
                          size={16}
                          color={replyText.trim() ? "#1C30A4" : "#9CA3AF"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          )}
        </View>

        {/* Add New Comment */}
        <View style={styles.addProjectCommentContainer}>
          {/* <View style={styles.addProjectCommentHeader}>
            <Text style={styles.addCommentTitle}>Add Comment</Text>
          </View> */}
          <View style={styles.addProjectCommentInputContainer}>
            <View style={styles.commentInputAvatar}>
              {renderAvatar({ avatar: null, name: "You" }, 28)}
            </View>
            <View style={styles.commentInputBox}>
              <TextInput
                style={styles.addProjectCommentInput}
                placeholder="Share your thoughts about this project..."
                value={newProjectComment}
                onChangeText={setNewProjectComment}
                multiline
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={[
                  styles.sendProjectCommentButton,
                  !newProjectComment.trim() &&
                    styles.sendProjectCommentButtonDisabled,
                ]}
                onPress={handleAddProjectComment}
                disabled={!newProjectComment.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={newProjectComment.trim() ? "#1C30A4" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks ({project.tasks.length})</Text>
        <TouchableOpacity onPress={handleAddTask} style={styles.addTaskButton}>
          <Ionicons name="add" size={16} color="#1C30A4" />
          <Text style={styles.addTaskText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {project.tasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
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
            <View style={styles.taskDetails}>
              <View style={styles.taskLeftDetails}>
                <View style={styles.taskDetail}>
                  <Ionicons name="person-outline" size={12} color="#6B7280" />
                  <Text style={styles.taskDetailText}>{task.assignee}</Text>
                </View>
                <View style={styles.taskDetail}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.taskDetailText}>{task.dueDate}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.taskStatus,
                  { backgroundColor: getStatusColor(task.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.taskStatusText,
                    { color: getStatusColor(task.status) },
                  ]}
                >
                  {task.status.replace("-", " ")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Expanded Comments Section */}
          {expandedTask === task.id && (
            <View style={styles.commentsSection}>
              <View style={styles.commentsDivider} />

              {/* Comments Header */}
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  Comments ({task.comments.length})
                </Text>
              </View>

              {/* Comments List */}
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <View key={comment.id} style={styles.taskCommentCard}>
                    <View style={styles.taskCommentHeader}>
                      {renderAvatar(
                        { avatar: comment.avatar, name: comment.author },
                        20
                      )}
                      <View style={styles.taskCommentInfo}>
                        <Text style={styles.taskCommentAuthor}>
                          {comment.author}
                        </Text>
                        <Text style={styles.taskCommentTime}>
                          {comment.time}
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
                    onPress={() => handleAddComment(task.id)}
                    disabled={!newComment.trim()}
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
          )}
        </View>
      ))}
    </View>
  );

  const renderTeamTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        Team Members ({project.teamMembers.length})
      </Text>
      {project.teamMembers.map((member) => (
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
                  { backgroundColor: getMemberStatusColor(member.status) },
                ]}
              />
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
          <View style={styles.memberStatus}>
            <Text
              style={[
                styles.statusText,
                { color: getMemberStatusColor(member.status) },
              ]}
            >
              {member.status}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        Project Files ({project.files.length})
      </Text>
      {project.files.map((file) => (
        <TouchableOpacity
          key={file.id}
          style={styles.fileCard}
          onPress={() => handleFilePress(file)}
        >
          <View style={styles.fileInfo}>
            <View style={styles.fileIcon}>
              <Ionicons
                name={getFileIcon(file.type)}
                size={24}
                color="#1C30A4"
              />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMetadata}>
                {file.size} • {file.uploadedBy} • {file.date}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
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
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectCategory}>{project.category}</Text>
          <View style={styles.projectMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(project.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(project.status) },
                ]}
              >
                {project.status}
              </Text>
            </View>
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
});

export default ProjectDetails;
