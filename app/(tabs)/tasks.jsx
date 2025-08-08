import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Convert tasks to state so we can modify them
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Complete UI Design Review",
      description: "Review and approve the new dashboard UI designs",
      category: "Design Project",
      priority: "High",
      status: "pending",
      assignedTo: { id: 1, avatar: null, name: "John Doe" },
      assignedBy: { id: 2, avatar: null, name: "Sarah Wilson" },
      dueDate: "2025-01-08",
      dueTime: "11:30 AM",
      project: "Dashboard Analytics UI",
      completedAt: null,
      createdAt: "2025-01-05",
      estimatedTime: "2h",
      tags: ["Design", "Review"],
      subtasks: [
        { id: 1, name: "Review color scheme", completed: true },
        { id: 2, name: "Check responsive layout", completed: true },
        { id: 3, name: "Validate accessibility", completed: false },
        { id: 4, name: "Approve final design", completed: false },
      ],
    },
    {
      id: 2,
      name: "Update Database Schema",
      description: "Modify user table to include new profile fields",
      category: "Backend Development",
      priority: "Medium",
      status: "completed",
      assignedTo: { id: 2, avatar: null, name: "Jane Smith" },
      assignedBy: { id: 1, avatar: null, name: "John Doe" },
      dueDate: "2025-01-07",
      dueTime: "Completed",
      project: "E-commerce Mobile App",
      completedAt: "2025-01-06",
      createdAt: "2025-01-03",
      estimatedTime: "4h",
      tags: ["Database", "Backend"],
      subtasks: [
        { id: 1, name: "Design new schema", completed: true },
        { id: 2, name: "Run migration scripts", completed: true },
        { id: 3, name: "Test data integrity", completed: true },
        { id: 4, name: "Update API endpoints", completed: true },
      ],
    },
    {
      id: 3,
      name: "Client Presentation Prep",
      description: "Prepare slides and demo for client meeting",
      category: "Business Development",
      priority: "High",
      status: "in-progress",
      assignedTo: { id: 3, avatar: null, name: "Mike Johnson" },
      assignedBy: { id: 4, avatar: null, name: "Emma Davis" },
      dueDate: "2025-01-09",
      dueTime: "3:00 PM",
      project: "Website Redesign",
      completedAt: null,
      createdAt: "2025-01-04",
      estimatedTime: "3h",
      tags: ["Presentation", "Client"],
      subtasks: [
        { id: 1, name: "Create slide deck", completed: true },
        { id: 2, name: "Prepare demo environment", completed: true },
        { id: 3, name: "Practice presentation", completed: false },
        { id: 4, name: "Review with team", completed: false },
      ],
    },
    {
      id: 4,
      name: "Bug Fix - Login Issue",
      description: "Fix authentication bug affecting mobile users",
      category: "Bug Fix",
      priority: "High",
      status: "pending",
      assignedTo: { id: 4, avatar: null, name: "Emma Davis" },
      assignedBy: { id: 2, avatar: null, name: "Jane Smith" },
      dueDate: "2025-01-08",
      dueTime: "5:00 PM",
      project: "E-commerce Mobile App",
      completedAt: null,
      createdAt: "2025-01-07",
      estimatedTime: "1.5h",
      tags: ["Bug", "Authentication", "Mobile"],
      subtasks: [
        { id: 1, name: "Reproduce issue", completed: true },
        { id: 2, name: "Identify root cause", completed: false },
        { id: 3, name: "Implement fix", completed: false },
        { id: 4, name: "Test on mobile devices", completed: false },
      ],
    },
    {
      id: 5,
      name: "API Documentation Update",
      description: "Update API docs with new endpoints and examples",
      category: "Documentation",
      priority: "Medium",
      status: "pending",
      assignedTo: { id: 5, avatar: null, name: "Alex Chen" },
      assignedBy: { id: 3, avatar: null, name: "Mike Johnson" },
      dueDate: "2025-01-12",
      dueTime: "2:00 PM",
      project: "API Integration",
      completedAt: null,
      createdAt: "2025-01-06",
      estimatedTime: "2.5h",
      tags: ["Documentation", "API"],
      subtasks: [
        { id: 1, name: "List new endpoints", completed: true },
        { id: 2, name: "Write usage examples", completed: false },
        { id: 3, name: "Update authentication docs", completed: false },
        { id: 4, name: "Review with dev team", completed: false },
      ],
    },
    {
      id: 6,
      name: "Performance Optimization",
      description: "Optimize app performance and reduce load times",
      category: "Performance",
      priority: "Medium",
      status: "in-progress",
      assignedTo: { id: 6, avatar: null, name: "Tom Brown" },
      assignedBy: { id: 1, avatar: null, name: "John Doe" },
      dueDate: "2025-01-15",
      dueTime: "4:00 PM",
      project: "Website Redesign",
      completedAt: null,
      createdAt: "2025-01-05",
      estimatedTime: "6h",
      tags: ["Performance", "Optimization"],
      subtasks: [
        { id: 1, name: "Analyze current performance", completed: true },
        { id: 2, name: "Identify bottlenecks", completed: true },
        { id: 3, name: "Implement optimizations", completed: false },
        { id: 4, name: "Conduct performance tests", completed: false },
      ],
    },
    {
      id: 7,
      name: "Security Audit",
      description: "Conduct security review of user authentication system",
      category: "Security",
      priority: "High",
      status: "overdue",
      assignedTo: { id: 7, avatar: null, name: "Lisa Garcia" },
      assignedBy: { id: 2, avatar: null, name: "Jane Smith" },
      dueDate: "2025-01-06",
      dueTime: "Overdue",
      project: "E-commerce Mobile App",
      completedAt: null,
      createdAt: "2025-01-02",
      estimatedTime: "4h",
      tags: ["Security", "Authentication"],
      subtasks: [
        { id: 1, name: "Review authentication flow", completed: true },
        { id: 2, name: "Check for vulnerabilities", completed: false },
        { id: 3, name: "Document findings", completed: false },
        { id: 4, name: "Recommend fixes", completed: false },
      ],
    },
    {
      id: 8,
      name: "User Testing Setup",
      description: "Set up user testing environment for new features",
      category: "Testing",
      priority: "Low",
      status: "pending",
      assignedTo: { id: 8, avatar: null, name: "Ryan Lee" },
      assignedBy: { id: 4, avatar: null, name: "Emma Davis" },
      dueDate: "2025-01-18",
      dueTime: "1:00 PM",
      project: "Mobile Game Development",
      completedAt: null,
      createdAt: "2025-01-07",
      estimatedTime: "3h",
      tags: ["Testing", "UX"],
      subtasks: [
        { id: 1, name: "Define test scenarios", completed: false },
        { id: 2, name: "Recruit test users", completed: false },
        { id: 3, name: "Setup testing tools", completed: false },
        { id: 4, name: "Schedule sessions", completed: false },
      ],
    },
  ]);

  const navigation = useNavigation();

  // Function to toggle task completion status
  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newStatus =
            task.status === "completed" ? "pending" : "completed";
          const currentDate = new Date().toISOString().split("T")[0];

          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === "completed" ? currentDate : null,
          };
        }
        return task;
      })
    );
  };

  const filters = ["All", "pending", "in-progress", "completed", "overdue"];

  // Filter tasks based on search and selected filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "All" || task.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleTaskPress = (task) => {
    router.push(`/TaskDetails?taskId=${task.id}`);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
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
      case "overdue":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "checkmark-circle";
      case "in-progress":
        return "time";
      case "pending":
        return "hourglass";
      case "overdue":
        return "warning";
      default:
        return "help-circle";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "design project":
        return "color-palette";
      case "backend development":
        return "server";
      case "business development":
        return "business";
      case "bug fix":
        return "bug";
      case "documentation":
        return "document-text";
      case "performance":
        return "speedometer";
      case "security":
        return "shield";
      case "testing":
        return "flask";
      default:
        return "list";
    }
  };

  const getCompletedSubtasks = (subtasks) => {
    return subtasks.filter((subtask) => subtask.completed).length;
  };

  const getSubtaskProgress = (subtasks) => {
    const completed = getCompletedSubtasks(subtasks);
    return Math.round((completed / subtasks.length) * 100);
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

  const renderTaskCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        item.status === "overdue" && styles.overdueTaskCard,
        item.status === "completed" && styles.completedTaskCard,
      ]}
      onPress={() => handleTaskPress(item)}
    >
      {/* Overdue Badge */}
      {item.status === "overdue" && (
        <View style={styles.overdueBadge}>
          <Ionicons name="warning" size={12} color="#fff" />
          <Text style={styles.overdueBadgeText}>OVERDUE</Text>
        </View>
      )}

      {/* Completed Check Badge */}
      {/* {item.status === "completed" && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.completedBadgeText}>DONE</Text>
        </View>
      )} */}

      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <View style={styles.taskIcon}>
            <View
              style={[
                styles.taskIconBackground,
                { backgroundColor: getPriorityColor(item.priority) + "20" },
                item.status === "completed" &&
                  styles.completedTaskIconBackground,
              ]}
            >
              {item.status === "completed" ? (
                <Ionicons name="checkmark" size={20} color="#10B981" />
              ) : (
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={20}
                  color={getPriorityColor(item.priority)}
                />
              )}
            </View>
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text
              style={[
                styles.taskTitle,
                item.status === "overdue" && styles.overdueTaskTitle,
                item.status === "completed" && styles.completedTaskTitle,
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text style={styles.taskCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.taskHeaderRight}>
          {/* Checkbox/Radio Button moved to the right */}
          {/* <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleTaskCompletion(item.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                item.status === "completed" && styles.checkboxCompleted,
              ]}
            >
              {item.status === "completed" && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity> */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(item.status) + "20",
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={14}
              color={getStatusColor(item.status)}
            />
          </View>
          <TouchableOpacity style={styles.taskMenuButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[
          styles.taskDescription,
          item.status === "completed" && styles.completedTaskDescription,
        ]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.taskInfo}>
        <View style={styles.taskInfoItem}>
          <Ionicons name="folder-outline" size={14} color="#6B7280" />
          <Text style={styles.taskInfoText}>{item.project}</Text>
        </View>
        <View style={styles.taskInfoItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.taskInfoText}>{item.estimatedTime}</Text>
        </View>
        <View style={styles.taskInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={item.status === "overdue" ? "#EF4444" : "#6B7280"}
          />
          <Text
            style={[
              styles.taskInfoText,
              item.status === "overdue" && styles.overdueText,
            ]}
          >
            {item.status === "completed" && item.completedAt
              ? item.completedAt
              : item.dueDate}
          </Text>
        </View>
      </View>

      {/* Task Tags */}
      <View style={styles.taskTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.taskTag}>
            <Text style={styles.taskTagText}>{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <View style={styles.taskTag}>
            <Text style={styles.taskTagText}>+{item.tags.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Subtasks Progress */}
      {/* <View style={styles.subtasksProgress}>
        <View style={styles.subtasksInfo}>
          <Text style={styles.subtasksText}>
            {getCompletedSubtasks(item.subtasks)}/{item.subtasks.length}{" "}
            subtasks
          </Text>
          <Text style={styles.subtasksPercent}>
            {getSubtaskProgress(item.subtasks)}%
          </Text>
        </View>
        <View style={styles.subtasksProgressBar}>
          <View style={styles.subtasksProgressBackground}>
            <View
              style={[
                styles.subtasksProgressFill,
                {
                  width: `${getSubtaskProgress(item.subtasks)}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
        </View>
      </View> */}

      <View style={styles.taskFooter}>
        <View style={styles.taskFooterLeft}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: getPriorityColor(item.priority) + "20",
              },
              item.status === "completed" && styles.completedPriorityBadge,
            ]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(item.priority) },
                item.status === "completed" && styles.completedPriorityDot,
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item.priority) },
                item.status === "completed" && styles.completedPriorityText,
              ]}
            >
              {item.priority}
            </Text>
          </View>
          <Text
            style={[
              styles.taskTime,
              item.status === "overdue" && styles.overdueTaskTime,
              item.status === "completed" && styles.completedTaskTime,
            ]}
          >
            {item.status === "completed" ? "Completed" : item.dueTime}
          </Text>
        </View>

        <View style={styles.taskFooterRight}>
          <Text style={styles.assignedByText}>by</Text>
          <View style={styles.assignedBy}>
            {renderAvatar(item.assignedBy, 20)}
          </View>
          <Ionicons name="arrow-forward" size={12} color="#9CA3AF" />
          <View style={styles.assignedTo}>
            {renderAvatar(item.assignedTo, 24)}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{tasks.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage your daily tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateTask/index")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, projects, or assignees..."
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

      {/* Task Overview Stats as Filters */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Filter Tasks</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsScrollView}
        >
          {/* All Tasks Filter */}
          <TouchableOpacity
            style={[
              styles.progressStatCard,
              selectedFilter === "All" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("All")}
          >
            <View style={styles.progressCardHeader}>
              <View style={styles.progressIcon}>
                <Ionicons name="list" size={12} color="#1C30A4" />
              </View>
              <Text style={styles.progressCardTitle}>All Tasks</Text>
            </View>
            <Text style={styles.progressCardNumber}>
              {Math.round(
                tasks.reduce((acc, task) => {
                  return acc + getSubtaskProgress(task.subtasks);
                }, 0) / tasks.length
              )}
              %
            </Text>
            <View style={styles.progressCardBar}>
              <View style={styles.progressCardBackground}>
                <View
                  style={[
                    styles.progressCardFill,
                    {
                      width: `${Math.round(
                        tasks.reduce((acc, task) => {
                          return acc + getSubtaskProgress(task.subtasks);
                        }, 0) / tasks.length
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressCardSubtext}>Avg Progress</Text>
          </TouchableOpacity>

          {/* Completed Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
              selectedFilter === "completed" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("completed")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#10B981" }]}
              >
                <Ionicons name="checkmark-circle" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#10B981" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#10B981" }]}>
              {tasks.filter((t) => t.status === "completed").length}
            </Text>
            <Text style={styles.statCardLabel}>Done</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#10B981" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (tasks.filter((t) => t.status === "completed").length /
                          tasks.length) *
                        100
                      }%`,
                      backgroundColor: "#10B981",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* In Progress Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
              selectedFilter === "in-progress" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("in-progress")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#3B82F6" }]}
              >
                <Ionicons name="time" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-up" size={8} color="#3B82F6" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#3B82F6" }]}>
              {tasks.filter((t) => t.status === "in-progress").length}
            </Text>
            <Text style={styles.statCardLabel}>Active</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#3B82F6" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (tasks.filter((t) => t.status === "in-progress")
                          .length /
                          tasks.length) *
                        100
                      }%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Pending Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FFFBEB", borderColor: "#F59E0B" },
              selectedFilter === "pending" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("pending")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#F59E0B" }]}
              >
                <Ionicons name="hourglass" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="remove" size={8} color="#F59E0B" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#F59E0B" }]}>
              {tasks.filter((t) => t.status === "pending").length}
            </Text>
            <Text style={styles.statCardLabel}>Pending</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#F59E0B" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (tasks.filter((t) => t.status === "pending").length /
                          tasks.length) *
                        100
                      }%`,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Overdue Filter */}
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
              selectedFilter === "overdue" && styles.activeFilterCard,
            ]}
            onPress={() => handleFilterPress("overdue")}
          >
            <View style={styles.statCardHeader}>
              <View
                style={[styles.statCardIcon, { backgroundColor: "#EF4444" }]}
              >
                <Ionicons name="warning" size={10} color="#fff" />
              </View>
              <View style={styles.statCardTrend}>
                <Ionicons name="arrow-down" size={8} color="#EF4444" />
              </View>
            </View>
            <Text style={[styles.statCardNumber, { color: "#EF4444" }]}>
              {tasks.filter((t) => t.status === "overdue").length}
            </Text>
            <Text style={styles.statCardLabel}>Overdue</Text>
            <View style={styles.statCardProgress}>
              <View
                style={[
                  styles.statCardProgressBg,
                  { backgroundColor: "#EF4444" + "30" },
                ]}
              >
                <View
                  style={[
                    styles.statCardProgressFill,
                    {
                      width: `${
                        (tasks.filter((t) => t.status === "overdue").length /
                          tasks.length) *
                        100
                      }%`,
                      backgroundColor: "#EF4444",
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.tasksList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 8,
  },
  headerBadge: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#1C30A4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  searchContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  statsSection: {
    marginBottom: 16,
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  statsScrollView: {
    marginBottom: 0,
  },
  statsScrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  progressStatCard: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    width: 110,
    shadowColor: "#1C30A4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeFilterCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressIcon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  progressCardTitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  progressCardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  progressCardBar: {
    marginBottom: 4,
  },
  progressCardBackground: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
  progressCardFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 1.5,
  },
  progressCardSubtext: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    width: 80,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statCardIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardTrend: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  statCardProgress: {
    marginTop: "auto",
  },
  statCardProgressBg: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  statCardProgressFill: {
    height: "100%",
    borderRadius: 1,
  },
  tasksList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueTaskCard: {
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  overdueBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  overdueBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  overdueTaskTitle: {
    color: "#DC2626",
  },
  overdueTaskTime: {
    color: "#EF4444",
    fontWeight: "700",
  },
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  // Checkbox styles
  checkboxContainer: {
    marginRight: 8,
    marginLeft: 4,
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  // Completed Badge
  completedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completedBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  taskHeaderInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  taskCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  taskMenuButton: {
    padding: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  taskInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  overdueText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  taskTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 88, // Adjusted for checkbox space
  },
  taskTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  taskTagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  subtasksProgress: {
    marginBottom: 16,
    marginLeft: 88, // Adjusted for checkbox space
  },
  subtasksInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subtasksText: {
    fontSize: 12,
    color: "#6B7280",
  },
  subtasksPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C30A4",
  },
  subtasksProgressBar: {},
  subtasksProgressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
  },
  subtasksProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  taskFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedByText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginRight: 6,
  },
  assignedBy: {
    marginRight: 8,
    opacity: 0.8,
  },
  assignedTo: {
    marginLeft: 8,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  // Completed task styling
  completedTaskIconBackground: {
    backgroundColor: "#10B981" + "20",
  },
  completedTaskTitle: {
    color: "#6B7280",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "#9CA3AF",
  },
  completedTaskDescription: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "#D1D5DB",
  },
  completedTaskTime: {
    color: "#10B981",
    fontWeight: "600",
  },
  completedPriorityBadge: {
    backgroundColor: "#10B981" + "20",
  },
  completedPriorityDot: {
    backgroundColor: "#10B981",
  },
  completedPriorityText: {
    color: "#10B981",
  },
});

export default Tasks;
