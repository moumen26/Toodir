import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const ProjectUpdateSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const SkeletonItem = ({ width: itemWidth, height, style }) => (
    <View style={[styles.skeletonItem, { width: itemWidth, height }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonItem width={24} height={24} />
        <View style={styles.headerCenter}>
          <SkeletonItem width={120} height={18} />
          <SkeletonItem width={80} height={12} style={{ marginTop: 4 }} />
        </View>
        <SkeletonItem width={8} height={8} style={{ borderRadius: 4 }} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.section}>
          <SkeletonItem width={100} height={16} />
          <View style={styles.inputSkeleton}>
            <SkeletonItem width="80%" height={16} />
            <SkeletonItem width={40} height={12} style={{ alignSelf: 'flex-end', marginTop: 8 }} />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <SkeletonItem width={140} height={16} />
          <View style={[styles.inputSkeleton, { height: 100 }]}>
            <SkeletonItem width="90%" height={16} />
            <SkeletonItem width="70%" height={16} style={{ marginTop: 8 }} />
            <SkeletonItem width="60%" height={16} style={{ marginTop: 8 }} />
            <SkeletonItem width={50} height={12} style={{ alignSelf: 'flex-end', marginTop: 8 }} />
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <SkeletonItem width={90} height={16} />
          <View style={styles.inputSkeleton}>
            <View style={styles.selectorRow}>
              <SkeletonItem width={20} height={20} />
              <SkeletonItem width={150} height={16} />
              <SkeletonItem width={20} height={20} />
            </View>
          </View>
          {/* Tags chips */}
          <View style={styles.tagsRow}>
            <SkeletonItem width={60} height={24} style={{ borderRadius: 12 }} />
            <SkeletonItem width={80} height={24} style={{ borderRadius: 12 }} />
            <SkeletonItem width={70} height={24} style={{ borderRadius: 12 }} />
          </View>
        </View>

        {/* Priority Section */}
        <View style={styles.section}>
          <SkeletonItem width={60} height={16} />
          <View style={styles.prioritySkeleton}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.priorityOption}>
                <View style={styles.priorityLeft}>
                  <SkeletonItem width={20} height={20} />
                  <SkeletonItem width={80} height={16} />
                </View>
                <SkeletonItem width={20} height={20} />
              </View>
            ))}
          </View>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <SkeletonItem width={120} height={16} />
          <View style={styles.imagesRow}>
            {[1, 2, 3].map((item) => (
              <SkeletonItem 
                key={item} 
                width={120} 
                height={80} 
                style={{ borderRadius: 8 }} 
              />
            ))}
          </View>
        </View>

        {/* New Images Section */}
        <View style={styles.section}>
          <SkeletonItem width={130} height={16} />
          <View style={styles.inputSkeleton}>
            <View style={styles.imagePickerSkeleton}>
              <SkeletonItem width={60} height={60} style={{ borderRadius: 8 }} />
              <View style={styles.imagePickerText}>
                <SkeletonItem width={100} height={16} />
                <SkeletonItem width={80} height={12} style={{ marginTop: 4 }} />
              </View>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <SkeletonItem width={110} height={16} />
          <View style={styles.dateRow}>
            <View style={[styles.inputSkeleton, { flex: 1, marginRight: 6 }]}>
              <SkeletonItem width={60} height={12} />
              <SkeletonItem width="80%" height={16} style={{ marginTop: 6 }} />
            </View>
            <View style={[styles.inputSkeleton, { flex: 1, marginLeft: 6 }]}>
              <SkeletonItem width={60} height={12} />
              <SkeletonItem width="80%" height={16} style={{ marginTop: 6 }} />
            </View>
          </View>
          <SkeletonItem width={200} height={12} style={{ marginTop: 8 }} />
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          <SkeletonItem width={200} height={50} style={{ borderRadius: 12 }} />
          <SkeletonItem width={150} height={12} style={{ marginTop: 12 }} />
        </View>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  skeletonItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  prioritySkeleton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  imagePickerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePickerText: {
    marginLeft: 16,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
});

export default ProjectUpdateSkeleton;