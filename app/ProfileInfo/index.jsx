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
  Image,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

// Import profile image
import profileImg from "../../assets/images/profile.jpg";

const ProfileInfo = () => {
  const navigation = useNavigation();

  // State for form data
  const [formData, setFormData] = useState({
    firstName: "Khaldi",
    lastName: "Abdelmoumen",
    email: "moumenkhaldi26@gmail.com",
    phone: "+213 662 81 26 00",
    bio: "Frontend Developer passionate about creating beautiful and functional user interfaces. Always learning new technologies and best practices.",
    location: "Blida, Algeria",
    website: "https://codebykhaldi",
    linkedin: "linkedin.com/in/moumenkhaldi",
    github: "github.com/moumen26",
    birthDate: "16 May 2002",
    jobTitle: "Frontend Developer",
    company: "TechTitans",
    experience: "5+ years",
    country: "Algeria",
    timezone: "UTC+01:00 (Africa/Algiers)",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  // Data arrays
  const countries = [
    { id: 1, name: "Algeria", code: "DZ", flag: "🇩🇿" },
    { id: 2, name: "France", code: "FR", flag: "🇫🇷" },
    { id: 3, name: "Canada", code: "CA", flag: "🇨🇦" },
    { id: 4, name: "United States", code: "US", flag: "🇺🇸" },
    { id: 5, name: "United Kingdom", code: "GB", flag: "🇬🇧" },
    { id: 6, name: "Germany", code: "DE", flag: "🇩🇪" },
  ];

  const timezones = [
    { id: 1, name: "UTC+01:00 (Africa/Algiers)", value: "UTC+01:00" },
    { id: 2, name: "UTC+00:00 (GMT)", value: "UTC+00:00" },
    { id: 3, name: "UTC-05:00 (EST)", value: "UTC-05:00" },
    { id: 4, name: "UTC-08:00 (PST)", value: "UTC-08:00" },
    { id: 5, name: "UTC+01:00 (CET)", value: "UTC+01:00" },
  ];

  const experienceLevels = [
    { id: 1, name: "0-1 years", value: "0-1 years" },
    { id: 2, name: "1-3 years", value: "1-3 years" },
    { id: 3, name: "3-5 years", value: "3-5 years" },
    { id: 4, name: "5+ years", value: "5+ years" },
    { id: 5, name: "10+ years", value: "10+ years" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    Alert.alert(
      "Save Changes",
      "Your profile information has been updated successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            setIsEditing(false);
            setHasChanges(false);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setIsEditing(false);
              setHasChanges(false);
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Profile Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => Alert.alert("Camera", "Open camera"),
      },
      {
        text: "Choose from Gallery",
        onPress: () => Alert.alert("Gallery", "Open gallery"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCountrySelect = (country) => {
    handleInputChange("country", country.name);
    setShowCountryModal(false);
  };

  const handleTimezoneSelect = (timezone) => {
    handleInputChange("timezone", timezone.name);
    setShowTimezoneModal(false);
  };

  const handleExperienceSelect = (experience) => {
    handleInputChange("experience", experience.value);
    setShowExperienceModal(false);
  };

  const renderAvatar = (size = 100) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={profileImg}
        style={[
          styles.avatarImage,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    </View>
  );

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderInputField = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {options.icon && (
          <Ionicons
            name={options.icon}
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.textInput,
            options.multiline && styles.textAreaInput,
            !isEditing && styles.disabledInput,
          ]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={isEditing}
          multiline={options.multiline || false}
          numberOfLines={options.numberOfLines || 1}
          keyboardType={options.keyboardType || "default"}
          autoCapitalize={options.autoCapitalize || "sentences"}
        />
      </View>
    </View>
  );

  const renderDropdownField = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={options.onPress}
        disabled={!isEditing}
      >
        <View style={styles.dropdownContent}>
          {options.icon && (
            <Ionicons name={options.icon} size={20} color="#6B7280" />
          )}
          <Text
            style={[
              styles.dropdownText,
              !formData[field] && styles.placeholderText,
            ]}
          >
            {formData[field] || placeholder}
          </Text>
        </View>
        {isEditing && (
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Information</Text>
        </View>
        <View style={styles.headerRight}>
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  !hasChanges && styles.disabledSaveButton,
                ]}
                disabled={!hasChanges}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Photo Section */}
        {renderFormSection(
          "Profile Photo",
          <View style={styles.photoContainer}>
            <View style={styles.photoWrapper}>
              {renderAvatar(100)}
              {isEditing && (
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleChangePhoto}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleChangePhoto}
                style={styles.changePhotoTextButton}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Basic Information */}
        {renderFormSection(
          "Basic Information",
          <>
            {renderInputField(
              "First Name",
              "firstName",
              "Enter your first name",
              { icon: "person-outline" }
            )}
            {renderInputField("Last Name", "lastName", "Enter your last name", {
              icon: "person-outline",
            })}
            {renderInputField("Email Address", "email", "Enter your email", {
              icon: "mail-outline",
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}
            {renderInputField(
              "Phone Number",
              "phone",
              "Enter your phone number",
              {
                icon: "call-outline",
                keyboardType: "phone-pad",
              }
            )}
            {renderInputField("Bio", "bio", "Tell us about yourself...", {
              icon: "document-text-outline",
              multiline: true,
              numberOfLines: 4,
            })}
          </>
        )}

        {/* Location & Personal */}
        {renderFormSection(
          "Location & Personal",
          <>
            {renderInputField("Location", "location", "Enter your location", {
              icon: "location-outline",
            })}
            {renderDropdownField("Country", "country", "Select your country", {
              icon: "flag-outline",
              onPress: () => isEditing && setShowCountryModal(true),
            })}
            {renderDropdownField(
              "Timezone",
              "timezone",
              "Select your timezone",
              {
                icon: "time-outline",
                onPress: () => isEditing && setShowTimezoneModal(true),
              }
            )}
            {renderInputField(
              "Birth Date",
              "birthDate",
              "Select your birth date",
              { icon: "calendar-outline" }
            )}
          </>
        )}

        {/* Professional Information */}
        {renderFormSection(
          "Professional Information",
          <>
            {renderInputField("Job Title", "jobTitle", "Enter your job title", {
              icon: "briefcase-outline",
            })}
            {renderInputField("Company", "company", "Enter your company", {
              icon: "business-outline",
            })}
            {renderDropdownField(
              "Experience",
              "experience",
              "Select experience level",
              {
                icon: "school-outline",
                onPress: () => isEditing && setShowExperienceModal(true),
              }
            )}
          </>
        )}

        {/* Social Links */}
        {renderFormSection(
          "Social Links",
          <>
            {renderInputField("Website", "website", "Enter your website URL", {
              icon: "globe-outline",
              keyboardType: "url",
              autoCapitalize: "none",
            })}
            {renderInputField(
              "LinkedIn",
              "linkedin",
              "Enter your LinkedIn profile",
              {
                icon: "logo-linkedin",
                autoCapitalize: "none",
              }
            )}
            {renderInputField("GitHub", "github", "Enter your GitHub profile", {
              icon: "logo-github",
              autoCapitalize: "none",
            })}
          </>
        )}

        {/* Account Status */}
        {renderFormSection(
          "Account Status",
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <View style={styles.statusIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Verified Account</Text>
                <Text style={styles.statusDescription}>
                  Your account has been verified
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  Two-Factor Authentication
                </Text>
                <Text style={styles.statusDescription}>
                  Enhanced security enabled
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIcon}>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Member Since</Text>
                <Text style={styles.statusDescription}>January 2024</Text>
              </View>
            </View>
          </View>
        )}

        {/* Danger Zone */}
        {isEditing &&
          renderFormSection(
            "Danger Zone",
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() =>
                Alert.alert("Delete Account", "This action cannot be undone.")
              }
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          )}
      </ScrollView>

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.id}
                  style={[
                    styles.optionItem,
                    formData.country === country.name &&
                      styles.selectedOptionItem,
                  ]}
                  onPress={() => handleCountrySelect(country)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        formData.country === country.name &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {country.name}
                    </Text>
                  </View>
                  {formData.country === country.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Timezone Modal */}
      <Modal
        visible={showTimezoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimezoneModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimezoneModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {timezones.map((timezone) => (
                <TouchableOpacity
                  key={timezone.id}
                  style={[
                    styles.optionItem,
                    formData.timezone === timezone.name &&
                      styles.selectedOptionItem,
                  ]}
                  onPress={() => handleTimezoneSelect(timezone)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.timezone === timezone.name &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {timezone.name}
                  </Text>
                  {formData.timezone === timezone.name && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowTimezoneModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Experience Modal */}
      <Modal
        visible={showExperienceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExperienceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExperienceModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Experience Level</Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionItem,
                    formData.experience === level.value &&
                      styles.selectedOptionItem,
                  ]}
                  onPress={() => handleExperienceSelect(level)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.experience === level.value &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {level.name}
                  </Text>
                  {formData.experience === level.value && (
                    <Ionicons name="checkmark" size={20} color="#1C30A4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowExperienceModal(false)}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  editButton: {
    backgroundColor: "#1C30A4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disabledSaveButton: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 100,
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
  photoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center",
  },
  photoWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "#10B981",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1C30A4",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  changePhotoTextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: "#1C30A4",
    fontWeight: "500",
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    padding: 0,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  disabledInput: {
    color: "#6B7280",
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
  statusList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statusIcon: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  dangerButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
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
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
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
});

export default ProfileInfo;
