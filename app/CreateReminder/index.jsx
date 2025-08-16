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
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCreateReminder } from "../hooks/useRemindersQueries";
import { useTags } from "../hooks/useTagsQueries";
import TagsSelectorModal from "../components/TagsSelectorModal";

const CreateReminder = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminder_type: "one_time",
    reminder_date_time: "",
    recurrence_pattern: "",
    recurrence_interval: 1,
    recurrence_days_of_week: [],
    recurrence_end_date: "",
    tag_id: "",
    notification_methods: ["push"],
    advance_notification_minutes: 0,
    related_entity_type: "",
    related_entity_id: "",
  });

  const [selectedTag, setSelectedTag] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Modal states
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAdvanceNotificationModal, setShowAdvanceNotificationModal] = useState(false);
  
  // Date/Time picker states
  const [dateTimeType, setDateTimeType] = useState(""); // reminder_date_time or recurrence_end_date
  const [activeSelector, setActiveSelector] = useState("date");
  const [selectedDate, setSelectedDate] = useState({
    day: null,
    month: null,
    year: null,
  });
  const [selectedTime, setSelectedTime] = useState({
    hour: null,
    minute: null,
    period: "AM",
  });

  // Queries
  const createReminderMutation = useCreateReminder();
  const { data: tagsData } = useTags();

  // Static data
  const reminderTypes = [
    { id: "one_time", label: "One Time", icon: "radio-button-on" },
    { id: "recurring", label: "Recurring", icon: "repeat" },
  ];

  const recurrencePatterns = [
    { id: "daily", label: "Daily", icon: "today" },
    { id: "weekly", label: "Weekly", icon: "calendar" },
    { id: "monthly", label: "Monthly", icon: "calendar-outline" },
    { id: "yearly", label: "Yearly", icon: "calendar-clear" },
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

  const notificationMethods = [
    { id: "email", label: "Email", icon: "mail" },
    { id: "push", label: "Push Notification", icon: "notifications" },
    { id: "sms", label: "SMS", icon: "chatbubble" },
  ];

  const advanceNotificationOptions = [
    { id: 0, label: "At time of reminder", value: 0 },
    { id: 5, label: "5 minutes before", value: 5 },
    { id: 15, label: "15 minutes before", value: 15 },
    { id: 30, label: "30 minutes before", value: 30 },
    { id: 60, label: "1 hour before", value: 60 },
    { id: 1440, label: "1 day before", value: 1440 },
  ];

  // Date/Time picker data
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

  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString(),
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const periods = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

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
      errors.title = "Reminder title is required";
    }

    if (!formData.reminder_date_time) {
      errors.reminder_date_time = "Reminder date and time is required";
    } else {
      const reminderDate = new Date(formData.reminder_date_time);
      if (isNaN(reminderDate.getTime())) {
        errors.reminder_date_time = "Invalid date format";
      } else if (reminderDate <= new Date()) {
        errors.reminder_date_time = "Reminder date must be in the future";
      }
    }

    if (formData.reminder_type === "recurring" && !formData.recurrence_pattern) {
      errors.recurrence_pattern = "Recurrence pattern is required for recurring reminders";
    }

    if (formData.reminder_type === "recurring" && formData.recurrence_pattern === "weekly" && formData.recurrence_days_of_week.length === 0) {
      errors.recurrence_days_of_week = "Please select at least one day for weekly recurrence";
    }

    if (formData.recurrence_end_date && formData.reminder_date_time) {
      const endDate = new Date(formData.recurrence_end_date);
      const startDate = new Date(formData.reminder_date_time);
      if (isNaN(endDate.getTime())) {
        errors.recurrence_end_date = "Invalid end date format";
      } else if (endDate <= startDate) {
        errors.recurrence_end_date = "End date must be after reminder date";
      }
    }

    if (formData.notification_methods.length === 0) {
      errors.notification_methods = "At least one notification method is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateReminder = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    try {
      // Prepare data for API
      const reminderData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        reminder_type: formData.reminder_type,
        reminder_date_time: formData.reminder_date_time,
        recurrence_pattern: formData.reminder_type === "recurring" ? formData.recurrence_pattern : null,
        recurrence_interval: formData.reminder_type === "recurring" ? formData.recurrence_interval : null,
        recurrence_days_of_week: formData.reminder_type === "recurring" && formData.recurrence_pattern === "weekly" ? formData.recurrence_days_of_week : null,
        recurrence_end_date: formData.reminder_type === "recurring" ? formData.recurrence_end_date || null : null,
        tag_id: formData.tag_id || null,
        notification_methods: formData.notification_methods,
        advance_notification_minutes: formData.advance_notification_minutes,
        related_entity_type: formData.related_entity_type || null,
        related_entity_id: formData.related_entity_id || null,
      };

      await createReminderMutation.mutateAsync(reminderData);
      
      Alert.alert(
        "Success",
        "Reminder created successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create reminder. Please try again."
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Date/Time picker handlers
  const handleDateTimePress = (type) => {
    setDateTimeType(type);
    setActiveSelector("date");
    // Reset selections
    setSelectedDate({ day: null, month: null, year: null });
    setSelectedTime({ hour: null, minute: null, period: "AM" });
    setShowDateTimeModal(true);
  };

  const formatDateTimeForAPI = () => {
    if (!selectedDate.day || !selectedDate.month || !selectedDate.year || 
        !selectedTime.hour || selectedTime.minute === null || !selectedTime.period) {
      return null;
    }

    let hour = parseInt(selectedTime.hour);
    
    // Convert 12-hour format to 24-hour format
    if (selectedTime.period === "PM" && hour !== 12) {
      hour += 12;
    } else if (selectedTime.period === "AM" && hour === 12) {
      hour = 0;
    }

    // Create ISO string format: YYYY-MM-DDTHH:mm:ss
    const isoString = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}T${hour.toString().padStart(2, "0")}:${selectedTime.minute}:00`;
    
    // Validate the date
    const testDate = new Date(isoString);
    if (isNaN(testDate.getTime())) {
      return null;
    }
    
    return isoString;
  };

  const handleDateTimeSelect = () => {
    const formattedDateTime = formatDateTimeForAPI();
    
    if (formattedDateTime) {
      handleInputChange(dateTimeType, formattedDateTime);
      setShowDateTimeModal(false);
    } else {
      Alert.alert("Invalid Date", "Please check your date and time selection");
    }
  };

  const getCurrentData = () => {
    if (activeSelector === "date") {
      if (selectedDate.day === null) return days;
      if (selectedDate.month === null) return months;
      if (selectedDate.year === null) return years;
    } else if (activeSelector === "time") {
      if (selectedTime.hour === null) return hours;
      if (selectedTime.minute === null) return minutes;
      return periods; // Always show periods last
    }
    return [];
  };

  const handleDateTimeItemPress = (item) => {
    if (activeSelector === "date") {
      if (selectedDate.day === null) {
        setSelectedDate(prev => ({ ...prev, day: item.value }));
      } else if (selectedDate.month === null) {
        setSelectedDate(prev => ({ ...prev, month: item.value }));
      } else if (selectedDate.year === null) {
        setSelectedDate(prev => ({ ...prev, year: item.value }));
        setActiveSelector("time"); // Move to time selection
      }
    } else if (activeSelector === "time") {
      if (selectedTime.hour === null) {
        setSelectedTime(prev => ({ ...prev, hour: item.value }));
      } else if (selectedTime.minute === null) {
        setSelectedTime(prev => ({ ...prev, minute: item.value }));
      } else {
        setSelectedTime(prev => ({ ...prev, period: item.value }));
      }
    }
  };

  // Tag handlers
  const handleTagSelect = (tags) => {
    const tag = tags[0]; // Single tag selection
    if (tag) {
      setSelectedTag(tag);
      handleInputChange("tag_id", tag.id);
    } else {
      setSelectedTag(null);
      handleInputChange("tag_id", "");
    }
  };

  // Notification method handlers
  const handleNotificationMethodToggle = (method) => {
    const currentMethods = formData.notification_methods;
    const isSelected = currentMethods.includes(method.id);

    if (isSelected && currentMethods.length > 1) {
      handleInputChange("notification_methods", currentMethods.filter(m => m !== method.id));
    } else if (!isSelected) {
      handleInputChange("notification_methods", [...currentMethods, method.id]);
    }
  };

  // Week day handlers
  const handleWeekDayToggle = (day) => {
    const currentDays = formData.recurrence_days_of_week;
    const isSelected = currentDays.includes(day.value);

    if (isSelected) {
      handleInputChange("recurrence_days_of_week", currentDays.filter(d => d !== day.value));
    } else {
      handleInputChange("recurrence_days_of_week", [...currentDays, day.value]);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getCurrentSelectionStep = () => {
    if (activeSelector === "date") {
      if (selectedDate.day === null) return "Select Day";
      if (selectedDate.month === null) return "Select Month";
      if (selectedDate.year === null) return "Select Year";
    } else if (activeSelector === "time") {
      if (selectedTime.hour === null) return "Select Hour";
      if (selectedTime.minute === null) return "Select Minute";
      return "Select AM/PM";
    }
    return "Complete";
  };

  const isDateTimeComplete = () => {
    return selectedDate.day && selectedDate.month && selectedDate.year &&
           selectedTime.hour && selectedTime.minute !== null && selectedTime.period;
  };

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderDateTimeItem = ({ item }) => {
    const isSelected = 
      (activeSelector === "date" && (
        (selectedDate.day === null && selectedDate.day === item.value) ||
        (selectedDate.month === null && selectedDate.month === item.value) ||
        (selectedDate.year === null && selectedDate.year === item.value)
      )) ||
      (activeSelector === "time" && (
        (selectedTime.hour === null && selectedTime.hour === item.value) ||
        (selectedTime.minute === null && selectedTime.minute === item.value) ||
        (selectedTime.period === item.value)
      ));

    return (
      <TouchableOpacity
        style={[
          styles.dateTimeItem,
          isSelected && styles.selectedDateTimeItem,
        ]}
        onPress={() => handleDateTimeItemPress(item)}
      >
        <Text
          style={[
            styles.dateTimeItemText,
            isSelected && styles.selectedDateTimeItemText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Reminder</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Reminder Title */}
        {renderFormSection(
          "Reminder Title",
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                validationErrors.title && styles.inputError
              ]}
              placeholder="Enter reminder title"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholderTextColor="#9CA3AF"
            />
            {validationErrors.title && (
              <Text style={styles.errorText}>{validationErrors.title}</Text>
            )}
          </View>
        )}

        {/* Reminder Description */}
        {renderFormSection(
          "Description (Optional)",
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter reminder description"
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Reminder Type */}
        {renderFormSection(
          "Reminder Type",
          <View style={styles.inputContainer}>
            <View style={styles.reminderTypeContainer}>
              {reminderTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.reminderTypeButton,
                    formData.reminder_type === type.id && styles.selectedReminderType,
                  ]}
                  onPress={() => handleInputChange("reminder_type", type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={formData.reminder_type === type.id ? "#fff" : "#1C30A4"}
                  />
                  <Text
                    style={[
                      styles.reminderTypeText,
                      formData.reminder_type === type.id && styles.selectedReminderTypeText,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reminder Date & Time */}
        {renderFormSection(
          "Reminder Date & Time",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                validationErrors.reminder_date_time && styles.inputError
              ]}
              onPress={() => handleDateTimePress("reminder_date_time")}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="calendar-outline" size={16} color="#1C30A4" />
                <Text
                  style={[
                    styles.dropdownText,
                    { marginLeft: 8 },
                    !formData.reminder_date_time && styles.placeholderText,
                  ]}
                >
                  {formData.reminder_date_time ? formatDateTime(formData.reminder_date_time) : "Select date and time"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            {validationErrors.reminder_date_time && (
              <Text style={styles.errorText}>{validationErrors.reminder_date_time}</Text>
            )}
          </View>
        )}

        {/* Recurrence Settings (only for recurring reminders) */}
        {formData.reminder_type === "recurring" && (
          <>
            {/* Recurrence Pattern */}
            {renderFormSection(
              "Recurrence Pattern",
              <View style={styles.inputContainer}>
                <View style={styles.recurrencePatternContainer}>
                  {recurrencePatterns.map((pattern) => (
                    <TouchableOpacity
                      key={pattern.id}
                      style={[
                        styles.recurrencePatternButton,
                        formData.recurrence_pattern === pattern.id && styles.selectedRecurrencePattern,
                      ]}
                      onPress={() => handleInputChange("recurrence_pattern", pattern.id)}
                    >
                      <Ionicons
                        name={pattern.icon}
                        size={14}
                        color={formData.recurrence_pattern === pattern.id ? "#fff" : "#1C30A4"}
                      />
                      <Text
                        style={[
                          styles.recurrencePatternText,
                          formData.recurrence_pattern === pattern.id && styles.selectedRecurrencePatternText,
                        ]}
                      >
                        {pattern.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {validationErrors.recurrence_pattern && (
                  <Text style={styles.errorText}>{validationErrors.recurrence_pattern}</Text>
                )}
              </View>
            )}

            {/* Recurrence Interval */}
            {formData.recurrence_pattern && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Repeat every {formData.recurrence_interval} {formData.recurrence_pattern}
                  {formData.recurrence_interval > 1 ? "s" : ""}
                </Text>
                <View style={styles.intervalContainer}>
                  <TouchableOpacity
                    style={styles.intervalButton}
                    onPress={() =>
                      handleInputChange(
                        "recurrence_interval",
                        Math.max(1, formData.recurrence_interval - 1)
                      )
                    }
                  >
                    <Ionicons name="remove" size={16} color="#1C30A4" />
                  </TouchableOpacity>
                  <Text style={styles.intervalText}>
                    {formData.recurrence_interval}
                  </Text>
                  <TouchableOpacity
                    style={styles.intervalButton}
                    onPress={() =>
                      handleInputChange(
                        "recurrence_interval",
                        formData.recurrence_interval + 1
                      )
                    }
                  >
                    <Ionicons name="add" size={16} color="#1C30A4" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Weekly Days Selection */}
            {formData.recurrence_pattern === "weekly" && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Repeat on</Text>
                <View style={styles.weekDaysContainer}>
                  {weekDays.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.weekDayButton,
                        formData.recurrence_days_of_week.includes(day.value) && styles.selectedWeekDay,
                      ]}
                      onPress={() => handleWeekDayToggle(day)}
                    >
                      <Text
                        style={[
                          styles.weekDayText,
                          formData.recurrence_days_of_week.includes(day.value) && styles.selectedWeekDayText,
                        ]}
                      >
                        {day.short}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {validationErrors.recurrence_days_of_week && (
                  <Text style={styles.errorText}>{validationErrors.recurrence_days_of_week}</Text>
                )}
              </View>
            )}

            {/* Recurrence End Date */}
            {renderFormSection(
              "End Date (Optional)",
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    validationErrors.recurrence_end_date && styles.inputError
                  ]}
                  onPress={() => handleDateTimePress("recurrence_end_date")}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons name="calendar-outline" size={16} color="#1C30A4" />
                    <Text
                      style={[
                        styles.dropdownText,
                        { marginLeft: 8 },
                        !formData.recurrence_end_date && styles.placeholderText,
                      ]}
                    >
                      {formData.recurrence_end_date ? formatDateTime(formData.recurrence_end_date) : "Select end date (optional)"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                {validationErrors.recurrence_end_date && (
                  <Text style={styles.errorText}>{validationErrors.recurrence_end_date}</Text>
                )}
              </View>
            )}
          </>
        )}

        {/* Tag Selection */}
        {renderFormSection(
          "Tag (Optional)",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTagModal(true)}
            >
              <View style={styles.dropdownContent}>
                {selectedTag ? (
                  <>
                    <View style={[styles.tagColorDot, { backgroundColor: selectedTag.color }]} />
                    <Text style={[styles.dropdownText, { marginLeft: 8 }]}>
                      {selectedTag.name}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="pricetag-outline" size={16} color="#1C30A4" />
                    <Text style={[styles.dropdownText, styles.placeholderText, { marginLeft: 8 }]}>
                      Select tag (optional)
                    </Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Notification Methods */}
        {renderFormSection(
          "Notification Methods",
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>How would you like to be notified?</Text>
            <View style={styles.notificationMethodsContainer}>
              {notificationMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.notificationMethodButton,
                    formData.notification_methods.includes(method.id) && styles.selectedNotificationMethod,
                  ]}
                  onPress={() => handleNotificationMethodToggle(method)}
                >
                  <Ionicons
                    name={method.icon}
                    size={16}
                    color={formData.notification_methods.includes(method.id) ? "#fff" : "#1C30A4"}
                  />
                  <Text
                    style={[
                      styles.notificationMethodText,
                      formData.notification_methods.includes(method.id) && styles.selectedNotificationMethodText,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors.notification_methods && (
              <Text style={styles.errorText}>{validationErrors.notification_methods}</Text>
            )}
          </View>
        )}

        {/* Advance Notification */}
        {renderFormSection(
          "Advance Notification",
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notify me before the reminder time</Text>
            <View style={styles.advanceNotificationContainer}>
              {advanceNotificationOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.advanceNotificationButton,
                    formData.advance_notification_minutes === option.value && styles.selectedAdvanceNotification,
                  ]}
                  onPress={() => handleInputChange("advance_notification_minutes", option.value)}
                >
                  <Text
                    style={[
                      styles.advanceNotificationText,
                      formData.advance_notification_minutes === option.value && styles.selectedAdvanceNotificationText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              createReminderMutation.isLoading && styles.disabledButton
            ]}
            onPress={handleCreateReminder}
            disabled={createReminderMutation.isLoading}
          >
            <Text style={styles.createButtonText}>
              {createReminderMutation.isLoading ? "Creating..." : "Create Reminder"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tags Modal */}
      <TagsSelectorModal
        visible={showTagModal}
        onClose={() => setShowTagModal(false)}
        selectedTags={selectedTag ? [selectedTag] : []}
        onTagsChange={handleTagSelect}
        title="Select Reminder Tag"
      />

      {/* Date/Time Picker Modal */}
      <Modal
        visible={showDateTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <Text style={styles.modalSubtitle}>
                {getCurrentSelectionStep()}
              </Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, activeSelector === "date" && styles.activeDot]} />
              <View style={[styles.progressDot, activeSelector === "time" && styles.activeDot]} />
            </View>

            {/* Selected Values Display */}
            <View style={styles.selectedValuesContainer}>
              <View style={styles.selectedValue}>
                <Text style={styles.selectedValueLabel}>Date</Text>
                <Text style={styles.selectedValueText}>
                  {selectedDate.day && selectedDate.month && selectedDate.year
                    ? `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`
                    : "--/--/----"}
                </Text>
              </View>
              <View style={styles.selectedValue}>
                <Text style={styles.selectedValueLabel}>Time</Text>
                <Text style={styles.selectedValueText}>
                  {selectedTime.hour && selectedTime.minute !== null && selectedTime.period
                    ? `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`
                    : "--:-- --"}
                </Text>
              </View>
            </View>

            {/* Date/Time Selector */}
            <View style={styles.dateTimePickerContainer}>
              <FlatList
                data={getCurrentData()}
                renderItem={renderDateTimeItem}
                keyExtractor={(item) => item.value}
                style={styles.dateTimeList}
                showsVerticalScrollIndicator={false}
                numColumns={
                  activeSelector === "date" 
                    ? (selectedDate.day === null ? 7 : selectedDate.month === null ? 3 : 4)
                    : (selectedTime.hour === null ? 4 : selectedTime.minute === null ? 6 : 2)
                }
                key={`${activeSelector}-${selectedDate.day}-${selectedDate.month}-${selectedTime.hour}-${selectedTime.minute}`}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDateTimeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isDateTimeComplete() && styles.disabledButton,
                ]}
                onPress={handleDateTimeSelect}
                disabled={!isDateTimeComplete()}
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
    marginBottom: 8,
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
    height: 60,
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
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  reminderTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  reminderTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedReminderType: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  reminderTypeText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 8,
  },
  selectedReminderTypeText: {
    color: "#fff",
  },
  recurrencePatternContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recurrencePatternButton: {
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
  selectedRecurrencePattern: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  recurrencePatternText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 6,
  },
  selectedRecurrencePatternText: {
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
  notificationMethodsContainer: {
    gap: 8,
  },
  notificationMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedNotificationMethod: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  notificationMethodText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 8,
  },
  selectedNotificationMethodText: {
    color: "#fff",
  },
  advanceNotificationContainer: {
    gap: 8,
  },
  advanceNotificationButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedAdvanceNotification: {
    backgroundColor: "#1C30A4",
    borderColor: "#1C30A4",
  },
  advanceNotificationText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedAdvanceNotificationText: {
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
  dateTimePickerContainer: {
    marginBottom: 20,
    height: 200,
  },
  dateTimeList: {
    flex: 1,
  },
  dateTimeItem: {
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
  selectedDateTimeItem: {
    backgroundColor: "#1C30A4",
  },
  dateTimeItemText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  selectedDateTimeItemText: {
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
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateReminder;