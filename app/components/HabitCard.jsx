import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HabitCard = memo(({ 
  habit, 
  onPress, 
  onMarkDone, 
  onMarkSkipped, 
  onUndo,
  isActionLoading = false 
}) => {
  const getHabitProgress = () => {
    return Math.min((habit.current / habit.target) * 100, 100);
  };

  const handleActionPress = () => {
    if (habit.completed) {
      onUndo?.(habit);
    } else if (habit.skipped) {
      onUndo?.(habit);
    } else {
      // Show action menu
      Alert.alert(
        'Update Habit',
        'What would you like to do?',
        [
          { text: 'Mark Done', onPress: () => onMarkDone?.(habit) },
          { text: 'Skip Today', onPress: () => onMarkSkipped?.(habit) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.habitCard, habit.completed && styles.completedHabitCard]}
      onPress={() => onPress?.(habit)}
      activeOpacity={0.7}
    >
      {habit.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
          <Text style={styles.completedBadgeText}>DONE</Text>
        </View>
      )}

      <View style={styles.habitHeader}>
        <View style={styles.habitHeaderLeft}>
          <View style={styles.habitIcon}>
            <View
              style={[
                styles.habitIconBackground,
                { backgroundColor: habit.color + "20" },
              ]}
            >
              <Ionicons name={habit.icon} size={20} color={habit.color} />
            </View>
          </View>
          <View style={styles.habitHeaderInfo}>
            <Text
              style={[
                styles.habitTitle,
                habit.completed && styles.completedHabitTitle,
              ]}
              numberOfLines={2}
            >
              {habit.name}
            </Text>
            <Text style={styles.habitCategory}>{habit.category}</Text>
          </View>
        </View>
        <View style={styles.habitHeaderRight}>
          <View style={styles.habitProgress}>
            <Text style={[styles.progressText, { color: habit.color }]}>
              {habit.current}/{habit.target}
            </Text>
            <Text style={styles.progressLabel}>{habit.unit}</Text>
          </View>
          
          {/* Action Button */}
          <TouchableOpacity
            style={styles.habitActionButton}
            onPress={handleActionPress}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons 
                name={
                  habit.completed 
                    ? "checkmark-circle" 
                    : habit.skipped 
                    ? "close-circle" 
                    : "ellipsis-horizontal"
                } 
                size={18} 
                color={
                  habit.completed 
                    ? "#10B981" 
                    : habit.skipped 
                    ? "#EF4444" 
                    : "#6B7280"
                } 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.habitDescription} numberOfLines={2}>
        {habit.description}
      </Text>

      <View style={styles.habitInfo}>
        <View style={styles.habitInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>{habit.schedule}</Text>
        </View>
        <View style={styles.habitInfoItem}>
          <Ionicons name="trending-up" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>{habit.streak} day streak</Text>
        </View>
        <View style={styles.habitInfoItem}>
          <Ionicons name="locate-outline" size={14} color="#6B7280" />
          <Text style={styles.habitInfoText}>
            {habit.current}/{habit.target} {habit.unit}
          </Text>
        </View>
      </View>

      {habit.tags && habit.tags.length > 0 && (
        <View style={styles.habitTags}>
          {habit.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.habitTag, { borderColor: tag.color }]}>
              <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
              <Text style={styles.habitTagText}>{tag.name}</Text>
            </View>
          ))}
          {habit.tags.length > 3 && (
            <View style={styles.habitTag}>
              <Text style={styles.habitTagText}>+{habit.tags.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.habitProgressBar}>
        <View style={styles.habitProgressInfo}>
          <Text style={styles.habitProgressText}>
            Progress: {Math.round(getHabitProgress())}%
          </Text>
          {habit.skipped && (
            <Text style={styles.skippedText}>Skipped today</Text>
          )}
        </View>
        <View style={styles.habitProgressBarContainer}>
          <View style={styles.habitProgressBackground}>
            <View
              style={[
                styles.habitProgressFill,
                {
                  width: `${getHabitProgress()}%`,
                  backgroundColor: habit.skipped ? "#EF4444" : habit.color,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {!habit.completed && !habit.skipped && (
        <View style={styles.habitFooter}>
          <View style={styles.habitFooterLeft}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: habit.color + "20" },
              ]}
            >
              <View
                style={[styles.categoryDot, { backgroundColor: habit.color }]}
              />
              <Text style={[styles.categoryText, { color: habit.color }]}>
                {habit.category}
              </Text>
            </View>
          </View>
          <View style={styles.habitFooterRight}>
            <Text style={styles.habitTarget}>
              {habit.current}/{habit.target} {habit.unit}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  completedHabitCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  completedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completedBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  habitHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  habitIcon: {
    marginRight: 12,
  },
  habitIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  habitHeaderInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 2,
  },
  completedHabitTitle: {
    color: "#059669",
  },
  habitCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  habitHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitProgress: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  habitActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  habitDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 52,
  },
  habitInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  habitInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  habitInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  habitTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginLeft: 52,
  },
  habitTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  habitTagText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    marginLeft: 4,
  },
  tagColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  habitProgressBar: {
    marginBottom: 16,
    marginLeft: 52,
  },
  habitProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  habitProgressText: {
    fontSize: 12,
    color: "#6B7280",
  },
  skippedText: {
    fontSize: 12,
    color: "#EF4444",
    fontStyle: "italic",
  },
  habitProgressBarContainer: {},
  habitProgressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
  },
  habitProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  habitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  habitFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitTarget: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});

HabitCard.displayName = 'HabitCard';

export default HabitCard;