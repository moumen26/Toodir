import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Get API URL from Expo Constants
const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const UserCard = ({ 
  user, 
  onPress, 
  subtitle,
  rightContent,
  showCheckbox = false,
  isSelected = false,
  disabled = false,
  style
}) => {
  const renderAvatar = (size = 40) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {user?.profile_picture ? (
        <Image
          source={{ uri: `${FILES_URL}${user.profile_picture}` }}
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

  const renderCheckbox = () => {
    if (!showCheckbox) return null;
    
    return (
      <View style={[
        styles.checkbox,
        isSelected && styles.checkboxSelected,
        disabled && styles.checkboxDisabled
      ]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </View>
    );
  };

  const content = (
    <View style={[
      styles.container,
      disabled && styles.containerDisabled,
      style
    ]}>
      <View style={styles.leftContent}>
        {renderCheckbox()}
        <View style={styles.avatarContainer}>
          {renderAvatar(40)}
        </View>
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            disabled && styles.userNameDisabled
          ]} numberOfLines={1}>
            {user.full_name}
          </Text>
          <Text style={[
            styles.userEmail,
            disabled && styles.userEmailDisabled
          ]} numberOfLines={1}>
            {subtitle || user.email}
          </Text>
        </View>
      </View>
      
      {rightContent && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={() => onPress(user)}
        style={[styles.touchable, style]}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1C30A4',
    borderColor: '#1C30A4',
  },
  checkboxDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  userNameDisabled: {
    color: '#9CA3AF',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  userEmailDisabled: {
    color: '#D1D5DB',
  },
  rightContent: {
    marginLeft: 12,
  },
});

export default UserCard;