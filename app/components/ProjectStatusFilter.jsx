import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProjectStatusFilter = memo(({ 
  selectedFilter, 
  onFilterChange, 
  projectStats = {},
  totalProjects = 0 
}) => {
  const filters = [
    {
      id: 'All',
      name: 'All Projects',
      count: totalProjects,
      color: '#1C30A4',
      icon: 'trending-up',
      type: 'progress'
    },
    {
      id: 'active',
      name: 'In Progress',
      count: projectStats.inProgress || 0,
      color: '#8B5CF6',
      icon: 'time',
      type: 'status'
    },
    {
      id: 'Done',
      name: 'Completed',
      count: projectStats.completed || 0,
      color: '#10B981',
      icon: 'checkmark-circle',
      type: 'status'
    },
  ];

  const handleFilterPress = (filterId) => {
    onFilterChange(filterId === 'All' ? '' : filterId);
  };

  const renderProgressCard = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.progressStatCard,
        selectedFilter === (filter.id === 'All' ? '' : filter.id) && styles.activeFilterCard,
      ]}
      onPress={() => handleFilterPress(filter.id)}
      activeOpacity={0.8}
    >
      <View style={styles.progressCardHeader}>
        <View style={styles.progressIcon}>
          <Ionicons name={filter.icon} size={12} color="#1C30A4" />
        </View>
        <Text style={styles.progressCardTitle}>{filter.name}</Text>
      </View>
      <Text style={styles.progressCardNumber}>
        {filter.id === 'All' 
          ? `${Math.round((projectStats.avgProgress || 0))}%`
          : filter.count
        }
      </Text>
      <View style={styles.progressCardBar}>
        <View style={styles.progressCardBackground}>
          <View
            style={[
              styles.progressCardFill,
              {
                width: filter.id === 'All' 
                  ? `${Math.round((projectStats.avgProgress || 0))}%`
                  : `${totalProjects > 0 ? (filter.count / totalProjects) * 100 : 0}%`,
              },
            ]}
          />
        </View>
      </View>
      <Text style={styles.progressCardSubtext}>
        {filter.id === 'All' ? 'Avg Progress' : 'Projects'}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusCard = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.statCard,
        { 
          backgroundColor: filter.color + '15', 
          borderColor: filter.color + '40' 
        },
        selectedFilter === filter.id && styles.activeFilterCard,
      ]}
      onPress={() => handleFilterPress(filter.id)}
      activeOpacity={0.8}
    >
      <View style={styles.statCardHeader}>
        <View
          style={[styles.statCardIcon, { backgroundColor: filter.color }]}
        >
          <Ionicons name={filter.icon} size={10} color="#fff" />
        </View>
        <View style={styles.statCardTrend}>
          <Ionicons 
            name={filter.count > 0 ? "arrow-up" : "remove"} 
            size={8} 
            color={filter.color} 
          />
        </View>
      </View>
      <Text style={[styles.statCardNumber, { color: filter.color }]}>
        {filter.count}
      </Text>
      <Text style={styles.statCardLabel}>{filter.name}</Text>
      <View style={styles.statCardProgress}>
        <View
          style={[
            styles.statCardProgressBg,
            { backgroundColor: filter.color + '30' },
          ]}
        >
          <View
            style={[
              styles.statCardProgressFill,
              {
                width: `${totalProjects > 0 ? (filter.count / totalProjects) * 100 : 0}%`,
                backgroundColor: filter.color,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Filter Projects</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {filters.map((filter) => 
          filter.type === 'progress' 
            ? renderProgressCard(filter)
            : renderStatusCard(filter)
        )}
      </ScrollView>
    </View>
  );
});

ProjectStatusFilter.displayName = 'ProjectStatusFilter';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  scrollView: {
    marginBottom: 0,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  progressStatCard: {
    backgroundColor: '#1C30A4',
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    width: 110,
    shadowColor: '#1C30A4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeFilterCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  progressCardTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  progressCardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  progressCardBar: {
    marginBottom: 4,
  },
  progressCardBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  progressCardFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  progressCardSubtext: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    width: 80,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardTrend: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  statCardProgress: {
    marginTop: 'auto',
  },
  statCardProgressBg: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  statCardProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
});

export default ProjectStatusFilter;