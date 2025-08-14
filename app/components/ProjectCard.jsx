// components/ProjectCard.jsx
import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatProjectStatus, getStatusColor, getPriorityColor } from '../util/projectUtils';
import Constants from 'expo-constants';

// Get API URL from Expo Constants
const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const ProjectCard = memo(({ project, onPress, onMenuPress }) => {

  const renderAvatar = (member, size = 24) => (
    <View
      key={member.id}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {member.profile_picture ? (
        <Image
          source={{ uri: `${FILES_URL}${member.profile_picture}` }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
      )}
    </View>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const progress = project.progress_percentage || 0;
  const tasksCompleted = project.closed_tasks || 0;
  const totalTasks = project.total_tasks || 0;
  
  return (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => onPress(project)}
      activeOpacity={0.8}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          {project.images && project.images.length > 0 ? (
            <Image
              source={{ uri: `${FILES_URL}${project.images.find(img => img.is_primary)?.image_url || project.images[0].image_url}` }}
              style={styles.projectImage}
            />
          ) : (
            <>
              <View style={styles.projectIconPattern}>
                <View style={[styles.patternLine, styles.patternLine1]} />
                <View style={[styles.patternLine, styles.patternLine2]} />
                <View style={[styles.patternLine, styles.patternLine3]} />
              </View>
              <View style={styles.projectIconBadge}>
                <Ionicons name="folder-outline" size={16} color="#1C30A4" />
              </View>
            </>
          )}
        </View>
        <TouchableOpacity 
          style={styles.projectMenuButton}
          onPress={() => onMenuPress && onMenuPress(project)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {project.title}
      </Text>
      <Text style={styles.projectCategory} numberOfLines={1}>
        {project.category || 'General'}
      </Text>
      <Text style={styles.projectDescription} numberOfLines={2}>
        {project.description || 'No description available'}
      </Text>

      <View style={styles.projectInfo}>
        <View style={styles.projectInfoItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>
            {project.owner?.full_name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.projectInfoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>
            {formatDate(project.end_date)}
          </Text>
        </View>
      </View>

      <View style={styles.projectStats}>
        <View style={styles.projectTeam}>
          <View style={styles.teamAvatars}>
            {project.members?.slice(0, 3).map((member, memberIndex) => (
              <View
                key={member.id}
                style={[
                  styles.teamMember,
                  { marginLeft: memberIndex > 0 ? -8 : 0 },
                ]}
              >
                {renderAvatar(member, 24)}
              </View>
            ))}
            {project.members && project.members.length > 3 && (
              <View
                style={[
                  styles.teamMember,
                  styles.moreMembers,
                  { marginLeft: -8 },
                ]}
              >
                <Text style={styles.moreMembersText}>
                  +{project.members.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.projectBadges}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: getPriorityColor(project.priority) + '20',
              },
            ]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(project.priority) },
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(project.priority) },
              ]}
            >
              {project.priority || 'Low'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.projectProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.tasksText}>
              {tasksCompleted}/{totalTasks} tasks
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(project.status) + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText, 
              { color: getStatusColor(project.status) }
            ]}
          >
            {formatProjectStatus(project.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ProjectCard.displayName = 'ProjectCard';

const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  projectIconPattern: {
    flex: 1,
    padding: 8,
  },
  patternLine: {
    height: 2,
    backgroundColor: '#1C30A4',
    marginVertical: 1,
    borderRadius: 1,
  },
  patternLine1: {
    width: '60%',
  },
  patternLine2: {
    width: '40%',
  },
  patternLine3: {
    width: '80%',
  },
  projectIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
  },
  projectMenuButton: {
    padding: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    lineHeight: 24,
  },
  projectCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectInfo: {
    marginBottom: 16,
  },
  projectInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectTeam: {
    flex: 1,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamMember: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  moreMembers: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  projectBadges: {
    marginLeft: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  projectProgress: {
    flex: 1,
    marginRight: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tasksText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C30A4',
  },
  progressBar: {
    width: '100%',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1C30A4',
    borderRadius: 3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  avatar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
});

export default ProjectCard;