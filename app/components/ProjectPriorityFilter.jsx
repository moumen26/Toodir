// components/ProjectPriorityFilter.jsx
import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProjectPriorityFilter = memo(({ 
  selectedPriority, 
  onPriorityChange,
  projectStats = {},
  totalProjects = 0 
}) => {
  const priorities = [
    {
      id: 'high',
      name: 'High Priority',
      color: '#EF4444',
      icon: 'flame',
      count: projectStats.high || 0,
      gradient: ['#EF4444', '#F87171']
    },
    {
      id: 'medium',
      name: 'Medium Priority',
      color: '#F59E0B',
      icon: 'alert-circle',
      count: projectStats.medium || 0,
      gradient: ['#F59E0B', '#FBBF24']
    },
    {
      id: 'low',
      name: 'Low Priority',
      color: '#10B981',
      icon: 'checkmark-circle',
      count: projectStats.low || 0,
      gradient: ['#10B981', '#34D399']
    },
  ];

  const handlePriorityPress = (priorityId) => {
    onPriorityChange(priorityId);
  };

  const getProgressWidth = (count) => {
    if (totalProjects === 0) return '0%';
    return `${Math.min((count / totalProjects) * 100, 100)}%`;
  };

  const renderPriorityCard = (priority) => {
    const isSelected = selectedPriority === priority.id;
    const isAll = priority.id === '';
    
    return (
      <TouchableOpacity
        key={priority.id}
        style={[
          styles.priorityCard,
          isSelected && styles.selectedPriorityCard,
          { borderColor: priority.color + '30' }
        ]}
        onPress={() => handlePriorityPress(priority.id)}
        activeOpacity={0.8}
      >
        {/* Background Glow Effect for Selected */}
        {isSelected && (
          <View 
            style={[
              styles.selectedGlow,
              { backgroundColor: priority.color + '10' }
            ]} 
          />
        )}

        {/* Card Header */}
        <View style={styles.priorityHeader}>
          <View style={[styles.priorityIconContainer, { backgroundColor: priority.color + '15' }]}>
            <Ionicons 
              name={priority.icon} 
              size={isAll ? 16 : 18} 
              color={priority.color} 
            />
          </View>
          
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: priority.color }]}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>

        {/* Priority Name */}
        <Text 
          style={[
            styles.priorityName,
            isSelected && { color: priority.color }
          ]}
          numberOfLines={1}
        >
          {priority.name}
        </Text>

        {/* Count Display */}
        <View style={styles.countContainer}>
          <Text style={[styles.priorityCount, { color: priority.color }]}>
            {priority.count}
          </Text>
          <Text style={styles.countLabel}>
            {priority.count === 1 ? 'project' : 'projects'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: priority.color + '20' }]}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: getProgressWidth(priority.count),
                  backgroundColor: priority.color
                }
              ]}
            />
          </View>
          <Text style={styles.percentageText}>
            {totalProjects > 0 ? Math.round((priority.count / totalProjects) * 100) : 0}%
          </Text>
        </View>

        {/* Bottom Accent Line */}
        <View 
          style={[
            styles.accentLine,
            { 
              backgroundColor: priority.color,
              opacity: isSelected ? 1 : 0.3
            }
          ]} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Ionicons name="options-outline" size={18} color="#374151" />
          <Text style={styles.sectionTitle}>Filter by Priority</Text>
        </View>
        {selectedPriority && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => handlePriorityPress('')}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {priorities.map(renderPriorityCard)}
      </ScrollView>
    </View>
  );
});

ProjectPriorityFilter.displayName = 'ProjectPriorityFilter';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  scrollView: {
    marginBottom: 0,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  priorityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    width: 140,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPriorityCard: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  selectedGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 18,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityCount: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  countLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBackground: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 2,
  },
  percentageText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
});

export default ProjectPriorityFilter;