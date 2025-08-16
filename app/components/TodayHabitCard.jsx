import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TodayHabitCard = memo(({ habit, onUpdate }) => {
  const progress = (habit.completed_count / habit.repetition_count) * 100;
  
  const handlePress = () => {
    router.push(`/HabitDetails?habitId=${habit.id}`);
  };

  const getStatusColor = () => {
    if (habit.tags?.[0]?.color) return habit.tags?.[0].color;
    return '#E5E7EB';
  };

  const getCardBackgroundColor = () => {
    const primaryTag = habit.tags?.[0];
    if (primaryTag?.color) {
      return primaryTag.color + '10'; // 10% opacity
    }
    return '#fff';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.habitCard, 
        { backgroundColor: getCardBackgroundColor() },
        habit.status === 'completed' && styles.habitCardCompleted
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.habitHeader}>
        <View style={[styles.habitIcon, { backgroundColor: getStatusColor() + "15" }]}>
          <Ionicons 
            name={"flower-outline"} 
            size={20} 
            color={getStatusColor()} 
          />
        </View>
      </View>
      
      <Text style={styles.habitName} numberOfLines={2}>
        {habit.name}
      </Text>
      
      <View style={styles.habitProgress}>
        <View style={styles.habitProgressTrack}>
          <View style={[
            styles.habitProgressFill,
            { width: `${progress}%`, backgroundColor: getStatusColor() }
          ]} />
        </View>
        <Text style={styles.habitProgressText}>
          {habit.completed_count}/{habit.repetition_count} {habit.unit}
        </Text>
      </View>
      
      {habit.tags && habit.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {habit.tags.slice(0, 2).map((tag) => (
            <View 
              key={tag.id} 
              style={[styles.tag, { backgroundColor: tag.color + "20" }]}
            >
              <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
              <Text style={[styles.tagText, { color: tag.color }]} numberOfLines={1}>
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {habit.status === 'completed' && (
        <View style={styles.habitCompletedBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: "#fff",
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 0,
    position: "relative",
    minHeight: 140,
  },
  habitCardCompleted: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#22C55E20",
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statusButton: {
    padding: 4,
  },
  habitName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 18,
  },
  habitProgress: {
    alignItems: "center",
    marginBottom: 8,
  },
  habitProgressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    marginBottom: 6,
  },
  habitProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  habitProgressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    maxWidth: '100%',
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  habitCompletedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TodayHabitCard;