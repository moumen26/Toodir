import React, { useState, useCallback, useMemo } from "react";
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
import { useCreateTask } from "../hooks/useTaskQueries";
import { useInfiniteProjects } from "../hooks/useProjectQueries";
import { useTags } from "../hooks/useTagsQueries";

const CreateTaskForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "",
    project_id: "",
    priority: "",
    start_date: "",
    end_date: "",
    repetition_type: "none",
    repetition_interval: 1,
    repetition_day_of_week: [],
    assigned_users: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  
  // Modal states
  const [showColorModal, setShowColorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("");
  
  // Optional sections visibility
  const [showVisualSection, setShowVisualSection] = useState(false);
  const [showScheduleSection, setShowScheduleSection] = useState(false);
  const [showRepeatSection, setShowRepeatSection] = useState(false);

  // Date picker states
  const [activeSelector, setActiveSelector] = useState("day");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Queries
  const createTaskMutation = useCreateTask();
  const { data: projectsData } = useInfiniteProjects({ limit: 50 });
  const { data: tagsData } = useTags();

  // Sample data (can be moved to constants or fetched from API)
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

  const priorities = [
    { id: 1, name: "high", label: "High", color: "#EF4444", icon: "flag" },
    { id: 2, name: "medium", label: "Medium", color: "#F59E0B", icon: "flag" },
    { id: 3, name: "low", label: "Low", color: "#10B981", icon: "flag" },
  ];

  const repeatTypes = [
    { id: 1, type: "none", label: "None", icon: "close" },
    { id: 2, type: "daily", label: "Daily", icon: "today" },
    { id: 3, type: "weekly", label: "Weekly", icon: "calendar" },
    { id: 4, type: "monthly", label: "Monthly", icon: "calendar-outline" },
    { id: 5, type: "yearly", label: "Yearly", icon: "calendar-clear" },
  ];

  const weekDays = [
    { id: 0, short: "Mon", full: "Monday", value: 0 },
    { id: 1, short: "Tue", full: "Tuesday", value: 1 },
    { id: 2, short: "Wed", full: "Wednesday", value: 2 },
    { id: 3, short: "Thu", full: "Thursday", value: 3 },
    { id: 4, short: "Fri", full: "Friday", value: 4 },
    { id: 5, short: "Sat", full: "Saturday", value: 5 },
    { id: 6, short: "Sun", full: "Sunday", value: 6 },
  ];

  // Date picker data
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

  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (new Date().getFullYear() + i).toString(),
    label: (new Date().getFullYear() + i).toString(),
  }));

  // Memoized data
  const projects = useMemo(() => {
    if (!projectsData?.pages) return [];
    return projectsData.pages.flatMap(page => page.data || []);
  }, [projectsData]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === formData.project_id);
  }, [projects, formData.project_id]);

  const selectedPriority = useMemo(() => {
    return priorities.find(p => p.name === formData.priority);
  }, [formData.priority]);

  const selectedColor = useMemo(() => {
    return taskColors.find(c => c.color === formData.color);
  }, [formData.color]);

  // Form handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [validationErrors]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        errors.end_date = "End date must be after start date";
      }
    }

    if (formData.repetition_type === "weekly" && formData.repetition_day_of_week.length === 0) {
      errors.repetition_day_of_week = "Please select at least one day for weekly repetition";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    try {
      // Prepare data for API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        color: formData.color || null,
        project_id: formData.project_id || null,
        priority: formData.priority || "low",
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        repetition_type: formData.repetition_type || "none",
        repetition_interval: formData.repetition_interval || 1,
        repetition_day_of_week: formData.repetition_type === "weekly" ? formData.repetition_day_of_week : null,
        assigned_users: formData.assigned_users.length > 0 ? formData.assigned_users : null,
      };

      await createTaskMutation.mutateAsync(taskData);
      
      Alert.alert(
        "Success",
        "Task created successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create task. Please try again."
      );
    }
  };

  const handleBack = () => {
    router.back();
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

  const handleDateSelect = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay}`;
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

  // Selection handlers
  const handleColorSelect = (color) => {
    handleInputChange("color", color.color);
    setShowColorModal(false);
  };

  const handleProjectSelect = (project) => {
    handleInputChange("project_id", project.id);
    setShowProjectModal(false);
  };

  const handlePrioritySelect = (priority) => {
    handleInputChange("priority", priority.name);
    setShowPriorityModal(false);
  };

  const handleRepeatTypeSelect = (type) => {
    handleInputChange("repetition_type", type.type);
    if (type.type !== "weekly") {
      handleInputChange("repetition_day_of_week", []);
    }
  };

  const handleWeekDayToggle = (day) => {
    const currentDays = formData.repetition_day_of_week;
    const isSelected = currentDays.includes(day.value);

    if (isSelected) {
      handleInputChange(
        "repetition_day_of_week",
        currentDays.filter((d) => d !== day.value)
      );
    } else {
      handleInputChange("repetition_day_of_week", [...currentDays, day.value]);
    }
  };

  const getCurrentDateData = () => {
    if (activeSelector === "day") return days;
    if (activeSelector === "month") return months;
    if (activeSelector === "year") return years;
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

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
              style={[
                styles.textInput,
                validationErrors.title && styles.inputError
              ]}
              placeholder="Enter Task Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.title && (
              <Text style={styles.errorText}>{validationErrors.title}</Text>
            )}
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
                    !selectedProject && styles.placeholderText,
                  ]}
                >
                  {selectedProject?.title || "Select Project (Optional)"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
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
                <Ionicons 
                  name="flag-outline" 
                  size={16} 
                  color={selectedPriority?.color || "#1C30A4"} 
                />
                <Text
                  style={[
                    styles.dropdownText,
                    { marginLeft: 8 },
                    !selectedPriority && styles.placeholderText,
                  ]}
                >
                  {selectedPriority?.label || "Select Priority"}
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
                  <Text style={styles.addSectionText}>Add Task Color</Text>
                  <Text style={styles.addSectionSubtext}>Visual identity for task</Text>
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
                  <Text style={styles.addSectionSubtext}>Set start and end dates</Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}

          {/* Add Repeat Button */}
          {!showRepeatSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowRepeatSection(true)}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="repeat-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Repeat Options</Text>
                  <Text style={styles.addSectionSubtext}>Set recurring schedule</Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}
        </View>

        {/* Visual Identity Section */}
        {showVisualSection &&
          renderFormSection(
            "Visual Identity",
            <View style={styles.visualContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Task Color</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowVisualSection(false);
                    handleInputChange("color", "");
                  }}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
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
                    {selectedColor?.name || "Select Color"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

        {/* Schedule Section */}
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
                    handleInputChange("start_date", "");
                    handleInputChange("end_date", "");
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
                    onPress={() => handleDatePress("start_date")}
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
                          !formData.start_date && styles.placeholderText,
                        ]}
                      >
                        {formData.start_date ? formatDate(formData.start_date) : "Select Date"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                
                <View
                  style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}
                >
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => handleDatePress("end_date")}
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
                          !formData.end_date && styles.placeholderText,
                        ]}
                      >
                        {formData.end_date ? formatDate(formData.end_date) : "Select Date"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  {validationErrors.end_date && (
                    <Text style={styles.errorText}>{validationErrors.end_date}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

        {/* Repeat Section */}
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
                    handleInputChange("repetition_type", "none");
                    handleInputChange("repetition_day_of_week", []);
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
                        formData.repetition_type === type.type &&
                          styles.selectedRepeatType,
                      ]}
                      onPress={() => handleRepeatTypeSelect(type)}
                    >
                      <Ionicons
                        name={type.icon}
                        size={14}
                        color={
                          formData.repetition_type === type.type
                            ? "#fff"
                            : "#1C30A4"
                        }
                      />
                      <Text
                        style={[
                          styles.repeatTypeText,
                          formData.repetition_type === type.type &&
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
              {formData.repetition_type !== "none" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Every {formData.repetition_interval} {formData.repetition_type}
                    {formData.repetition_interval > 1 ? "s" : ""}
                  </Text>
                  <View style={styles.intervalContainer}>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        handleInputChange(
                          "repetition_interval",
                          Math.max(1, formData.repetition_interval - 1)
                        )
                      }
                    >
                      <Ionicons name="remove" size={16} color="#1C30A4" />
                    </TouchableOpacity>
                    <Text style={styles.intervalText}>
                      {formData.repetition_interval}
                    </Text>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        handleInputChange(
                          "repetition_interval",
                          formData.repetition_interval + 1
                        )
                      }
                    >
                      <Ionicons name="add" size={16} color="#1C30A4" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Weekly Days Selection */}
              {formData.repetition_type === "weekly" && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Repeat on</Text>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day.id}
                        style={[
                          styles.weekDayButton,
                          formData.repetition_day_of_week.includes(day.value) &&
                            styles.selectedWeekDay,
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                      >
                        <Text
                          style={[
                            styles.weekDayText,
                            formData.repetition_day_of_week.includes(day.value) &&
                              styles.selectedWeekDayText,
                          ]}
                        >
                          {day.short}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {validationErrors.repetition_day_of_week && (
                    <Text style={styles.errorText}>
                      {validationErrors.repetition_day_of_week}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              createTaskMutation.isLoading && styles.disabledButton
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
            style={styles.modalContainer}
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
              style={styles.cancelButton}
              onPress={() => setShowColorModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
            style={styles.modalContainer}
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
              {/* No Project Option */}
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  !formData.project_id && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  handleInputChange("project_id", "");
                  setShowProjectModal(false);
                }}
              >
                <View style={styles.optionContent}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                  <Text style={styles.optionText}>No Project</Text>
                </View>
                {!formData.project_id && (
                  <Ionicons name="checkmark" size={20} color="#1C30A4" />
                )}
              </TouchableOpacity>

              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.optionItem,
                    formData.project_id === project.id && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleProjectSelect(project)}
                >
                  <View style={styles.optionContent}>
                    <Ionicons name="folder" size={20} color="#1C30A4" />
                    <Text style={styles.optionText}>{project.title}</Text>
                  </View>
                  {formData.project_id === project.id && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowProjectModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
            style={styles.modalContainer}
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
                    formData.priority === priority.name && styles.selectedPriorityItem,
                  ]}
                  onPress={() => handlePrioritySelect(priority)}
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
                      ]}
                    >
                      {priority.label} Priority
                    </Text>
                  </View>
                  {formData.priority === priority.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPriorityModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
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
                onPress={() => setShowDatePicker(false)}
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
  formSection: {
    marginBottom: 16,
    marginTop: 20,
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
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
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
    marginLeft: 8,
    flex: 1,
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
  disabledButton: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
  modalScrollContent: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 300,
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
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 12,
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
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
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
});

export default CreateTaskForm;