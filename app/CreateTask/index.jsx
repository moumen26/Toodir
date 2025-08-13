import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCreateTask } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import { useAuthStatus } from "../hooks/useAuth";

const CreateTask = () => {
  const { user } = useAuthStatus();
  const createTaskMutation = useCreateTask();
  const { projects } = useProjects();
  
  const availableProjects = projects || [];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attachments: [],
    color: "",
    icon: "",
    project_id: "",
    assignedTo: [],
    priority: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    repeat: {
      enabled: false,
      type: "",
      interval: 1,
      days: [],
      endType: "never",
      endAfter: 10,
      endDate: "",
    },
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("");
  const [activeSelector, setActiveSelector] = useState("day");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // Optional sections visibility
  const [showVisualSection, setShowVisualSection] = useState(false);
  const [showScheduleSection, setShowScheduleSection] = useState(false);
  const [showTimeSection, setShowTimeSection] = useState(false);
  const [showRepeatSection, setShowRepeatSection] = useState(false);

  // Selection modals states
  const [showColorModal, setShowColorModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Sample options data
  const taskColors = [
    { id: 1, color: "#EF4444", name: "Red" },
    { id: 2, color: "#F59E0B", name: "Orange" },
    { id: 3, color: "#10B981", name: "Green" },
    { id: 4, color: "#3B82F6", name: "Blue" },
    { id: 5, color: "#8B5CF6", name: "Purple" },
    { id: 6, color: "#EC4899", name: "Pink" },
    { id: 7, color: "#6B7280", name: "Gray" },
    { id: 8, color: "#14B8A6", name: "Teal" },
  ];

  const taskIcons = [
    { id: 1, name: "checkmark-circle", label: "Complete" },
    { id: 2, name: "time", label: "Time" },
    { id: 3, name: "star", label: "Star" },
    { id: 4, name: "flag", label: "Flag" },
    { id: 5, name: "bookmark", label: "Bookmark" },
    { id: 6, name: "heart", label: "Heart" },
    { id: 7, name: "trophy", label: "Trophy" },
    { id: 8, name: "lightning-bolt", label: "Bolt" },
    { id: 9, name: "shield", label: "Shield" },
    { id: 10, name: "rocket", label: "Rocket" },
    { id: 11, name: "bulb", label: "Idea" },
    { id: 12, name: "code-slash", label: "Code" },
  ];

  const priorities = [
    { id: 1, name: "High", color: "#EF4444", icon: "flag" },
    { id: 2, name: "Medium", color: "#F59E0B", icon: "flag" },
    { id: 3, name: "Low", color: "#10B981", icon: "flag" },
  ];

  const repeatTypes = [
    { id: 1, type: "daily", label: "Daily", icon: "today" },
    { id: 2, type: "weekly", label: "Weekly", icon: "calendar" },
    { id: 3, type: "monthly", label: "Monthly", icon: "calendar-outline" },
    { id: 4, type: "yearly", label: "Yearly", icon: "calendar-clear" },
  ];

  const weekDays = [
    { id: 0, short: "Mon", full: "Monday" },
    { id: 1, short: "Tue", full: "Tuesday" },
    { id: 2, short: "Wed", full: "Wednesday" },
    { id: 3, short: "Thu", full: "Thursday" },
    { id: 4, short: "Fri", full: "Friday" },
    { id: 5, short: "Sat", full: "Saturday" },
    { id: 6, short: "Sun", full: "Sunday" },
  ];

  // Date and time data
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString(),
  }));

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 50 }, (_, i) => ({
    value: (new Date().getFullYear() + i).toString(),
    label: (new Date().getFullYear() + i).toString(),
  }));

  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString(),
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const timePresets = [
    { label: "9 am", value: "09:00 AM" },
    { label: "12 pm", value: "12:00 PM" },
    { label: "4 pm", value: "16:00 PM" },
    { label: "6 pm", value: "18:00 PM" },
  ];

  const periods = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRepeatChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      repeat: {
        ...prev.repeat,
        [field]: value,
      },
    }));
  };

  const handleCreateTask = async () => {        
    if (!formData?.title.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }

    try {
      // Prepare task data for API
      const taskData = {
        title: formData?.title.trim() || null,
        description: formData?.description?.trim() || null,
        color: formData?.color || null,
        project_id: formData?.project_id || null,
        priority: formData?.priority?.toLowerCase() || null,
        start_date: formData?.startDate || null,
        end_date: formData?.endDate || null,
        repetition_type: formData?.repeat.type || null,
        repetition_interval: formData?.repeat.interval || 1,
        repetition_day_of_week: formData?.repeat.enabled && formData?.repeat.type === 'weekly' 
          ? formData?.repeat.days.length > 0 
            ? formData?.repeat.days.map(dayShort => 
                weekDays.findIndex(day => day.short === dayShort)
              ).filter(index => index !== -1) // Remove any invalid days
            : null
          : null,
        assigned_users: selectedMembers.map(member => member.id),
      };

      await createTaskMutation.mutateAsync({
        taskData,
      });

      Alert.alert(
        "Success", 
        "Task created successfully!",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.log('Error creating task:', error);
      Alert.alert(
        "Error", 
        error.message || "Failed to create task. Please try again."
      );
    }
  };

  // Date picker handlers
  const handleDatePress = (type) => {
    setDatePickerType(type);
    setActiveSelector("day");
    setSelectedDay(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    setShowDatePicker(true);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setSelectedDay(null);
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  const handleDateSelect = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateString = `${selectedDay}-${selectedMonth}-${selectedYear}`;
      handleInputChange(datePickerType, dateString);
      setShowDatePicker(false);
    }
  };

  const handleDateItemPress = (item) => {
    if (activeSelector === "day") {
      setSelectedDay(item.value);
      setActiveSelector("month");
    } else if (activeSelector === "month") {
      setSelectedMonth(item.value);
      setActiveSelector("year");
    } else if (activeSelector === "year") {
      setSelectedYear(item.value);
    }
  };

  // Time picker handlers
  const handleTimePress = (type) => {
    setTimePickerType(type);
    setSelectedHour("09");
    setSelectedMinute("00");
    setSelectedPeriod("AM");
    setShowTimePicker(true);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setSelectedHour(null);
    setSelectedMinute(null);
    setSelectedPeriod("AM");
  };

  const handleTimeSelect = () => {
    if (selectedHour && selectedMinute !== null) {
      const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      handleInputChange(timePickerType, timeString);
      setShowTimePicker(false);
    }
  };

  const handleTimePreset = (preset) => {
    handleInputChange(timePickerType, preset.value);
    setShowTimePicker(false);
  };

  const handleHourScroll = (hour) => {
    setSelectedHour(hour.value);
  };

  const handleMinuteScroll = (minute) => {
    setSelectedMinute(minute.value);
  };

  const handlePeriodScroll = (period) => {
    setSelectedPeriod(period.value);
  };

  // Selection handlers
  const handleColorSelect = (color) => {
    handleInputChange("color", color.color);
    setShowColorModal(false);
  };

  const handleIconSelect = (icon) => {
    handleInputChange("icon", icon.name);
    setShowIconModal(false);
  };

  const handleProjectSelect = (project) => {
    setFormData(prev => ({
      ...prev,
      project_id: project.id  // Store ID instead of name
    }));
    setShowProjectModal(false);
  };

  const getSelectedProjectName = () => {
    if (!formData.project_id) return "Select Project";
    const project = availableProjects.find(p => p.id === formData.project_id);
    return project ? project.title : "Select Project";
  };

  const handleMemberToggle = (member) => {
    const isSelected = selectedMembers.find((m) => m.id === member.id);
    let newSelectedMembers;

    if (isSelected) {
      newSelectedMembers = selectedMembers.filter((m) => m.id !== member.id);
    } else {
      newSelectedMembers = [...selectedMembers, member];
    }

    setSelectedMembers(newSelectedMembers);
    handleInputChange("members", newSelectedMembers);
  };

  const handlePrioritySelect = (priority) => {
    handleInputChange("priority", priority.name);
    setShowPriorityModal(false);
  };

  // Repeat handlers
  const handleRepeatToggle = (enabled) => {
    handleRepeatChange("enabled", enabled);
    if (!enabled) {
      setShowRepeatSection(false);
    }
  };

  const handleRepeatTypeSelect = (type) => {
    handleRepeatChange("type", type.type);
    handleRepeatChange("days", []); // Reset days when type changes
  };

  const handleWeekDayToggle = (day) => {
    const currentDays = formData.repeat.days;
    const isSelected = currentDays.includes(day.short);

    if (isSelected) {
      handleRepeatChange(
        "days",
        currentDays.filter((d) => d !== day.short)
      );
    } else {
      handleRepeatChange("days", [...currentDays, day.short]);
    }
  };

  const getRepeatSummary = () => {
    const { enabled, type, interval, days } = formData.repeat;

    if (!enabled || !type) return "No repeat";

    let summary = `Every ${interval > 1 ? interval + " " : ""}${type}`;

    if (type === "weekly" && days.length > 0) {
      summary += ` on ${days.join(", ")}`;
    }

    return summary;
  };

  const getCurrentDateData = () => {
    if (activeSelector === "day") return days;
    if (activeSelector === "month") return months;
    if (activeSelector === "year") return years;
    return [];
  };

  const renderScrollWheelItem = ({ item }, selectedValue, onPress) => {
    const isSelected = selectedValue === item.value;
    return (
      <TouchableOpacity
        style={[
          styles.scrollWheelItem,
          isSelected && styles.selectedScrollWheelItem,
        ]}
        onPress={() => onPress(item)}
      >
        <Text
          style={[
            styles.scrollWheelItemText,
            isSelected && styles.selectedScrollWheelItemText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        (activeSelector === "day" && selectedDay === item.value) ||
        (activeSelector === "month" && selectedMonth === item.value) ||
        (activeSelector === "year" && selectedYear === item.value)
          ? styles.selectedDateItem
          : null,
      ]}
      onPress={() => handleDateItemPress(item)}
    >
      <Text
        style={[
          styles.dateItemText,
          (activeSelector === "day" && selectedDay === item.value) ||
          (activeSelector === "month" && selectedMonth === item.value) ||
          (activeSelector === "year" && selectedYear === item.value)
            ? styles.selectedDateItemText
            : null,
        ]}
      >
        {activeSelector === "month" ? item.label.substring(0, 3) : item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderAvatar = (member, size = 32) => (
    <View
      style={[
        styles.profile_picture,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.profile_picture ? (
        <Image
          source={{ uri: member.profile_picture }}
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

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Task Title */}
        {renderFormSection(
          "Task Title",
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Task Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Task Description */}
        {renderFormSection(
          "Task Description",
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter Task Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Project Selection */}
        {renderFormSection(
          "Project",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowProjectModal(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="folder-outline" size={16} color="#1C30A4" />
                <Text
                  style={[
                    styles.dropdownText,
                    { marginLeft: 8 },
                    !formData.project_id && styles.placeholderText,
                  ]}
                >
                  {getSelectedProjectName()}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Members */}
        {formData?.project_id && renderFormSection(
          "Members",
          <View>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMembersModal(true)}
              >
                <View style={styles.dropdownContent}>
                  <Ionicons name="people-outline" size={16} color="#1C30A4" />
                  <Text
                    style={[
                      styles.dropdownText,
                      { marginLeft: 8 },
                      selectedMembers.length === 0 && styles.placeholderText,
                    ]}
                  >
                    {selectedMembers.length > 0
                      ? `${selectedMembers.length} members selected`
                      : "Select Members"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Enhanced Selected Members Display */}
            {selectedMembers.length > 0 && (
              <View style={styles.selectedMembersContainer}>
                <View style={styles.selectedMembersHeader}>
                  <Text style={styles.selectedMembersTitle}>
                    Team Members ({selectedMembers.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.editMembersButton}
                    onPress={() => setShowMembersModal(true)}
                  >
                    <Ionicons name="pencil" size={14} color="#1C30A4" />
                    <Text style={styles.editMembersText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.membersScrollView}
                  contentContainerStyle={styles.membersScrollContent}
                >
                  {selectedMembers.map((member, index) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberCard,
                        index === 0 && styles.firstMemberCard,
                        index === selectedMembers.length - 1 &&
                          styles.lastMemberCard,
                      ]}
                    >
                      <View style={styles.memberCardHeader}>
                        <View style={styles.memberAvatarContainer}>
                          {renderAvatar(member, 32)}
                          <View
                            style={[
                              styles.memberStatusDot,
                              styles.onlineStatus,
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.removeMemberCardButton}
                          onPress={() => handleMemberToggle(member)}
                        >
                          <Ionicons name="close" size={12} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.memberCardContent}>
                        <Text style={styles.memberCardName} numberOfLines={1}>
                          {member.full_name}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Add Member Button */}
                  <TouchableOpacity
                    style={styles.addMemberCard}
                    onPress={() => setShowMembersModal(true)}
                  >
                    <View style={styles.addMemberIcon}>
                      <Ionicons name="add" size={20} color="#1C30A4" />
                    </View>
                    <Text style={styles.addMemberText}>Add Member</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Priority */}
        {renderFormSection(
          "Priority",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowPriorityModal(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="flag-outline" size={16} color="#1C30A4" />
                <Text
                  style={[
                    styles.dropdownText,
                    { marginLeft: 8 },
                    !formData.priority && styles.placeholderText,
                  ]}
                >
                  {formData.priority || "Select Priority"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Optional Sections */}
        <View style={styles.optionalSectionsContainer}>
          <Text style={styles.sectionTitle}>Optional</Text>

          {/* Add Visual Identity Button */}
          {!showVisualSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowVisualSection(true)}
            >
              <View style={styles.addSectionContent}>
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#1C30A4"
                />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>
                    Add Task Color & Icon
                  </Text>
                  <Text style={styles.addSectionSubtext}>
                    Visual identity for task
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}

          {/* Add Schedule Button */}
          {!showScheduleSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowScheduleSection(true)}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="calendar-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Task Dates</Text>
                  <Text style={styles.addSectionSubtext}>
                    Set start and end dates
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}

          {/* Add Time Button */}
          {!showTimeSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowTimeSection(true)}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="time-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Task Times</Text>
                  <Text style={styles.addSectionSubtext}>
                    Set start and end times
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}

          {/* Add Repeat Button */}
          {!showRepeatSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => {
                setShowRepeatSection(true);
                handleRepeatToggle(true);
              }}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="repeat-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Repeat Options</Text>
                  <Text style={styles.addSectionSubtext}>
                    Set recurring schedule
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}
        </View>

        {/* Visual Identity Section - Only show when enabled */}
        {showVisualSection &&
          renderFormSection(
            "Visual Identity",
            <View style={styles.visualContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Task Appearance</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowVisualSection(false);
                    handleInputChange("color", "");
                    handleInputChange("icon", "");
                  }}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateRow}>
                <View
                  style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}
                >
                  <Text style={styles.inputLabel}>Color</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowColorModal(true)}
                  >
                    <View style={styles.dropdownContent}>
                      {formData.color ? (
                        <View
                          style={[
                            styles.colorPreview,
                            { backgroundColor: formData.color },
                          ]}
                        />
                      ) : (
                        <Ionicons
                          name="color-palette-outline"
                          size={16}
                          color="#1C30A4"
                        />
                      )}
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.color && styles.placeholderText,
                        ]}
                      >
                        {formData.color
                          ? taskColors.find((c) => c.color === formData.color)
                              ?.name
                          : "Select Color"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}
                >
                  <Text style={styles.inputLabel}>Icon</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowIconModal(true)}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons
                        name={formData.icon || "apps-outline"}
                        size={16}
                        color="#1C30A4"
                      />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.icon && styles.placeholderText,
                        ]}
                      >
                        {formData.icon
                          ? taskIcons.find((i) => i.name === formData.icon)
                              ?.label
                          : "Select Icon"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

        {/* Schedule Section - Only show when enabled */}
        {showScheduleSection &&
          renderFormSection(
            "Schedule",
            <View style={styles.dateContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Task Timeline</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowScheduleSection(false);
                    handleInputChange("startDate", "");
                    handleInputChange("endDate", "");
                  }}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateRow}>
                <View
                  style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}
                >
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => handleDatePress("startDate")}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#1C30A4"
                      />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.startDate && styles.placeholderText,
                        ]}
                      >
                        {formData.startDate || "Select Date"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}
                >
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => handleDatePress("endDate")}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#1C30A4"
                      />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.endDate && styles.placeholderText,
                        ]}
                      >
                        {formData.endDate || "Select Date"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

        {/* Time Section - Only show when enabled */}
        {showTimeSection &&
          renderFormSection(
            "Time",
            <View style={styles.timeContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Working Hours</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowTimeSection(false);
                    handleInputChange("startTime", "");
                    handleInputChange("endTime", "");
                  }}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateRow}>
                <View
                  style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}
                >
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => handleTimePress("startTime")}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons name="time-outline" size={16} color="#1C30A4" />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.startTime && styles.placeholderText,
                        ]}
                      >
                        {formData.startTime || "Select Time"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}
                >
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => handleTimePress("endTime")}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons name="time-outline" size={16} color="#1C30A4" />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8 },
                          !formData.endTime && styles.placeholderText,
                        ]}
                      >
                        {formData.endTime || "Select Time"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

        {/* Repeat Section - Only show when enabled */}
        {showRepeatSection &&
          renderFormSection(
            "Repeat Options",
            <View style={styles.repeatContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Recurring Schedule</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowRepeatSection(false);
                    handleRepeatToggle(false);
                  }}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Repeat Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Repeat Type</Text>
                <View style={styles.repeatTypeContainer}>
                  {repeatTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.repeatTypeButton,
                        formData.repeat.type === type.type &&
                          styles.selectedRepeatType,
                      ]}
                      onPress={() => handleRepeatTypeSelect(type)}
                    >
                      <Ionicons
                        name={type.icon}
                        size={14}
                        color={
                          formData.repeat.type === type.type
                            ? "#fff"
                            : "#1C30A4"
                        }
                      />
                      <Text
                        style={[
                          styles.repeatTypeText,
                          formData.repeat.type === type.type &&
                            styles.selectedRepeatTypeText,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Repeat Interval */}
              {formData.repeat.type && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Every {formData.repeat.interval} {formData.repeat.type}
                    {formData.repeat.interval > 1 ? "s" : ""}
                  </Text>
                  <View style={styles.intervalContainer}>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        handleRepeatChange(
                          "interval",
                          Math.max(1, formData.repeat.interval - 1)
                        )
                      }
                    >
                      <Ionicons name="remove" size={16} color="#1C30A4" />
                    </TouchableOpacity>
                    <Text style={styles.intervalText}>
                      {formData.repeat.interval}
                    </Text>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        handleRepeatChange(
                          "interval",
                          formData.repeat.interval + 1
                        )
                      }
                    >
                      <Ionicons name="add" size={16} color="#1C30A4" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Weekly Days Selection */}
              {formData.repeat.type === "weekly" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Repeat on</Text>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day.id}
                        style={[
                          styles.weekDayButton,
                          formData.repeat.days.includes(day.short) &&
                            styles.selectedWeekDay,
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                      >
                        <Text
                          style={[
                            styles.weekDayText,
                            formData.repeat.days.includes(day.short) &&
                              styles.selectedWeekDayText,
                          ]}
                        >
                          {day.short}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Repeat Summary */}
              <View style={styles.repeatSummaryContainer}>
                <Text style={styles.repeatSummaryLabel}>Summary:</Text>
                <Text style={styles.repeatSummaryText}>
                  {getRepeatSummary()}
                </Text>
              </View>
            </View>
          )}

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              createTaskMutation.isLoading && styles.createButtonDisabled
            ]}
            onPress={handleCreateTask}
            disabled={createTaskMutation.isLoading}
          >
            <Text style={styles.createButtonText}>
              {createTaskMutation.isLoading ? "Creating..." : "Create Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Color Modal */}
      <Modal
        visible={showColorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowColorModal(false)}
        >
          <TouchableOpacity
            style={styles.dynamicModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Task Color</Text>
            </View>

            <View style={styles.colorGrid}>
              {taskColors.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color.color },
                    formData.color === color.color && styles.selectedColorItem,
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {formData.color === color.color && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowColorModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Icon Modal */}
      <Modal
        visible={showIconModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowIconModal(false)}
        >
          <TouchableOpacity
            style={styles.dynamicModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Task Icon</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconGrid}>
                {taskIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon.id}
                    style={[
                      styles.iconItem,
                      formData.icon === icon.name && styles.selectedIconItem,
                    ]}
                    onPress={() => handleIconSelect(icon)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={icon.name}
                      size={24}
                      color={formData.icon === icon.name ? "#fff" : "#1C30A4"}
                    />
                    <Text
                      style={[
                        styles.iconItemText,
                        formData.icon === icon.name &&
                          styles.selectedIconItemText,
                      ]}
                    >
                      {icon.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowIconModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Project Modal */}
      <Modal
        visible={showProjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProjectModal(false)}
        >
          <TouchableOpacity
            style={styles.dynamicModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {availableProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.optionItem,
                    formData.project_id === project.id && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleProjectSelect(project)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.tagColorDot,
                        { backgroundColor: '#1C30A4' },
                      ]}
                    />
                    <Ionicons
                      name={'folder'}
                      size={20}
                      color={'#1C30A4'}
                      style={styles.optionIcon}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        formData.project_id === project.id && styles.selectedOptionText,
                      ]}
                    >
                      {project.title}
                    </Text>
                  </View>
                  {formData.project_id === project.id && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowProjectModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMembersModal(false)}
        >
          <TouchableOpacity
            style={styles.membersModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team Members</Text>
              <Text style={styles.modalSubtitle}>
                {selectedMembers?.length} of {availableProjects.find(p => p.id == formData.project_id)?.members?.length} selected
              </Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                value={memberSearchQuery}
                onChangeText={setMemberSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {memberSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setMemberSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                // Find project only once
                const project = availableProjects.find(p => p.id == formData.project_id);

                // Safely get members array
                let members = project?.members ? [...project.members] : [];

                // Add owner if available and not already in members
                if (project?.owner && !members.some(m => m.id === project.owner.id)) {
                  members.push(project.owner);
                }

                // Check if there are no members
                if (members.length === 0) {
                  return (
                    <View style={styles.noResultsContainer}>
                      <Ionicons name="people" size={48} color="#D1D5DB" />
                      <Text style={styles.noResultsText}>
                        No members available in that project
                      </Text>
                      <Text style={styles.noResultsSubtext}>
                        {memberSearchQuery
                          ? "Try adjusting your search terms"
                          : "Add some members to that project to have the ability to assign them to this project's tasks"}
                      </Text>
                    </View>
                  );
                }

                // Render members list
                return members.map((member) => {
                  const isSelected = selectedMembers.some((m) => m.id === member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberItem,
                        isSelected && styles.selectedMemberItem,
                      ]}
                      onPress={() => handleMemberToggle(member)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.memberInfo}>
                        {member.profile_picture ? (
                          <Image
                            source={{ uri: member.profile_picture }}
                            style={styles.memberAvatar}
                          />
                        ) : (
                          renderAvatar(member, 40)
                        )}
                        <View style={styles.memberDetails}>
                          <Text
                            style={[
                              styles.memberName,
                              isSelected && styles.selectedMemberName,
                            ]}
                          >
                            {member.full_name}
                          </Text>
                          <Text style={styles.memberEmail}>{member.email}</Text>
                        </View>
                      </View>
                      <View
                        style={[styles.checkbox, isSelected && styles.checkedBox]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>


            <View style={styles.membersModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowMembersModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmMembersButton}
                onPress={() => setShowMembersModal(false)}
              >
                <Text style={styles.confirmMembersButtonText}>
                  Done ({selectedMembers.length})
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPriorityModal(false)}
        >
          <TouchableOpacity
            style={styles.dynamicModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Priority</Text>
            </View>

            <View style={styles.priorityList}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityItem,
                    formData.priority === priority.name &&
                      styles.selectedPriorityItem,
                  ]}
                  onPress={() => handlePrioritySelect(priority)}
                  activeOpacity={0.7}
                >
                  <View style={styles.priorityContent}>
                    <Ionicons
                      name={priority.icon}
                      size={20}
                      color={priority.color}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priority.color },
                        formData.priority === priority.name &&
                          styles.selectedPriorityText,
                      ]}
                    >
                      {priority.name} Priority
                    </Text>
                  </View>
                  {formData.priority === priority.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowPriorityModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDateCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Text style={styles.modalSubtitle}>
                {activeSelector === "day" && "Select Day"}
                {activeSelector === "month" && "Select Month"}
                {activeSelector === "year" && "Select Year"}
              </Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressDot,
                  activeSelector === "day" && styles.activeDot,
                ]}
              />
              <View
                style={[
                  styles.progressDot,
                  activeSelector === "month" && styles.activeDot,
                ]}
              />
              <View
                style={[
                  styles.progressDot,
                  activeSelector === "year" && styles.activeDot,
                ]}
              />
            </View>

            {/* Selected Values Display */}
            <View style={styles.selectedValuesContainer}>
              <View style={styles.selectedValue}>
                <Text style={styles.selectedValueLabel}>Day</Text>
                <Text style={styles.selectedValueText}>
                  {selectedDay || "--"}
                </Text>
              </View>
              <View style={styles.selectedValue}>
                <Text style={styles.selectedValueLabel}>Month</Text>
                <Text style={styles.selectedValueText}>
                  {selectedMonth
                    ? months
                        .find((m) => m.value === selectedMonth)
                        ?.label.substring(0, 3)
                    : "--"}
                </Text>
              </View>
              <View style={styles.selectedValue}>
                <Text style={styles.selectedValueLabel}>Year</Text>
                <Text style={styles.selectedValueText}>
                  {selectedYear || "--"}
                </Text>
              </View>
            </View>

            {/* Date Picker List */}
            <View style={styles.datePickerContainer}>
              <FlatList
                data={getCurrentDateData()}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.value}
                style={styles.dateList}
                showsVerticalScrollIndicator={false}
                numColumns={
                  activeSelector === "day"
                    ? 7
                    : activeSelector === "month"
                    ? 3
                    : 4
                }
                key={activeSelector}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleDateCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedDay || !selectedMonth || !selectedYear) &&
                    styles.disabledButton,
                ]}
                onPress={handleDateSelect}
                disabled={!selectedDay || !selectedMonth || !selectedYear}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleTimeCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
            </View>

            {/* Time Display */}
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.currentTimeText}>
                {selectedHour || "09"} : {selectedMinute || "00"}{" "}
                {selectedPeriod}
              </Text>
            </View>

            {/* Scroll Wheels */}
            <View style={styles.scrollWheelsContainer}>
              {/* Hours Wheel */}
              <View style={styles.scrollWheelColumn}>
                <FlatList
                  data={hours}
                  renderItem={(props) =>
                    renderScrollWheelItem(props, selectedHour, handleHourScroll)
                  }
                  keyExtractor={(item) => `hour-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollWheelList}
                  contentContainerStyle={styles.scrollWheelContent}
                />
                <View style={styles.scrollWheelOverlay} />
              </View>

              {/* Colon Separator */}
              <View style={styles.colonSeparator}>
                <Text style={styles.colonText}>:</Text>
              </View>

              {/* Minutes Wheel */}
              <View style={styles.scrollWheelColumn}>
                <FlatList
                  data={minutes}
                  renderItem={(props) =>
                    renderScrollWheelItem(
                      props,
                      selectedMinute,
                      handleMinuteScroll
                    )
                  }
                  keyExtractor={(item) => `minute-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollWheelList}
                  contentContainerStyle={styles.scrollWheelContent}
                />
                <View style={styles.scrollWheelOverlay} />
              </View>

              {/* AM/PM Wheel */}
              <View style={styles.scrollWheelColumn}>
                <FlatList
                  data={periods}
                  renderItem={(props) =>
                    renderScrollWheelItem(
                      props,
                      selectedPeriod,
                      handlePeriodScroll
                    )
                  }
                  keyExtractor={(item) => `period-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollWheelList}
                  contentContainerStyle={styles.scrollWheelContent}
                />
                <View style={styles.scrollWheelOverlay} />
              </View>
            </View>

            {/* Time Presets */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsTitle}>Presets</Text>
              <View style={styles.presetsRow}>
                {timePresets.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetButton}
                    onPress={() => handleTimePreset(preset)}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleTimeSelect}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  attachmentSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  attachmentContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentBox: {
    borderWidth: 2,
    borderColor: "#1C30A4",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  attachmentIcon: {
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  attachmentSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  uploadedFilesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  uploadedFilesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
  },
  removeFileButton: {
    padding: 4,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    color: "#374151",
    padding: 0,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedMembersContainer: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMembersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedMembersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  editMembersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editMembersText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 4,
  },
  membersScrollView: {
    flexGrow: 0,
  },
  membersScrollContent: {
    paddingHorizontal: 2,
  },
  memberCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    width: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  firstMemberCard: {
    marginLeft: 0,
  },
  lastMemberCard: {
    marginRight: 0,
  },
  memberCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  memberAvatarContainer: {
    position: "relative",
  },
  memberStatusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineStatus: {
    backgroundColor: "#10B981",
  },
  removeMemberCardButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  memberCardContent: {
    alignItems: "flex-start",
  },
  memberCardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  memberCardRole: {
    fontSize: 10,
    color: "#6B7280",
  },
  addMemberCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginLeft: 4,
    width: 100,
    borderWidth: 2,
    borderColor: "#1C30A4",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 88,
  },
  addMemberIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  addMemberText: {
    fontSize: 10,
    color: "#1C30A4",
    fontWeight: "500",
    textAlign: "center",
  },
  // Optional sections styles
  optionalSectionsContainer: {
    marginBottom: 16,
  },
  addSectionButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addSectionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addSectionContentCol: {
    flexDirection: "column",
    textAlign: "right",
    flex: 1,
    alignContent: "flex-start",
    marginLeft: 8,
  },
  addSectionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  addSectionSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionHeaderWithRemove: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  removeSectionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  visualContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  repeatContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  // Repeat styles
  repeatTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  repeatTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    minWidth: "45%",
  },
  selectedRepeatType: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  repeatTypeText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 6,
  },
  selectedRepeatTypeText: {
    color: "#fff",
  },
  intervalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  intervalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  intervalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedWeekDay: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  weekDayText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
  },
  selectedWeekDayText: {
    color: "#fff",
  },
  repeatSummaryContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  repeatSummaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  repeatSummaryText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "600",
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#1C30A4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#1C30A4",
  },
  selectedValuesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  selectedValue: {
    alignItems: "center",
  },
  selectedValueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 5,
  },
  selectedValueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  datePickerContainer: {
    marginBottom: 20,
    height: 200,
  },
  dateList: {
    flex: 1,
  },
  dateItem: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  selectedDateItem: {
    backgroundColor: "#1C30A4",
  },
  dateItemText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  selectedDateItemText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#1C30A4",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  // Time Modal Specific Styles
  timeModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    alignItems: "center",
  },
  timeDisplayContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  currentTimeText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 2,
  },
  scrollWheelsContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 180,
    marginBottom: 30,
  },
  scrollWheelColumn: {
    flex: 1,
    position: "relative",
  },
  colonSeparator: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
  },
  scrollWheelList: {
    flex: 1,
  },
  scrollWheelContent: {
    paddingVertical: 88,
  },
  scrollWheelItem: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  selectedScrollWheelItem: {
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderRadius: 8,
  },
  scrollWheelItemText: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  selectedScrollWheelItemText: {
    color: "#1C30A4",
    fontWeight: "600",
    fontSize: 20,
  },
  scrollWheelOverlay: {
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    height: 44,
    pointerEvents: "none",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.2)",
  },
  presetsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "left",
  },
  presetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  presetButtonText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
  },
  doneButton: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Selection Modal Styles
  dynamicModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "80%",
  },
  membersModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "80%",
  },
  modalScrollContent: {
    flexGrow: 0,
    flexShrink: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorItem: {
    borderColor: "#374151",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconItem: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedIconItem: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  iconItemText: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  selectedIconItemText: {
    color: "#fff",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedOptionItem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#1C30A4",
    fontWeight: "600",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedMemberItem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  selectedMemberName: {
    color: "#1C30A4",
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  membersModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmMembersButton: {
    flex: 1,
    backgroundColor: "#1C30A4",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  confirmMembersButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  priorityList: {
    marginBottom: 20,
  },
  priorityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedPriorityItem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#1C30A4",
  },
  priorityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  selectedPriorityText: {
    fontWeight: "600",
  },
  cancelModalButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  cancelModalButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CreateTask;
