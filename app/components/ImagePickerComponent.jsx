// components/ImagePickerComponent.jsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerComponent = memo(({
  images = [],
  onImagesChange,
  maxImages = 5,
  title = "Project Images"
}) => {
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  }, []);

  const pickImages = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset, index) => ({
          id: Date.now() + index,
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg', // Use mimeType instead of type
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        }));

        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.log('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  }, [images, maxImages, onImagesChange, requestPermissions]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Fixed deprecated usage
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newImage = {
          id: Date.now(),
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg', // Use mimeType instead of type
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        };

        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, [images, onImagesChange]);

  const removeImage = useCallback((imageId) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onImagesChange(images.filter(img => img.id !== imageId));
          },
        },
      ]
    );
  }, [images, onImagesChange]);

  const setPrimaryImage = useCallback((imageId) => {
    const reorderedImages = [...images];
    const primaryIndex = reorderedImages.findIndex(img => img.id === imageId);
    
    if (primaryIndex > 0) {
      const primaryImage = reorderedImages.splice(primaryIndex, 1)[0];
      reorderedImages.unshift(primaryImage);
      onImagesChange(reorderedImages);
    }
  }, [images, onImagesChange]);

  const showImageOptions = useCallback(() => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImages },
      ]
    );
  }, [takePhoto, pickImages]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const renderImage = useCallback((image, index) => (
    <View key={image.id} style={styles.imageContainer}>
      <Image source={{ uri: image.uri }} style={styles.image} />
      
      {/* Primary Badge */}
      {index === 0 && images.length > 1 && (
        <View style={styles.primaryBadge}>
          <Text style={styles.primaryBadgeText}>Primary</Text>
        </View>
      )}

      {/* Image Actions */}
      <View style={styles.imageActions}>
        {index !== 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setPrimaryImage(image.id)}
          >
            <Ionicons name="star" size={16} color="#fff" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => removeImage(image.id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Image Info */}
      <View style={styles.imageInfo}>
        <Text style={styles.imageName} numberOfLines={1}>
          {image.name}
        </Text>
        {image.size > 0 && (
          <Text style={styles.imageSize}>
            {formatFileSize(image.size)}
          </Text>
        )}
      </View>
    </View>
  ), [images.length, setPrimaryImage, removeImage, formatFileSize]);

  const canAddMore = images.length < maxImages;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {images.length} / {maxImages} images
        </Text>
      </View>

      {images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScrollView}
          contentContainerStyle={styles.imagesScrollContent}
        >
          {images.map(renderImage)}
          
          {/* Add More Button */}
          {canAddMore && (
            <TouchableOpacity
              style={styles.addMoreContainer}
              onPress={showImageOptions}
            >
              <View style={styles.addMoreButton}>
                <Ionicons name="add" size={32} color="#1C30A4" />
                <Text style={styles.addMoreText}>Add More</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        /* Empty State */
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={showImageOptions}
        >
          <View style={styles.emptyContent}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={48} color="#1C30A4" />
            </View>
            <Text style={styles.emptyTitle}>Add Project Images</Text>
            <Text style={styles.emptySubtitle}>
              Upload up to {maxImages} images to showcase your project
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.emptyActionButton} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="#1C30A4" />
                <Text style={styles.emptyActionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emptyActionButton} onPress={pickImages}>
                <Ionicons name="image" size={20} color="#1C30A4" />
                <Text style={styles.emptyActionText}>Choose Images</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {images.length > 0 && (
        <View style={styles.helpText}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.helpTextContent}>
            First image will be used as project cover. Tap star to change primary image.
          </Text>
        </View>
      )}
    </View>
  );
});

ImagePickerComponent.displayName = 'ImagePickerComponent';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C30A4',
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C30A4',
    marginLeft: 8,
  },
  imagesScrollView: {
    marginBottom: 12,
  },
  imagesScrollContent: {
    paddingRight: 16,
  },
  imageContainer: {
    width: 120,
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1C30A4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
  },
  removeButton: {
    backgroundColor: '#EF4444',
  },
  imageInfo: {
    marginTop: 8,
  },
  imageName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  imageSize: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  addMoreContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButton: {
    width: 120,
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1C30A4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C30A4',
    marginTop: 4,
  },
  helpText: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  helpTextContent: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default ImagePickerComponent;