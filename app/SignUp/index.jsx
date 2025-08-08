import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [activeSelector, setActiveSelector] = useState("day"); // 'day', 'month', 'year'

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfilePicture = () => {
    Alert.alert("Profile Picture", "Camera or Gallery option would go here");
  };

  const handleIdVerification = (type) => {
    Alert.alert("ID Verification", `${type} verification would go here`);
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
    setActiveSelector("day");
  };

  const handleDateSelect = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const formattedDate = `${selectedDay.padStart(
        2,
        "0"
      )}/${selectedMonth.padStart(2, "0")}/${selectedYear}`;
      handleInputChange("dateOfBirth", formattedDate);
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

  const handleSignUp = () => {
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    Alert.alert("Success", "Account created successfully!");
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
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => ({
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
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
            <View style={styles.inputWrapper}>
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
                value={formData.fullName}
                onChangeText={(value) => handleInputChange("fullName", value)}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of birth *</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={handleDatePress}
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
                  !formData.dateOfBirth && styles.placeholderText,
                ]}
              >
                {formData.dateOfBirth || "Select your birth date"}
              </Text>
              <Ionicons name="chevron-down-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                placeholder="Enter your Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇩🇿</Text>
                <Text style={styles.countryCodeText}>+213</Text>
              </View>
              <TextInput
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.phoneInput]}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrapper}>
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
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm password *</Text>
            <View style={styles.inputWrapper}>
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
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleSignUp}>
          <Text style={styles.createButtonText}>Create Account</Text>
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
                  key={activeSelector} // Force re-render when selector changes
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
