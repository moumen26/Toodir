import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const Statistics = () => {
  const navigation = useNavigation();

  // Statistics data
  const todayStats = {
    tasks: { completed: 0, total: 8, percentage: 0 },
    projects: { completed: 75, total: 100, percentage: 75 },
    habits: { completed: 100, total: 100, percentage: 100 },
    reminders: { completed: 100, total: 100, percentage: 100 },
  };

  const detailedOptions = [
    {
      id: 1,
      title: "Tasks Statistics",
      icon: "checkmark-circle-outline",
      color: "#3B82F6",
      // action: () => navigation.navigate("TasksStatistics/index"),
    },
    {
      id: 2,
      title: "Projects Statistics",
      icon: "folder-outline",
      color: "#8B5CF6",
      action: () =>
        Alert.alert("Projects Statistics", "View detailed projects analytics"),
    },
    {
      id: 3,
      title: "Habits Statistics",
      icon: "repeat-outline",
      color: "#10B981",
      // action: () => navigation.navigate("HabitsStatistics/index"),
    },
    {
      id: 4,
      title: "Reminders Statistics",
      icon: "time-outline",
      color: "#F59E0B",
      action: () =>
        Alert.alert(
          "Reminders Statistics",
          "View detailed reminders analytics"
        ),
    },
  ];

  const productivity = {
    stepsLeft: 4,
    message: "Just 4 more steps to a productive day - you've got this!",
  };

  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderDetailedOption = (option) => (
    <View key={option.id} style={styles.inputContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={option.action}>
        <View style={styles.dropdownContent}>
          <Ionicons name={option.icon} size={20} color="#6B7280" />
          <Text style={styles.dropdownText}>{option.title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderBarChart = () => {
    const maxHeight = 120;
    const chartData = [
      {
        label: "Tasks",
        value: todayStats.tasks.percentage,
        color: "#3B82F6",
        icon: "checkmark-circle",
      },
      {
        label: "Projects",
        value: todayStats.projects.percentage,
        color: "#8B5CF6",
        icon: "folder",
      },
      {
        label: "Habits",
        value: todayStats.habits.percentage,
        color: "#10B981",
        icon: "repeat",
      },
      {
        label: "Reminders",
        value: todayStats.reminders.percentage,
        color: "#F59E0B",
        icon: "time",
      },
    ];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Daily Summary</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>100%</Text>
              <Text style={styles.yAxisLabel}>75%</Text>
              <Text style={styles.yAxisLabel}>50%</Text>
              <Text style={styles.yAxisLabel}>25%</Text>
              <Text style={styles.yAxisLabel}>0%</Text>
            </View>

            {/* Chart bars */}
            <View style={styles.barsContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.value / 100) * maxHeight,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.barIcon}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Chart legends */}
          <View style={styles.chartLegends}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.value}%</Text>
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderProductivityCard = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>What is left to do</Text>
      <View style={styles.productivityContent}>
        <View style={styles.productivityHeader}>
          <Text style={styles.productivityMessage}>{productivity.message}</Text>
          <View style={styles.productivityIcon}>
            <Text style={styles.productivityEmoji}>✨</Text>
          </View>
        </View>
        <View style={styles.productivitySteps}>
          <Text style={styles.stepsNumber}>{productivity.stepsLeft}</Text>
          <Text style={styles.stepsLabel}>Steps</Text>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Detailed Statistics */}
        {renderFormSection(
          "Detailed Statistics",
          <>{detailedOptions.map(renderDetailedOption)}</>
        )}

        {/* Today's Overview */}
        {renderFormSection("Today's Overview", <>{renderBarChart()}</>)}

        {/* Productivity Section */}
        {renderProductivityCard()}
      </ScrollView>
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
    width: 40,
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
  chartContainer: {
    alignItems: "center",
    paddingTop: 8,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    marginBottom: 16,
  },
  yAxis: {
    height: 140,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 8,
    paddingRight: 4,
    paddingBottom: 25,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    flex: 1,
    justifyContent: "space-around",
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  barBackground: {
    width: 24,
    height: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 12,
    minHeight: 4,
  },
  barIcon: {
    marginTop: 8,
    alignItems: "center",
  },
  chartLegends: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  legendItem: {
    alignItems: "center",
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  legendLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  productivityContent: {
    paddingTop: 4,
  },
  productivityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productivityMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
    marginRight: 12,
  },
  productivityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  productivityEmoji: {
    fontSize: 14,
  },
  productivitySteps: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  stepsNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F59E0B",
    marginRight: 4,
  },
  stepsLabel: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "500",
  },
});

export default Statistics;
