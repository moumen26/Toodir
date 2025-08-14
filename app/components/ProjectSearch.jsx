import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDebouncedCallback } from 'use-debounce';

const ProjectSearch = memo(({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search projects, clients, or categories...",
  debounceMs = 500 
}) => {
  const inputRef = useRef(null);

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      onSearchChange(value);
    },
    debounceMs
  );

  const handleTextChange = useCallback((text) => {
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    inputRef.current?.clear();
    onSearchChange('');
  }, [onSearchChange]);

  const handleFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={handleFocus} style={styles.searchIcon}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          onChangeText={handleTextChange}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never" // We'll use custom clear button
        />
        {searchQuery && searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

ProjectSearch.displayName = 'ProjectSearch';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ProjectSearch;