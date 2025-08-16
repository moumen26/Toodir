import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTags } from '../hooks/useTagsQueries';

const RemindersFilterModal = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('basic');
  const [datePickerType, setDatePickerType] = useState(''); // 'date_from' or 'date_to'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    day: null,
    month: null,
    year: null,
  });

  const { data: tagsData } = useTags();
  const tags = tagsData?.data || [];

  // Filter options
  const statusOptions = [
    { id: '', label: 'All Status', icon: 'list', color: '#6B7280' },
    { id: 'active', label: 'Active', icon: 'radio-button-on', color: '#3B82F6' },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle', color: '#10B981' },
    { id: 'snoozed', label: 'Snoozed', icon: 'time', color: '#8B5CF6' },
  ];

  const reminderTypeOptions = [
    { id: '', label: 'All Types', icon: 'list' },
    { id: 'one_time', label: 'One Time', icon: 'radio-button-on' },
    { id: 'recurring', label: 'Recurring', icon: 'repeat' },
  ];

  const sortByOptions = [
    { id: 'reminder_date_time', label: 'Date & Time' },
    { id: 'created_at', label: 'Created Date' },
    { id: 'updated_at', label: 'Updated Date' },
    { id: 'title', label: 'Title' },
  ];

  const sortOrderOptions = [
    { id: 'ASC', label: 'Ascending (A-Z, Old-New)' },
    { id: 'DESC', label: 'Descending (Z-A, New-Old)' },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic', icon: 'filter' },
    { id: 'date', label: 'Date Range', icon: 'calendar' },
    { id: 'sort', label: 'Sort', icon: 'swap-vertical' },
  ];

  // Date picker data
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString(),
  }));

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (new Date().getFullYear() - 2 + i).toString(),
    label: (new Date().getFullYear() - 2 + i).toString(),
  }));

  const handleFilterChange = useCallback((key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDatePress = (type) => {
    setDatePickerType(type);
    setSelectedDate({ day: null, month: null, year: null });
    setShowDatePicker(true);
  };

  const handleDateSelect = () => {
    if (selectedDate.day && selectedDate.month && selectedDate.year) {
      const dateString = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
      handleFilterChange(datePickerType, dateString);
      setShowDatePicker(false);
    }
  };

  const handleDateItemPress = (item, type) => {
    if (type === 'day') {
      setSelectedDate(prev => ({ ...prev, day: item.value }));
    } else if (type === 'month') {
      setSelectedDate(prev => ({ ...prev, month: item.value }));
    } else if (type === 'year') {
      setSelectedDate(prev => ({ ...prev, year: item.value }));
    }
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      tag_id: '',
      reminder_type: '',
      date_from: '',
      date_to: '',
      sort_by: 'reminder_date_time',
      sort_order: 'ASC',
    };
    setLocalFilters(resetFilters);
    onResetFilters(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.status) count++;
    if (localFilters.tag_id) count++;
    if (localFilters.reminder_type) count++;
    if (localFilters.date_from) count++;
    if (localFilters.date_to) count++;
    if (localFilters.sort_by !== 'reminder_date_time') count++;
    if (localFilters.sort_order !== 'ASC') count++;
    return count;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCurrentDateData = () => {
    if (selectedDate.day === null) return { data: days, type: 'day' };
    if (selectedDate.month === null) return { data: months, type: 'month' };
    if (selectedDate.year === null) return { data: years, type: 'year' };
    return { data: [], type: '' };
  };

  const renderBasicFilters = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Status Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Status</Text>
        <View style={styles.optionsContainer}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                localFilters.status === option.id && styles.selectedOption,
                { borderColor: option.color + '40' }
              ]}
              onPress={() => handleFilterChange('status', option.id)}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={localFilters.status === option.id ? '#fff' : option.color}
              />
              <Text
                style={[
                  styles.optionText,
                  localFilters.status === option.id && styles.selectedOptionText,
                  { color: localFilters.status === option.id ? '#fff' : option.color }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reminder Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Reminder Type</Text>
        <View style={styles.optionsContainer}>
          {reminderTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                localFilters.reminder_type === option.id && styles.selectedOption,
              ]}
              onPress={() => handleFilterChange('reminder_type', option.id)}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={localFilters.reminder_type === option.id ? '#fff' : '#1C30A4'}
              />
              <Text
                style={[
                  styles.optionText,
                  localFilters.reminder_type === option.id && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tag Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Tag</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              !localFilters.tag_id && styles.selectedOption,
            ]}
            onPress={() => handleFilterChange('tag_id', '')}
          >
            <Ionicons
              name="list"
              size={16}
              color={!localFilters.tag_id ? '#fff' : '#6B7280'}
            />
            <Text
              style={[
                styles.optionText,
                !localFilters.tag_id && styles.selectedOptionText,
                { color: !localFilters.tag_id ? '#fff' : '#6B7280' }
              ]}
            >
              All Tags
            </Text>
          </TouchableOpacity>
          
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.optionButton,
                localFilters.tag_id === tag.id && styles.selectedOption,
                { borderColor: tag.color + '40' }
              ]}
              onPress={() => handleFilterChange('tag_id', tag.id)}
            >
              <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
              <Text
                style={[
                  styles.optionText,
                  localFilters.tag_id === tag.id && styles.selectedOptionText,
                  { color: localFilters.tag_id === tag.id ? '#fff' : tag.color }
                ]}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderDateFilters = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Date Range</Text>
        
        {/* From Date */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>From Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDatePress('date_from')}
          >
            <Ionicons name="calendar-outline" size={16} color="#1C30A4" />
            <Text style={[
              styles.dateButtonText,
              !localFilters.date_from && styles.placeholderText
            ]}>
              {localFilters.date_from ? formatDate(localFilters.date_from) : 'Select start date'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          {localFilters.date_from && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => handleFilterChange('date_from', '')}
            >
              <Text style={styles.clearDateText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* To Date */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>To Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDatePress('date_to')}
          >
            <Ionicons name="calendar-outline" size={16} color="#1C30A4" />
            <Text style={[
              styles.dateButtonText,
              !localFilters.date_to && styles.placeholderText
            ]}>
              {localFilters.date_to ? formatDate(localFilters.date_to) : 'Select end date'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          {localFilters.date_to && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => handleFilterChange('date_to', '')}
            >
              <Text style={styles.clearDateText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Date Presets */}
        <View style={styles.quickDatesContainer}>
          <Text style={styles.quickDatesTitle}>Quick Select</Text>
          <View style={styles.quickDatesButtons}>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                handleFilterChange('date_from', today.toISOString().split('T')[0]);
                handleFilterChange('date_to', today.toISOString().split('T')[0]);
              }}
            >
              <Text style={styles.quickDateText}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                handleFilterChange('date_from', today.toISOString().split('T')[0]);
                handleFilterChange('date_to', nextWeek.toISOString().split('T')[0]);
              }}
            >
              <Text style={styles.quickDateText}>Next 7 Days</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                handleFilterChange('date_from', today.toISOString().split('T')[0]);
                handleFilterChange('date_to', nextMonth.toISOString().split('T')[0]);
              }}
            >
              <Text style={styles.quickDateText}>Next 30 Days</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSortFilters = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Sort By */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Sort By</Text>
        <View style={styles.optionsContainer}>
          {sortByOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                localFilters.sort_by === option.id && styles.selectedOption,
              ]}
              onPress={() => handleFilterChange('sort_by', option.id)}
            >
              <Ionicons
                name="funnel"
                size={16}
                color={localFilters.sort_by === option.id ? '#fff' : '#1C30A4'}
              />
              <Text
                style={[
                  styles.optionText,
                  localFilters.sort_by === option.id && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sort Order */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Sort Order</Text>
        <View style={styles.optionsContainer}>
          {sortOrderOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                localFilters.sort_order === option.id && styles.selectedOption,
              ]}
              onPress={() => handleFilterChange('sort_order', option.id)}
            >
              <Ionicons
                name={option.id === 'ASC' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={localFilters.sort_order === option.id ? '#fff' : '#1C30A4'}
              />
              <Text
                style={[
                  styles.optionText,
                  localFilters.sort_order === option.id && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderDatePicker = () => {
    const { data, type } = getCurrentDateData();
    
    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>
                Select {type === 'day' ? 'Day' : type === 'month' ? 'Month' : 'Year'}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectedDateDisplay}>
              <Text style={styles.selectedDateText}>
                {selectedDate.day || '--'}/{selectedDate.month || '--'}/{selectedDate.year || '----'}
              </Text>
            </View>

            <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.datePickerItem,
                    ((type === 'day' && selectedDate.day === item.value) ||
                     (type === 'month' && selectedDate.month === item.value) ||
                     (type === 'year' && selectedDate.year === item.value)) && 
                    styles.selectedDatePickerItem
                  ]}
                  onPress={() => handleDateItemPress(item, type)}
                >
                  <Text style={[
                    styles.datePickerItemText,
                    ((type === 'day' && selectedDate.day === item.value) ||
                     (type === 'month' && selectedDate.month === item.value) ||
                     (type === 'year' && selectedDate.year === item.value)) && 
                    styles.selectedDatePickerItemText
                  ]}>
                    {type === 'month' ? item.label.substring(0, 3) : item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
              numColumns={type === 'day' ? 7 : type === 'month' ? 3 : 4}
              style={styles.datePickerList}
            />

            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.datePickerConfirmButton,
                  (!selectedDate.day || !selectedDate.month || !selectedDate.year) && 
                  styles.disabledButton
                ]}
                onPress={handleDateSelect}
                disabled={!selectedDate.day || !selectedDate.month || !selectedDate.year}
              >
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.modalTitle}>Filter Reminders</Text>
                {getActiveFiltersCount() > 0 && (
                  <View style={styles.filterCountBadge}>
                    <Text style={styles.filterCountText}>{getActiveFiltersCount()}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? '#1C30A4' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {activeTab === 'basic' && renderBasicFilters()}
              {activeTab === 'date' && renderDateFilters()}
              {activeTab === 'sort' && renderSortFilters()}
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>
                  Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderDatePicker()}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  filterCountBadge: {
    backgroundColor: '#1C30A4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedOption: {
    backgroundColor: '#1C30A4',
    borderColor: '#1C30A4',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  selectedOptionText: {
    color: '#fff',
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  clearDateButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  clearDateText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  quickDatesContainer: {
    marginTop: 16,
  },
  quickDatesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  quickDatesButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 12,
    color: '#1C30A4',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#1C30A4',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Date Picker Modal Styles
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  selectedDateDisplay: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    margin: 16,
    borderRadius: 12,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  datePickerList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  datePickerItem: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  selectedDatePickerItem: {
    backgroundColor: '#1C30A4',
  },
  datePickerItemText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  selectedDatePickerItemText: {
    color: '#fff',
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  datePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  datePickerCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#1C30A4',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
});

export default RemindersFilterModal;