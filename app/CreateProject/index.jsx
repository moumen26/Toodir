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
import { useCreateProject } from "../hooks/useProjects";
import { useAuthStatus } from "../hooks/useAuth";

const CreateProject = () => {
  const { user } = useAuthStatus();
  const createProjectMutation = useCreateProject();

  const [formData, setFormData] = useState({
    title: "",
    cover: null,
    description: "",
    tag: "",
    icon: "",
    members: [],
    priority: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    attachments: [],
  });

  // Mock uploaded files for demonstration
  const [mockFiles] = useState([
    {
      id: 1,
      name: "Project_Requirements.pdf",
      size: 2456789,
      type: "application/pdf",
    },
    {
      id: 2,
      name: "Design_Mockups.sketch",
      size: 8945612,
      type: "application/sketch",
    },
    {
      id: 3,
      name: "API_Documentation.docx",
      size: 1234567,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ]);

  // Mock cover image for demonstration
  const [mockCoverImage] = useState({
    uri: "https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    width: 1632,
    height: 918,
  });

  const [attachmentType, setAttachmentType] = useState("file");
  const [showMockFiles, setShowMockFiles] = useState(false);
  const [showMockCover, setShowMockCover] = useState(false);

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
  const [activeTimeSelector, setActiveTimeSelector] = useState("hour");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // Optional sections visibility
  const [showDateSection, setShowDateSection] = useState(false);
  const [showTimeSection, setShowTimeSection] = useState(false);

  // Selection modals states
  const [showTagModal, setShowTagModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Sample options data
  const projectTags = [
    { id: 1, name: "Web Development", color: "#3B82F6", icon: "code-slash" },
    { id: 2, name: "Mobile App", color: "#10B981", icon: "phone-portrait" },
    { id: 3, name: "UI/UX Design", color: "#8B5CF6", icon: "color-palette" },
    { id: 4, name: "Backend", color: "#EF4444", icon: "server" },
    { id: 5, name: "DevOps", color: "#F59E0B", icon: "cloud" },
    { id: 6, name: "Marketing", color: "#EC4899", icon: "trending-up" },
  ];

  const projectIcons = [
    { id: 1, name: "code-slash", label: "Code" },
    { id: 2, name: "phone-portrait", label: "Mobile" },
    { id: 3, name: "color-palette", label: "Design" },
    { id: 4, name: "server", label: "Server" },
    { id: 5, name: "cloud", label: "Cloud" },
    { id: 6, name: "trending-up", label: "Analytics" },
    { id: 7, name: "briefcase", label: "Business" },
    { id: 8, name: "bulb", label: "Innovation" },
    { id: 9, name: "rocket", label: "Launch" },
    { id: 10, name: "shield", label: "Security" },
    { id: 11, name: "layers", label: "Architecture" },
    { id: 12, name: "globe", label: "Global" },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      role: "Lead Developer",
      email: "john@company.com",
      avatar: null,
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "UI/UX Designer",
      email: "jane@company.com",
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Backend Developer",
      email: "mike@company.com",
      avatar: null,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      role: "QA Tester",
      email: "sarah@company.com",
      avatar: null,
    },
    {
      id: 5,
      name: "Alex Chen",
      role: "DevOps Engineer",
      email: "alex@company.com",
      avatar: null,
    },
    {
      id: 6,
      name: "Emma Davis",
      role: "Product Manager",
      email: "emma@company.com",
      avatar: null,
    },
  ];

  const priorities = [
    { id: 1, name: "Low", color: "#10B981", icon: "flag" },
    { id: 2, name: "Medium", color: "#F59E0B", icon: "flag" },
    { id: 3, name: "High", color: "#EF4444", icon: "flag" },
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

  // Mock file upload handlers
  const handleAttachmentUpload = () => {
    Alert.alert(
      "Demo Mode",
      "File upload functionality will work when you install expo-document-picker. For now, showing mock files.",
      [
        {
          text: "Show Mock Files",
          onPress: () => {
            setShowMockFiles(true);
            handleInputChange("attachments", mockFiles);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleCoverImagePicker = () => {
    Alert.alert(
      "Demo Mode",
      "Image picker functionality will work when you install expo-image-picker. For now, showing mock cover image.",
      [
        {
          text: "Show Mock Cover",
          onPress: () => {
            setShowMockCover(true);
            handleInputChange("cover", mockCoverImage);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const removeAttachment = (attachmentId) => {
    const updatedAttachments = formData.attachments.filter(
      (att) => att.id !== attachmentId
    );
    handleInputChange("attachments", updatedAttachments);
    if (updatedAttachments.length === 0) {
      setShowMockFiles(false);
    }
  };

  const removeCoverImage = () => {
    handleInputChange("cover", null);
    setShowMockCover(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes("image")) return "image";
    if (type?.includes("pdf")) return "document-text";
    if (type?.includes("video")) return "videocam";
    if (type?.includes("audio")) return "musical-notes";
    if (type?.includes("word") || type?.includes("doc")) return "document-text";
    if (type?.includes("excel") || type?.includes("sheet")) return "grid";
    if (type?.includes("powerpoint") || type?.includes("presentation"))
      return "easel";
    if (type?.includes("sketch")) return "color-palette";
    return "document";
  };

  const handleCreateProject = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Project title is required");
      return;
    }

    try {
      // Prepare project data for API
      const projectData = {
        title: formData.title.trim() || null,
        description: formData.description?.trim() || null,
        priority: formData.priority?.toLowerCase() || 'low',
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        members: selectedMembers.map(member => member.id) || null,
        attachments: formData.attachments || []
      };

      // Handle tag selection
      if (formData.tag) {
        const selectedTag = projectTags.find(tag => tag.name === formData.tag);
        if (selectedTag) {
          projectData.tag = selectedTag.id;
        }
      }

      await createProjectMutation.mutateAsync({
        projectData,
        images: projectData.attachments || []
      });

      Alert.alert(
        "Success", 
        "Project created successfully!",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.log('Error creating project:', error);
      Alert.alert(
        "Error", 
        error.message || "Failed to create project. Please try again."
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
  const handleTagSelect = (tag) => {
    handleInputChange("tag", tag.name);
    setShowTagModal(false);
  };

  const handleIconSelect = (icon) => {
    handleInputChange("icon", icon.name);
    setShowIconModal(false);
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

  // Filter members based on search query
  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

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
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
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
        <Text style={styles.headerTitle}>New Project</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Attachment Section */}
        <View style={styles.attachmentSection}>
          <Text style={styles.sectionTitle}>Attachment</Text>
          <View style={styles.attachmentContainer}>
            <TouchableOpacity
              style={styles.attachmentBox}
              onPress={handleAttachmentUpload}
            >
              <View style={styles.attachmentIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={32}
                  color="#1C30A4"
                />
              </View>
              <Text style={styles.attachmentText}>Upload project files</Text>
              <Text style={styles.attachmentSubtext}>
                Tap to select files (Demo)
              </Text>
            </TouchableOpacity>

            {/* Display uploaded files */}
            {showMockFiles && formData.attachments.length > 0 && (
              <View style={styles.uploadedFilesContainer}>
                <Text style={styles.uploadedFilesTitle}>Uploaded Files:</Text>
                {formData.attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <View style={styles.fileIconContainer}>
                        <Ionicons
                          name={getFileIcon(attachment.type)}
                          size={20}
                          color="#1C30A4"
                        />
                      </View>
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {formatFileSize(attachment.size)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => removeAttachment(attachment.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Project Title */}
        {renderFormSection(
          "Project Title",
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Project Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Project Cover */}
        {renderFormSection(
          "Project Cover",
          <View style={styles.coverContainer}>
            {showMockCover && formData.cover ? (
              <View style={styles.coverImageContainer}>
                <Image
                  source={{ uri: formData.cover.uri }}
                  style={styles.coverImage}
                />
                <View style={styles.coverImageOverlay}>
                  <TouchableOpacity
                    style={styles.changeCoverButton}
                    onPress={handleCoverImagePicker}
                  >
                    <Ionicons name="camera" size={16} color="#fff" />
                    <Text style={styles.changeCoverText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeCoverButton}
                    onPress={removeCoverImage}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.coverBox}
                onPress={handleCoverImagePicker}
              >
                <View style={styles.coverIcon}>
                  <Ionicons name="image-outline" size={40} color="#1C30A4" />
                </View>
                <Text style={styles.coverText}>Add Cover Image</Text>
                <Text style={styles.coverSubtext}>
                  Tap to select from camera or gallery (Demo)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Project Description */}
        {renderFormSection(
          "Project Description",
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter Project Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Project Tag */}
        {renderFormSection(
          "Project Tag",
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTagModal(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="pricetag-outline" size={16} color="#1C30A4" />
                <Text
                  style={[
                    styles.dropdownText,
                    { marginLeft: 8 },
                    !formData.tag && styles.placeholderText,
                  ]}
                >
                  {formData.tag || "Select Project Tag"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Members */}
        {renderFormSection(
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
                          {member.name}
                        </Text>
                        <Text style={styles.memberCardRole} numberOfLines={1}>
                          {member.role}
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

          {/* Add Date Button */}
          {!showDateSection && (
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowDateSection(true)}
            >
              <View style={styles.addSectionContent}>
                <Ionicons name="calendar-outline" size={20} color="#1C30A4" />
                <View style={styles.addSectionContentCol}>
                  <Text style={styles.addSectionText}>Add Project Dates</Text>
                  <Text style={styles.addSectionSubtext}>
                    Set start and end dates
                  </Text>
                </View>
              </View>
              <Ionicons name="add" size={20} color="#1C30A4" />
            </TouchableOpacity>
          )}

        </View>

        {/* Date Section - Only show when enabled */}
        {showDateSection &&
          renderFormSection(
            "Schedule",
            <View style={styles.dateContainer}>
              <View style={styles.sectionHeaderWithRemove}>
                <Text style={styles.inputLabel}>Project Timeline</Text>
                <TouchableOpacity
                  style={styles.removeSectionButton}
                  onPress={() => {
                    setShowDateSection(false);
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

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              createProjectMutation.isLoading && styles.createButtonDisabled
            ]}
            onPress={handleCreateProject}
            disabled={createProjectMutation.isLoading}
          >
            <Text style={styles.createButtonText}>
              {createProjectMutation.isLoading ? "Creating..." : "Create Project"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

      {/* Project Tag Modal */}
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
            style={styles.dynamicModalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project Tag</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {projectTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
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
                    <Ionicons
                      name={tag.icon}
                      size={20}
                      color={tag.color}
                      style={styles.optionIcon}
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

      {/* Project Icon Modal */}
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
              <Text style={styles.modalTitle}>Select Project Icon</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconGrid}>
                {projectIcons.map((icon) => (
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
                {selectedMembers.length} of {teamMembers.length} selected
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
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.find(
                  (m) => m.id === member.id
                );
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
                      {renderAvatar(member, 40)}
                      <View style={styles.memberDetails}>
                        <Text
                          style={[
                            styles.memberName,
                            isSelected && styles.selectedMemberName,
                          ]}
                        >
                          {member.name}
                        </Text>
                        <Text style={styles.memberRole}>{member.role}</Text>
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
              })}
              {filteredMembers.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={48} color="#D1D5DB" />
                  <Text style={styles.noResultsText}>No members found</Text>
                  <Text style={styles.noResultsSubtext}>
                    Try adjusting your search terms
                  </Text>
                </View>
              )}
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
  demoNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  demoNoticeText: {
    fontSize: 12,
    color: "#1E40AF",
    marginLeft: 8,
    flex: 1,
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
  coverContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  coverBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  coverIcon: {
    marginBottom: 8,
  },
  coverText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  coverSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  coverImageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  coverImageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  changeCoverButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  changeCoverText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  removeCoverButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
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
  createButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
});

export default CreateProject;
