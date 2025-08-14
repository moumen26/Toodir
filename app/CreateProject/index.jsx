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
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCreateProject } from "../hooks/useProjectQueries";
import MembersSelectorModal from "../components/MembersSelectorModal";
import TagsSelectorModal from "../components/TagsSelectorModal";
import ImagePickerComponent from "../components/ImagePickerComponent";

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    start_date: "",
    end_date: "",
    members: [],
    tags: [],
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const createProjectMutation = useCreateProject();

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = "Description cannot exceed 5000 characters";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) {
      return;
    }

    try {

      const projectData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        priority: formData.priority || 'low',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        members: formData.members.map(member => member.id),
        tags: formData.tags.map(tag => tag.id),
        images: formData.images,
      };

      // Remove null/empty fields except for arrays which should be empty arrays
      Object.keys(projectData).forEach(key => {
        if (projectData[key] === null || projectData[key] === '') {
          if (!['members', 'tags', 'images'].includes(key)) {
            delete projectData[key];
          }
        }
        // Remove empty arrays for members and tags only (not images)
        if (['members', 'tags'].includes(key) && Array.isArray(projectData[key]) && projectData[key].length === 0) {
          delete projectData[key];
        }
      });

      await createProjectMutation.mutateAsync(projectData);
      
      Alert.alert(
        "Success!",
        "Project created successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log('Create project error:', error);
    }
  };

  const priorities = [
    { id: 'low', name: 'Low', color: '#10B981', icon: 'flag' },
    { id: 'medium', name: 'Medium', color: '#F59E0B', icon: 'flag' },
    { id: 'high', name: 'High', color: '#EF4444', icon: 'flag' },
  ];

  const renderFormSection = (title, children, isRequired = false) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>
        {title}
        {isRequired && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      {children}
    </View>
  );

  const renderSelectedMembers = () => {
    if (formData.members.length === 0) return null;

    return (
      <View style={styles.selectedItemsContainer}>
        <View style={styles.selectedItemsHeader}>
          <Text style={styles.selectedItemsTitle}>
            Selected Members ({formData.members.length})
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowMembersModal(true)}
          >
            <Ionicons name="pencil" size={14} color="#1C30A4" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedScrollView}
        >
          {formData.members.map((member) => (
            <View key={member.id} style={styles.memberChip}>
              <View style={styles.memberAvatar}>
                {member.profile_picture ? (
                  <Image
                    source={{ uri: member.profile_picture }}
                    style={styles.memberAvatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={16} color="#9CA3AF" />
                )}
              </View>
              <Text style={styles.memberChipText} numberOfLines={1}>
                {member.full_name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const updatedMembers = formData.members.filter(m => m.id !== member.id);
                  handleInputChange('members', updatedMembers);
                }}
              >
                <Ionicons name="close" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSelectedTags = () => {
    if (formData.tags.length === 0) return null;

    return (
      <View style={styles.selectedItemsContainer}>
        <View style={styles.selectedItemsHeader}>
          <Text style={styles.selectedItemsTitle}>
            Selected Tags ({formData.tags.length})
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowTagsModal(true)}
          >
            <Ionicons name="pencil" size={14} color="#1C30A4" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {formData.tags.map((tag) => (
            <View
              key={tag.id}
              style={[styles.tagChip, { backgroundColor: tag.color + '20' }]}
            >
              <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
              <Text style={[styles.tagChipText, { color: tag.color }]}>
                {tag.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const updatedTags = formData.tags.filter(t => t.id !== tag.id);
                  handleInputChange('tags', updatedTags);
                }}
              >
                <Ionicons name="close" size={14} color={tag.color} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

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
        {/* Project Title */}
        {renderFormSection(
          "Project Title",
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                errors.title && styles.inputError
              ]}
              placeholder="Enter Project Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholderTextColor="#9CA3AF"
              maxLength={255}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <Text style={styles.characterCount}>
              {formData.title.length}/255
            </Text>
          </View>,
          true
        )}

        {/* Project Description */}
        {renderFormSection(
          "Project Description",
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput, 
                styles.textArea,
                errors.description && styles.inputError
              ]}
              placeholder="Enter Project Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
              maxLength={5000}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            <Text style={styles.characterCount}>
              {formData.description.length}/5000
            </Text>
          </View>
        )}

        {/* Team Members */}
        {renderFormSection(
          "Team Members",
          <View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowMembersModal(true)}
            >
              <View style={styles.selectorContent}>
                <Ionicons name="people-outline" size={20} color="#1C30A4" />
                <Text style={styles.selectorText}>
                  {formData.members.length > 0
                    ? `${formData.members.length} member${formData.members.length > 1 ? 's' : ''} selected`
                    : "Select team members"
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {renderSelectedMembers()}
          </View>
        )}

        {/* Project Tags */}
        {renderFormSection(
          "Project Tags",
          <View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowTagsModal(true)}
            >
              <View style={styles.selectorContent}>
                <Ionicons name="pricetag-outline" size={20} color="#1C30A4" />
                <Text style={styles.selectorText}>
                  {formData.tags.length > 0
                    ? `${formData.tags.length} tag${formData.tags.length > 1 ? 's' : ''} selected`
                    : "Select project tags"
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {renderSelectedTags()}
          </View>
        )}

        {/* Priority */}
        {renderFormSection(
          "Priority",
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityOption,
                  formData.priority === priority.id && styles.selectedPriorityOption,
                  { borderColor: priority.color + '40' }
                ]}
                onPress={() => handleInputChange("priority", priority.id)}
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
                      formData.priority === priority.id && styles.selectedPriorityText,
                    ]}
                  >
                    {priority.name} Priority
                  </Text>
                </View>
                {formData.priority === priority.id && (
                  <Ionicons name="checkmark" size={20} color={priority.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Project Images */}
        {renderFormSection(
          "Project Images",
          <ImagePickerComponent
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
            maxImages={5}
          />
        )}

        {/* Project Timeline */}
        {renderFormSection(
          "Project Timeline",
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.start_date && styles.inputError
                  ]}
                  placeholder="YYYY-MM-DD"
                  value={formData.start_date}
                  onChangeText={(value) => handleInputChange("start_date", value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.start_date && (
                  <Text style={styles.errorText}>{errors.start_date}</Text>
                )}
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.end_date && styles.inputError
                  ]}
                  placeholder="YYYY-MM-DD"
                  value={formData.end_date}
                  onChangeText={(value) => handleInputChange("end_date", value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.end_date && (
                  <Text style={styles.errorText}>{errors.end_date}</Text>
                )}
              </View>
            </View>
            <Text style={styles.helperText}>
              Leave dates empty if not applicable
            </Text>
          </View>
        )}

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              createProjectMutation.isPending && styles.disabledButton,
            ]}
            onPress={handleCreateProject}
            disabled={createProjectMutation.isPending}
          >
            {createProjectMutation.isPending ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.createButtonText}>Creating...</Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>Create Project</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <MembersSelectorModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        selectedMembers={formData.members}
        onMembersChange={(members) => handleInputChange('members', members)}
      />

      <TagsSelectorModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        selectedTags={formData.tags}
        onTagsChange={(tags) => handleInputChange('tags', tags)}
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
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#EF4444",
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
    borderWidth: 0,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  characterCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  selectorButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  selectedItemsContainer: {
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
  selectedItemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedItemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editButtonText: {
    fontSize: 12,
    color: "#1C30A4",
    fontWeight: "500",
    marginLeft: 4,
  },
  selectedScrollView: {
    flexGrow: 0,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 120,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  memberAvatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  memberChipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    marginRight: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 4,
  },
  priorityContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedPriorityOption: {
    backgroundColor: "#EEF2FF",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    fontStyle: "italic",
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
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CreateProject;