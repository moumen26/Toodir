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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CreateHabit = () => {
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    icon: "",
    repetitionCount: "01",
    unit: "Times",
    repeat: {
      enabled: true,
      type: "daily",
      interval: 1,
      days: [1], // Tuesday selected by default (0=Mon, 1=Tue, etc.)
      endType: "never",
      endAfter: 10,
      endDate: "",
    },
    remindTime: "",
  });

  // Modal states
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Section visibility
  const [showRepeatSection, setShowRepeatSection] = useState(false);

  // New tag creation
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [availableTags, setAvailableTags] = useState([
    { name: "Islamic", color: "#10B981" },
    { name: "Fun", color: "#F59E0B" },
    { name: "Personal Development", color: "#8B5CF6" },
    { name: "Self Care", color: "#EC4899" },
    { name: "Quit Bad Habits", color: "#06B6D4" },
    { name: "Relationships", color: "#EF4444" },
    { name: "Home", color: "#6B7280" },
    { name: "Diet", color: "#84CC16" },
    { name: "Health Care", color: "#3B82F6" },
  ]);

  // Time picker states
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  const tagColors = [
    "#3B82F6", // Blue
    "#374151", // Gray
    "#EF4444", // Red
    "#10B981", // Green
    "#06B6D4", // Cyan
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
  ];

  const habitIcons = [
    { id: 1, name: "medical-outline", label: "Health" },
    { id: 2, name: "fitness-outline", label: "Fitness" },
    { id: 3, name: "book-outline", label: "Reading" },
    { id: 4, name: "moon-outline", label: "Sleep" },
    { id: 5, name: "water-outline", label: "Water" },
    { id: 6, name: "walk-outline", label: "Walking" },
    { id: 7, name: "bicycle-outline", label: "Cycling" },
    { id: 8, name: "barbell-outline", label: "Gym" },
    { id: 9, name: "restaurant-outline", label: "Eating" },
    { id: 10, name: "time-outline", label: "Time" },
    { id: 11, name: "phone-portrait-outline", label: "Phone" },
    { id: 12, name: "musical-notes-outline", label: "Music" },
  ];

  const units = [
    { id: 1, name: "Times" },
    { id: 2, name: "Minutes" },
    { id: 3, name: "Hours" },
    { id: 4, name: "Pages" },
    { id: 5, name: "Cups" },
    { id: 6, name: "Steps" },
  ];

  const repeatTypes = [
    { id: 1, type: "daily", label: "Daily", icon: "today" },
    { id: 2, type: "weekly", label: "Weekly", icon: "calendar" },
    { id: 3, type: "monthly", label: "Monthly", icon: "calendar-outline" },
    { id: 4, type: "one-time", label: "One Time", icon: "calendar-clear" },
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

  // Time data
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

  const handleCreateHabit = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Habit name is required");
      return;
    }

    // Show summary of habit data
    const summary = `
Habit Created Successfully!

Name: ${formData.name}
Tag: ${formData.tag || "No tag selected"}
Icon: ${
      formData.icon
        ? habitIcons.find((i) => i.name === formData.icon)?.label
        : "No icon selected"
    }
Repetition: ${formData.repetitionCount} ${formData.unit}
Repeat: ${getRepeatSummary()}
Remind: ${formData.remindTime || "Not set"}
    `;

    Alert.alert("Habit Summary", summary.trim(), [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  // Selection handlers
  const handleTagSelect = (tag) => {
    handleInputChange("tag", tag.name);
    setShowTagModal(false);
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag = { name: newTagName.trim(), color: newTagColor };
      setAvailableTags((prev) => [...prev, newTag]);
      handleInputChange("tag", newTag.name);
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setShowCreateTagModal(false);
      setShowTagModal(false);
    }
  };

  const handleOpenCreateTag = () => {
    setShowTagModal(false);
    setShowCreateTagModal(true);
  };

  const handleCancelCreateTag = () => {
    setNewTagName("");
    setNewTagColor("#3B82F6");
    setShowCreateTagModal(false);
    setShowTagModal(true);
  };

  const handleIconSelect = (icon) => {
    handleInputChange("icon", icon.name);
    setShowIconModal(false);
  };

  const handleUnitSelect = (unit) => {
    handleInputChange("unit", unit.name);
    setShowUnitModal(false);
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
    const isSelected = currentDays.includes(day.id);

    if (isSelected) {
      handleRepeatChange(
        "days",
        currentDays.filter((d) => d !== day.id)
      );
    } else {
      handleRepeatChange("days", [...currentDays, day.id]);
    }
  };

  const handleTimeSelect = () => {
    if (selectedHour && selectedMinute !== null) {
      const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      handleInputChange("remindTime", timeString);
      setShowTimeModal(false);
    }
  };

  const getRepeatSummary = () => {
    const { enabled, type, interval, days } = formData.repeat;

    if (!enabled || !type) return "No repeat";

    let summary = `Every ${interval > 1 ? interval + " " : ""}${type}`;

    if (type === "weekly" && days.length > 0) {
      const dayNames = days
        .map((dayId) => weekDays.find((d) => d.id === dayId)?.short)
        .filter(Boolean);
      summary += ` on ${dayNames.join(", ")}`;
    }

    return summary;
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
        <Text style={styles.headerTitle}>New Habit</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Habit Name */}
        {renderFormSection(
          "Habit Name",
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Habit Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Habit Tag */}
        {renderFormSection(
          "Habit Tag",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTagModal(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.tag && styles.placeholderText,
                  ]}
                >
                  {formData.tag || "Select the Habit Tag"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Habit Icon */}
        {renderFormSection(
          "Habit Icon",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowIconModal(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="apps-outline" size={20} color="#6B7280" />
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.icon && styles.placeholderText,
                  ]}
                >
                  {formData.icon
                    ? habitIcons.find((i) => i.name === formData.icon)?.label
                    : "Select the Habit Icon"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Repetition Count */}
        {renderFormSection(
          "Repetition Count",
          <View style={styles.repetitionContainer}>
            <View style={[styles.inputContainer, styles.repetitionInput]}>
              <TouchableOpacity style={styles.repetitionButton}>
                <Ionicons name="repeat-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.repetitionTextInput}
                  value={formData.repetitionCount}
                  onChangeText={(value) =>
                    handleInputChange("repetitionCount", value)
                  }
                  keyboardType="numeric"
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, styles.unitInput]}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowUnitModal(true)}
              >
                <Text style={styles.dropdownText}>{formData.unit}</Text>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Repeat Section - Enhanced UI like Create Task */}
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
              {formData.repeat.type && formData.repeat.type !== "one-time" && (
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
                          formData.repeat.days.includes(day.id) &&
                            styles.selectedWeekDay,
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                      >
                        <Text
                          style={[
                            styles.weekDayText,
                            formData.repeat.days.includes(day.id) &&
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

        {/* Add Repeat Button - Only show when section is hidden */}
        {!showRepeatSection && (
          <View style={styles.optionalSectionsContainer}>
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
          </View>
        )}

        {/* Remind */}
        {renderFormSection(
          "Remind",
          <View>
            <Text style={styles.sectionSubtitle}>Remind me at</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTimeModal(true)}
              >
                <View style={styles.dropdownContent}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text
                    style={[
                      styles.dropdownText,
                      !formData.remindTime && styles.placeholderText,
                    ]}
                  >
                    {formData.remindTime || "Select Time"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateHabit}
          >
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* All existing modals remain the same... */}
      {/* Tag Modal */}
      <Modal
        visible={showTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Habit Tag</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Add new tag option */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleOpenCreateTag}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#1C30A4"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.addNewOptionText}>Add a new Tag</Text>
                </View>
              </TouchableOpacity>

              {availableTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    formData.tag === tag.name && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleTagSelect(tag)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.tagColorDot,
                        { backgroundColor: tag.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        formData.tag === tag.name && styles.selectedOptionText,
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </View>
                  {formData.tag === tag.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowTagModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create New Tag Modal */}
      <Modal
        visible={showCreateTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateTagModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCreateTagModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Tag</Text>
              <Text style={styles.modalSubtitle}>Add a new Habit Tag</Text>
            </View>

            <View style={styles.createTagInputContainer}>
              <Text style={styles.inputLabel}>Tag Name</Text>
              <TextInput
                style={styles.createTagTextInput}
                placeholder="Enter tag name"
                value={newTagName}
                onChangeText={setNewTagName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.createTagInputContainer}>
              <Text style={styles.inputLabel}>Tag Color</Text>
              <View style={styles.colorSelection}>
                {tagColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newTagColor === color && styles.selectedColorOption,
                    ]}
                    onPress={() => setNewTagColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelCreateTag}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !newTagName.trim() && styles.disabledButton,
                ]}
                onPress={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
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
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Habit Icon</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconGrid}>
                {habitIcons.map((icon) => (
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

      {/* Unit Modal */}
      <Modal
        visible={showUnitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUnitModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Unit</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.optionItem,
                    formData.unit === unit.name && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleUnitSelect(unit)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.unit === unit.name && styles.selectedOptionText,
                    ]}
                  >
                    {unit.name}
                  </Text>
                  {formData.unit === unit.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowUnitModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Time Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
            </View>

            {/* Time Display */}
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.currentTimeText}>
                {selectedHour} : {selectedMinute} {selectedPeriod}
              </Text>
            </View>

            {/* Scroll Wheels */}
            <View style={styles.scrollWheelsContainer}>
              {/* Hours Wheel */}
              <View style={styles.scrollWheelColumn}>
                <FlatList
                  data={hours}
                  renderItem={(props) =>
                    renderScrollWheelItem(props, selectedHour, (item) =>
                      setSelectedHour(item.value)
                    )
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
                    renderScrollWheelItem(props, selectedMinute, (item) =>
                      setSelectedMinute(item.value)
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
                    renderScrollWheelItem(props, selectedPeriod, (item) =>
                      setSelectedPeriod(item.value)
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
    paddingTop: 10,
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
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
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
    marginBottom: 12,
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
    marginLeft: 12,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  repetitionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  repetitionInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitInput: {
    flex: 1,
    marginBottom: 0,
  },
  repetitionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  repetitionTextInput: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    padding: 0,
    flex: 1,
  },
  // Enhanced Repeat Section Styles (matching CreateTask)
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
  // Add Section Button (matching CreateTask)
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
  // Modal Styles
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
    textAlign: "center",
  },
  selectedIconItemText: {
    color: "#fff",
  },
  cancelModalButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  cancelModalButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  // Modal Buttons
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
  addNewOptionText: {
    fontSize: 16,
    color: "#1C30A4",
    fontWeight: "500",
  },
  createTagInputContainer: {
    marginBottom: 20,
    gap: 12,
  },
  createTagTextInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  colorSelection: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // Time Modal Styles
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
    backgroundColor: "rgba(28, 48, 164, 0.1)",
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
    borderColor: "rgba(28, 48, 164, 0.2)",
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
});

export default CreateHabit;
