// components/TagsSelectorModal.jsx
import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTags, useCreateTag } from '../hooks/useTagsQueries';
import { useDebouncedCallback } from '../hooks/useDebounce';

const TagsSelectorModal = memo(({
  visible,
  onClose,
  selectedTags = [],
  onTagsChange,
  title = "Select Project Tags"
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  // Debounce search
  const debouncedSearch = useDebouncedCallback((query) => {
    setDebouncedQuery(query);
  }, 300);

  // Fetch tags with search
  const {
    data: tagsData,
    isLoading,
    error,
    refetch
  } = useTags({ 
    search: debouncedQuery,
    limit: 100 
  });

  const createTagMutation = useCreateTag();

  const tags = tagsData?.data || [];
  const selectedTagIds = useMemo(() => 
    selectedTags.map(tag => tag.id), 
    [selectedTags]
  );

  // Predefined colors for new tags
  const tagColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6',
    '#F97316', '#84CC16', '#A855F7', '#06B6D4'
  ];

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleTagToggle = useCallback((tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    let newSelectedTags;

    if (isSelected) {
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
    } else {
      newSelectedTags = [...selectedTags, {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }];
    }

    onTagsChange(newSelectedTags);
  }, [selectedTags, selectedTagIds, onTagsChange]);

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) {
      Alert.alert("Error", "Please enter a tag name");
      return;
    }

    try {
      const result = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      });

      // Add the new tag to selected tags
      const newTag = {
        id: result.data.id,
        name: result.data.name,
        color: result.data.color,
      };
      
      onTagsChange([...selectedTags, newTag]);
      
      // Reset form
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setShowCreateForm(false);
      
      Alert.alert("Success", "Tag created successfully!");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create tag");
    }
  }, [newTagName, newTagColor, createTagMutation, selectedTags, onTagsChange]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowCreateForm(false);
    setNewTagName("");
    setNewTagColor("#3B82F6");
    onClose();
  }, [onClose]);

  const renderTagItem = useCallback(({ item: tag }) => {
    const isSelected = selectedTagIds.includes(tag.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.tagItem,
          isSelected && styles.selectedTagItem,
          { borderColor: tag.color + '40' }
        ]}
        onPress={() => handleTagToggle(tag)}
        activeOpacity={0.7}
      >
        <View style={styles.tagInfo}>
          <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
          <Text style={[styles.tagName, isSelected && { color: tag.color }]}>
            {tag.name}
          </Text>
          <Text style={styles.tagProjectCount}>
            {tag.project_count || 0} project{tag.project_count !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && { backgroundColor: tag.color, borderColor: tag.color }]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedTagIds, handleTagToggle]);

  const renderCreateForm = useCallback(() => (
    <View style={styles.createForm}>
      <View style={styles.createFormHeader}>
        <Text style={styles.createFormTitle}>Create New Tag</Text>
        <TouchableOpacity onPress={() => setShowCreateForm(false)}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formRow}>
        <TextInput
          style={styles.tagNameInput}
          placeholder="Tag name..."
          value={newTagName}
          onChangeText={setNewTagName}
          placeholderTextColor="#9CA3AF"
          maxLength={50}
        />
      </View>

      <View style={styles.colorSelector}>
        <Text style={styles.colorSelectorTitle}>Choose Color:</Text>
        <View style={styles.colorGrid}>
          {tagColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                newTagColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setNewTagColor(color)}
            >
              {newTagColor === color && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.createFormButtons}>
        <TouchableOpacity
          style={styles.cancelCreateButton}
          onPress={() => setShowCreateForm(false)}
        >
          <Text style={styles.cancelCreateButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.createTagButton,
            { backgroundColor: newTagColor },
            createTagMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleCreateTag}
          disabled={createTagMutation.isPending || !newTagName.trim()}
        >
          {createTagMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createTagButtonText}>Create Tag</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [newTagName, newTagColor, createTagMutation.isPending, handleCreateTag, tagColors]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyStateTitle}>Failed to load tags</Text>
          <Text style={styles.emptyStateText}>Please try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (debouncedQuery && tags.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No tags found</Text>
          <Text style={styles.emptyStateText}>
            Try different search terms or create a new tag
          </Text>
        </View>
      );
    }

    if (tags.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No tags yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first tag to organize projects
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoading, error, debouncedQuery, tags.length, refetch]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tags..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchChange("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Create New Tag Button */}
          {!showCreateForm && (
            <View style={styles.createButtonContainer}>
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#1C30A4" />
                <Text style={styles.addTagButtonText}>Create New Tag</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create Form */}
          {showCreateForm && renderCreateForm()}

          {/* Tags List */}
          <View style={styles.tagsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1C30A4" />
                <Text style={styles.loadingText}>Loading tags...</Text>
              </View>
            ) : (
              <FlatList
                data={tags}
                renderItem={renderTagItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                style={styles.tagsList}
                contentContainerStyle={styles.tagsListContent}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>
                Done ({selectedTags.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

TagsSelectorModal.displayName = 'TagsSelectorModal';

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
    maxHeight: '85%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1C30A4',
    borderStyle: 'dashed',
  },
  addTagButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C30A4',
    marginLeft: 8,
  },
  createForm: {
    backgroundColor: '#F8FAFC',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  formRow: {
    marginBottom: 16,
  },
  tagNameInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  colorSelector: {
    marginBottom: 16,
  },
  colorSelectorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createFormButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelCreateButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelCreateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  createTagButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  createTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  tagsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  tagsList: {
    flex: 1,
  },
  tagsListContent: {
    paddingBottom: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTagItem: {
    backgroundColor: '#EEF2FF',
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  tagProjectCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1C30A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#1C30A4',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TagsSelectorModal;