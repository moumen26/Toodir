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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCreateHabit } from "../hooks/useHabitsQueries";
import { useTags } from "../hooks/useTagsQueries";

const CreateHabit = () => {
  const [formData, setFormData] = useState({
    name: "",
    tags: [],
    repetition_count: 1,
    unit: "unit",
    repetition_type: "daily",
    repetition_interval: 1,
    repetition_day_of_week: [],
    reminder_time: "",
    is_active: true,
  });

  // Modal states
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Section visibility
  const [showRepeatSection, setShowRepeatSection] = useState(true);

  // New tag creation
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  // Time picker states
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // API hooks
  const createHabitMutation = useCreateHabit();
  const { data: tagsData, isLoading: tagsLoading } = useTags();

  const availableTags = tagsData?.data || [];

  const units = [
    { id: 1, name: "unit", label: "Times" },
    { id: 2, name: "minute", label: "Minutes" },
    { id: 3, name: "hour", label: "Hours" },
    { id: 4, name: "page", label: "Pages" },
    { id: 5, name: "step", label: "Steps" },
    { id: 6, name: "km", label: "Kilometers" },
    { id: 7, name: "meter", label: "Meters" },
    { id: 8, name: "time", label: "Sessions" },
  ];

  const repeatTypes = [
    { id: 1, type: "daily", label: "Daily", icon: "today" },
    { id: 2, type: "weekly", label: "Weekly", icon: "calendar" },
    { id: 3, type: "monthly", label: "Monthly", icon: "calendar-outline" },
    { id: 4, type: "none", label: "Manual", icon: "hand-left-outline" },
  ];

  const weekDays = [
    { id: 1, short: "Mon", full: "Monday" },
    { id: 2, short: "Tue", full: "Tuesday" },
    { id: 3, short: "Wed", full: "Wednesday" },
    { id: 4, short: "Thu", full: "Thursday" },
    { id: 5, short: "Fri", full: "Friday" },
    { id: 6, short: "Sat", full: "Saturday" },
    { id: 0, short: "Sun", full: "Sunday" },
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

  const convertTo24HourFormat = (time12h) => {
    if (!time12h) return null;
    
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hour24 = parseInt(hours);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleCreateHabit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Habit name is required");
      return;
    }

    if (formData.repetition_type === 'weekly' && formData.repetition_day_of_week.length === 0) {
      Alert.alert("Error", "Please select at least one day for weekly habits");
      return;
    }

    try {
      const habitData = {
        name: formData.name.trim(),
        repetition_count: formData.repetition_count,
        unit: formData.unit,
        repetition_type: formData.repetition_type,
        repetition_interval: formData.repetition_interval,
        repetition_day_of_week: formData.repetition_type === 'weekly' ? formData.repetition_day_of_week : null,
        reminder_time: formData.reminder_time ? convertTo24HourFormat(formData.reminder_time) : null,
        is_active: formData.is_active,
        tags: formData.tags,
      };

      const response = await createHabitMutation.mutateAsync(habitData);
      
      Alert.alert("Success", "Habit created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create habit");
    }
  };

  // Selection handlers
  const handleTagSelect = (tag) => {
    const isSelected = formData.tags.includes(tag.id);
    if (isSelected) {
      handleInputChange("tags", formData.tags.filter(id => id !== tag.id));
    } else {
      handleInputChange("tags", [...formData.tags, tag.id]);
    }
  };

  const handleUnitSelect = (unit) => {
    handleInputChange("unit", unit.name);
    setShowUnitModal(false);
  };

  const handleRepeatTypeSelect = (type) => {
    handleInputChange("repetition_type", type.type);
    handleInputChange("repetition_day_of_week", []); // Reset days when type changes
  };

  const handleWeekDayToggle = (day) => {
    const currentDays = formData.repetition_day_of_week;
    const isSelected = currentDays.includes(day.id);

    if (isSelected) {
      handleInputChange(
        "repetition_day_of_week",
        currentDays.filter((d) => d !== day.id)
      );
    } else {
      handleInputChange("repetition_day_of_week", [...currentDays, day.id]);
    }
  };

  const handleTimeSelect = () => {
    if (selectedHour && selectedMinute !== null) {
      const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      handleInputChange("reminder_time", timeString);
      setShowTimeModal(false);
    }
  };

  const getRepeatSummary = () => {
    const { repetition_type, repetition_interval, repetition_day_of_week } = formData;

    if (!repetition_type || repetition_type === 'none') return "Manual tracking";

    let summary = `Every ${repetition_interval > 1 ? repetition_interval + " " : ""}${repetition_type}`;

    if (repetition_type === "weekly" && repetition_day_of_week.length > 0) {
      const dayNames = repetition_day_of_week
        .map((dayId) => weekDays.find((d) => d.id === dayId)?.short)
        .filter(Boolean);
      summary += ` on ${dayNames.join(", ")}`;
    }

    return summary;
  };

  const getSelectedUnit = () => {
    const unit = units.find(u => u.name === formData.unit);
    return unit ? unit.label : "Times";
  };

  const getSelectedTags = () => {
    return availableTags.filter(tag => formData.tags.includes(tag.id));
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

  if (createHabitMutation.isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1C30A4" />
        <Text style={styles.loadingText}>Creating habit...</Text>
      </SafeAreaView>
    );
  }

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
          "Habit Name *",
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

        {/* Habit Tags */}
        {renderFormSection(
          "Habit Tags",
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
                    getSelectedTags().length === 0 && styles.placeholderText,
                  ]}
                >
                  {getSelectedTags().length > 0 
                    ? `${getSelectedTags().length} tag(s) selected`
                    : "Select Habit Tags"
                  }
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            {getSelectedTags().length > 0 && (
              <View style={styles.selectedTagsContainer}>
                {getSelectedTags().map((tag) => (
                  <View key={tag.id} style={[styles.selectedTag, { borderColor: tag.color }]}>
                    <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
                    <Text style={styles.selectedTagText}>{tag.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleTagSelect(tag)}
                      style={styles.removeTagButton}
                    >
                      <Ionicons name="close" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Repetition Count */}
        {renderFormSection(
          "Target Amount *",
          <View style={styles.repetitionContainer}>
            <View style={[styles.inputContainer, styles.repetitionInput]}>
              <TouchableOpacity style={styles.repetitionButton}>
                <Ionicons name="repeat-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.repetitionTextInput}
                  value={formData.repetition_count.toString()}
                  onChangeText={(value) =>
                    handleInputChange("repetition_count", value)
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
                <Text style={styles.dropdownText}>{getSelectedUnit()}</Text>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Repeat Section */}
        {showRepeatSection &&
          renderFormSection(
            "Repeat Schedule *",
            <View style={styles.repeatContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>How often?</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowRepeatSection(false);
                    handleInputChange("repetition_type", "none");
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
              {formData.repetition_type && formData.repetition_type !== "none" && (
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
                  <Text style={styles.inputLabel}>Repeat on *</Text>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day.id}
                        style={[
                          styles.weekDayButton,
                          formData.repetition_day_of_week.includes(day.id) &&
                            styles.selectedWeekDay,
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                      >
                        <Text
                          style={[
                            styles.weekDayText,
                            formData.repetition_day_of_week.includes(day.id) &&
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
                handleInputChange("repetition_type", "daily");
              }}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="repeat-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Repeat Schedule</Text>
                  <Text style={styles.addSectionSubtext}>
                    Set when to track this habit
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reminder Time */}
        {renderFormSection(
          "Reminder Time",
          <View>
            <Text style={styles.sectionSubtitle}>Get notified to stay on track</Text>
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
                      !formData.reminder_time && styles.placeholderText,
                    ]}
                  >
                    {formData.reminder_time || "Select Time"}
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
            style={[
              styles.createButton,
              (!formData.name.trim() || 
               (formData.repetition_type === 'weekly' && formData.repetition_day_of_week.length === 0)
              ) && styles.disabledButton
            ]}
            onPress={handleCreateHabit}
            disabled={
              !formData.name.trim() || 
              (formData.repetition_type === 'weekly' && formData.repetition_day_of_week.length === 0) ||
              createHabitMutation.isLoading
            }
          >
            {createHabitMutation.isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Habit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Select Habit Tags</Text>
              <Text style={styles.modalSubtitle}>Choose tags to organize your habit</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {tagsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1C30A4" />
                  <Text style={styles.loadingText}>Loading tags...</Text>
                </View>
              ) : (
                availableTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.optionItem,
                      formData.tags.includes(tag.id) && styles.selectedOptionItem,
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
                          formData.tags.includes(tag.id) && styles.selectedOptionText,
                        ]}
                      >
                        {tag.name}
                      </Text>
                    </View>
                    {formData.tags.includes(tag.id) && (
                      <Ionicons name="checkmark" size={20} color="#1C30A4" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowTagModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Done</Text>
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
                    {unit.label}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
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
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedTagText: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 4,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
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
    marginTop: 12,
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
  disabledButton: {
    backgroundColor: "#D1D5DB",
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
    textAlign: "center",
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
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#1C30A4",
    fontWeight: "600",
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cancelModalButton: {
    backgroundColor: "#1C30A4",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  cancelModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
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