import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import UserSearch from '../components/UserSearch';
import FriendInvitations from '../components/FriendInvitations';

const ManageFriends = () => {
  const [selectedTab, setSelectedTab] = useState('search'); // 'search' or 'invitations'
  const [searchQuery, setSearchQuery] = useState('');
  const [invitationType, setInvitationType] = useState('received'); // 'received' or 'sent'
  
  const navigation = useNavigation();

  const tabs = [
    { id: 'search', name: 'Find Friends', icon: 'search' },
    { id: 'invitations', name: 'Invitations', icon: 'mail' },
  ];

  const invitationTabs = [
    { id: 'received', name: 'Received' },
    { id: 'sent', name: 'Sent' },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            selectedTab === tab.id && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon} 
            size={16} 
            color={selectedTab === tab.id ? '#1C30A4' : '#6B7280'} 
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInvitationTabs = () => (
    <View style={styles.invitationTabs}>
      {invitationTabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.invitationTabButton,
            invitationType === tab.id && styles.activeInvitationTabButton,
          ]}
          onPress={() => setInvitationType(tab.id)}
        >
          <Text
            style={[
              styles.invitationTabText,
              invitationType === tab.id && styles.activeInvitationTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchContent = () => (
    <View style={styles.content}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Find Friends</Text>
        <Text style={styles.sectionSubtitle}>
          Search for users by name or email to send friend requests
        </Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or email..."
          style={styles.searchBar}
          autoFocus={false}
        />
      </View>

      <View style={styles.resultsContainer}>
        <UserSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderInvitationsContent = () => (
    <View style={styles.content}>
      <View style={styles.invitationsHeader}>
        <Text style={styles.sectionTitle}>Friend Invitations</Text>
        <Text style={styles.sectionSubtitle}>
          Manage your friend requests and invitations
        </Text>
        
        {renderInvitationTabs()}
      </View>

      <View style={styles.resultsContainer}>
        <FriendInvitations type={invitationType} />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'search':
        return renderSearchContent();
      case 'invitations':
        return renderInvitationsContent();
      default:
        return renderSearchContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Friends</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#1C30A4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  invitationsHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  searchBar: {
    marginBottom: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  invitationTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  invitationTabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeInvitationTabButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  invitationTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeInvitationTabText: {
    color: '#374151',
    fontWeight: '600',
  },
});

export default ManageFriends;