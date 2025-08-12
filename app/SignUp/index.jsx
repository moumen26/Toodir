import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRegister } from "../hooks/useAuth";
import { PublicRoute } from "../components/ProtectedRoute";
import { VALIDATION_PATTERNS } from "../constants/storage";

const SignUp = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [activeSelector, setActiveSelector] = useState("day");
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();
  const { register, isLoading, error } = useRegister();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    // Birth date validation
    if (!formData.birth_date) {
      errors.birth_date = "Birth date is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!VALIDATION_PATTERNS.EMAIL.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided must be valid)
    if (formData.phone.trim() && !VALIDATION_PATTERNS.PHONE.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!VALIDATION_PATTERNS.PASSWORD.test(formData.password)) {
      errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare data for API
    const registrationData = {
      full_name: formData.full_name.trim(),
      birth_date: formData.birth_date,
      email: formData.email.trim().toLowerCase(),
      phone: `+213${formData.phone.trim()}` || null,
      password: formData.password,
    };

    try {
      const result = await register(registrationData);
      
      if (result.success) {
        Alert.alert(
          "Registration Successful", 
          result.message || "Account created successfully! Please sign in to continue.",
          [
            {
              text: "Sign In",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Registration Failed", result.error);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePicture = () => {
    Alert.alert("Profile Picture", "Camera or Gallery option would go here");
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
    setActiveSelector("day");
  };

  const handleDateSelect = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const formattedDate = `${selectedYear}-${selectedMonth.padStart(2, "0")}-${selectedDay.padStart(2, "0")}`;
      handleInputChange("birth_date", formattedDate);
    }
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const selectValue = (value) => {
    if (activeSelector === "day") {
      setSelectedDay(value);
      setActiveSelector("month");
    } else if (activeSelector === "month") {
      setSelectedMonth(value);
      setActiveSelector("year");
    } else if (activeSelector === "year") {
      setSelectedYear(value);
    }
  };

  // Generate arrays for date picker
  const days = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));
  
  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1924 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: (currentYear - i).toString(),
  }));

  const getCurrentData = () => {
    if (activeSelector === "day") return days;
    if (activeSelector === "month") return months;
    return years;
  };

  const getCurrentValue = () => {
    if (activeSelector === "day") return selectedDay;
    if (activeSelector === "month") return selectedMonth;
    return selectedYear;
  };

  const renderDateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        getCurrentValue() === item.value && styles.selectedDateItem,
      ]}
      onPress={() => selectValue(item.value)}
    >
      <Text
        style={[
          styles.dateItemText,
          getCurrentValue() === item.value && styles.selectedDateItemText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const isFormValid = 
    !isLoading && 
    !isSubmitting;

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={navigation.goBack}
              disabled={isLoading || isSubmitting}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Create your TooDir account</Text>
            <Text style={styles.subtitle}>
              Start organizing tasks, tracking habits, and staying focused.
            </Text>

            {/* Profile Picture */}
            <View style={styles.profileSection}>
              <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture}>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                </View>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleProfilePicture}
                  disabled={isLoading || isSubmitting}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={[
                  styles.inputWrapper,
                  validationErrors.full_name && styles.inputError
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChangeText={(value) => handleInputChange("full_name", value)}
                    editable={!isLoading && !isSubmitting}
                  />
                </View>
                {validationErrors.full_name ? (
                  <Text style={styles.errorText}>{validationErrors.full_name}</Text>
                ) : null}
              </View>

              {/* Date of Birth */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of birth *</Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    validationErrors.birth_date && styles.inputError
                  ]}
                  onPress={handleDatePress}
                  disabled={isLoading || isSubmitting}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.input,
                      styles.dateText,
                      !formData.birth_date && styles.placeholderText,
                    ]}
                  >
                    {formatDisplayDate(formData.birth_date) || "Select your birth date"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {validationErrors.birth_date ? (
                  <Text style={styles.errorText}>{validationErrors.birth_date}</Text>
                ) : null}
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <View style={[
                  styles.inputWrapper,
                  validationErrors.email && styles.inputError
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading && !isSubmitting}
                  />
                </View>
                {validationErrors.email ? (
                  <Text style={styles.errorText}>{validationErrors.email}</Text>
                ) : null}
              </View>

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[
                  styles.inputWrapper,
                  validationErrors.phone && styles.inputError
                ]}>
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇩🇿</Text>
                    <Text style={styles.countryCodeText}>+213</Text>
                  </View>
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, styles.phoneInput]}
                    placeholder="(∅) 7X-XXX-XXXX"
                    value={formData.phone}
                    onChangeText={(value) => {
                      // if start with 0 delete it
                      if (value.startsWith("0")) {
                        value = value.slice(1);
                      }
                      handleInputChange("phone", value);
                    }}
                    keyboardType="phone-pad"
                    editable={!isLoading && !isSubmitting}
                  />
                </View>
                {validationErrors.phone ? (
                  <Text style={styles.errorText}>{validationErrors.phone}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <View style={[
                  styles.inputWrapper,
                  validationErrors.password && styles.inputError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    placeholder="Create password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange("password", value)}
                    secureTextEntry={!showPassword}
                    editable={!isLoading && !isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSubmitting}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {validationErrors.password ? (
                  <Text style={styles.errorText}>{validationErrors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm password *</Text>
                <View style={[
                  styles.inputWrapper,
                  validationErrors.confirmPassword && styles.inputError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleInputChange("confirmPassword", value)
                    }
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading && !isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || isSubmitting}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {validationErrors.confirmPassword ? (
                  <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
                ) : null}
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                (!isFormValid || isLoading || isSubmitting) && styles.buttonDisabled
              ]} 
              onPress={handleSignUp}
              disabled={!isFormValid || isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.createButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

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
                    <Text style={styles.modalTitle}>Select Date of Birth</Text>
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
                      data={getCurrentData()}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C30A4",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 30,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePictureContainer: {
    position: "relative",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1C30A4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  formContainer: {
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  phoneInput: {
    marginLeft: 10,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  flag: {
    fontSize: 16,
    marginRight: 5,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#000",
  },
  eyeButton: {
    padding: 5,
  },
  dateText: {
    paddingVertical: 0,
    color: "#000",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  createButton: {
    backgroundColor: "#1C30A4",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SignUp;
