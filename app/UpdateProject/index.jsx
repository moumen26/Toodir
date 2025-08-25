import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useProject, useUpdateProject } from "../hooks/useProjectQueries";
import { useAuthStatus } from "../hooks/useAuth";
import TagsSelectorModal from "../components/TagsSelectorModal";
import ImagePickerComponent from "../components/ImagePickerComponent";
import ProjectUpdateSkeleton from "../components/ProjectUpdateSkeleton";
import Constants from 'expo-constants';

const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const UpdateProject = () => {
  const { projectId } = useLocalSearchParams();
  const { user } = useAuthStatus();
  
  // Simplified animation - start visible
  const fadeAnim = new Animated.Value(1);

  // Fetch project data
  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProject(projectId);

  const updateProjectMutation = useUpdateProject();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    start_date: "",
    end_date: "",
    tags: [],
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);

  const project = projectData?.data;
  const isOwner = user?.id === project?.owner_id;

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      const initialData = {
        title: project.title || "",
        description: project.description || "",
        priority: project.priority || "low",
        start_date: project.start_date ? project.start_date.split('T')[0] : "",
        end_date: project.end_date ? project.end_date.split('T')[0] : "",
        tags: project.tags || [],
        images: [], // New images to upload (existing images are handled separately)
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [project]);

  // Check if form is dirty
  useEffect(() => {
    if (!originalFormData) return;
    
    const isDirty = Object.keys(formData).some(key => {
      if (key === 'tags') {
        return JSON.stringify(formData[key]) !== JSON.stringify(originalFormData[key]);
      }
      if (key === 'images') {
        return formData[key].length > 0; // New images added
      }
      return formData[key] !== originalFormData[key];
    });
    
    setIsFormDirty(isDirty);
  }, [formData, originalFormData]);

  const handleBack = useCallback(() => {
    if (isFormDirty) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [isFormDirty]);

  const handleInputChange = useCallback((field, value) => {
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
  }, [errors]);

  const validateForm = useCallback(() => {
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
  }, [formData]);

  const handleUpdateProject = useCallback(async () => {
    if (!validateForm()) return;
    if (!isFormDirty) {
      Alert.alert("No Changes", "No changes were made to update.");
      return;
    }

    try {
      const projectUpdateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        priority: formData.priority,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        tags: formData.tags.map(tag => tag.id),
        images: formData.images, // New images only
      };

      // Remove null/empty fields except for arrays
      Object.keys(projectUpdateData).forEach(key => {
        if (projectUpdateData[key] === null || projectUpdateData[key] === '') {
          if (!['tags', 'images'].includes(key)) {
            delete projectUpdateData[key];
          }
        }
        // Remove empty arrays for tags only (keep empty images array)
        if (key === 'tags' && Array.isArray(projectUpdateData[key]) && projectUpdateData[key].length === 0) {
          delete projectUpdateData[key];
        }
      });

      await updateProjectMutation.mutateAsync({
        projectId,
        projectData: projectUpdateData,
      });
      
      Alert.alert(
        "Success!",
        "Project updated successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setIsFormDirty(false);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Update project error:', error);
      Alert.alert(
        "Error",
        error.message || "Failed to update project. Please try again.",
        [{ text: "OK" }]
      );
    }
  }, [validateForm, isFormDirty, formData, projectId, updateProjectMutation]);

  const priorities = useMemo(() => [
    { id: 'low', name: 'Low', color: '#10B981', icon: 'flag' },
    { id: 'medium', name: 'Medium', color: '#F59E0B', icon: 'flag' },
    { id: 'high', name: 'High', color: '#EF4444', icon: 'flag' },
  ], []);

  const renderFormSection = useCallback((title, children, isRequired = false) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>
        {title}
        {isRequired && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      {children}
    </View>
  ), []);

  const renderSelectedTags = useCallback(() => {
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
  }, [formData.tags, handleInputChange]);

  const renderExistingImages = useCallback(() => {
    if (!project?.images || project.images.length === 0) return null;

    return (
      <View style={styles.existingImagesContainer}>
        <Text style={styles.existingImagesTitle}>Current Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {project.images.map((image, index) => (
            <View key={image.id || index} style={styles.existingImageContainer}>
              <Image 
                source={{ uri: `${FILES_URL}${image.image_url}` }} 
                style={styles.existingImage} 
              />
              {image.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <Text style={styles.imageHelpText}>
          Add new images below to update project gallery
        </Text>
      </View>
    );
  }, [project?.images]);

  // Loading state
  if (isProjectLoading) {
    return <ProjectUpdateSkeleton />;
  }

  // Error state
  if (projectError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load project</Text>
          <Text style={styles.errorText}>
            {projectError.message || "Something went wrong"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchProject}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Not found or not owner
  if (!project || !isOwner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            {!project ? "Project not found" : "You don't have permission to edit this project"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - No animation to avoid issues */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Update Project</Text>
          <Text style={styles.headerSubtitle}>{project.title}</Text>
        </View>
        <View style={styles.headerRight}>
          {isFormDirty && <View style={styles.dirtyIndicator} />}
        </View>
      </View>

      {/* Content - Simplified without problematic animations */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
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

        {/* Current Images */}
        {renderExistingImages()}

        {/* Add New Images */}
        {renderFormSection(
          "Add New Images",
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

        {/* Update Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isFormDirty || updateProjectMutation.isPending) && styles.disabledButton,
            ]}
            onPress={handleUpdateProject}
            disabled={!isFormDirty || updateProjectMutation.isPending}
          >
            {updateProjectMutation.isPending ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.updateButtonText}>Updating...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.updateButtonText}>Update Project</Text>
              </>
            )}
          </TouchableOpacity>
          
          {!isFormDirty && (
            <Text style={styles.noChangesText}>Make changes to enable update</Text>
          )}
        </View>
      </ScrollView>

      {/* Tags Modal */}
      <TagsSelectorModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        selectedTags={formData.tags}
        onTagsChange={(tags) => handleInputChange('tags', tags)}
        title="Update Project Tags"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#1C30A4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  dirtyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20, // Add some top padding
  },
  formSection: {
    marginBottom: 24, // Increased spacing
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
  existingImagesContainer: {
    marginBottom: 24,
  },
  existingImagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  existingImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  existingImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  primaryBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#1C30A4",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  imageHelpText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  dateContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    paddingTop: 32,
    paddingBottom: 20,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#1C30A4",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#1C30A4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  noChangesText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default UpdateProject;