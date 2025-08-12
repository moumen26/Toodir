import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/storage';

const ProtectedRoute = ({ 
  children, 
  fallbackRoute = ROUTES.AUTH.SIGN_IN,
  requireAuth = true,
  redirectIfAuthenticated = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // User is not authenticated and auth is required
        navigation.reset({
          index: 0,
          routes: [{ name: fallbackRoute }],
        });
      } else if (redirectIfAuthenticated && isAuthenticated) {
        // User is authenticated but should be redirected (e.g., from login page)
        navigation.reset({
          index: 0,
          routes: [{ name: ROUTES.MAIN.TABS }],
        });
      }
    }
  }, [isAuthenticated, isLoading, navigation, requireAuth, redirectIfAuthenticated, fallbackRoute]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C30A4" />
      </View>
    );
  }

  // For routes that require auth
  if (requireAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C30A4" />
      </View>
    );
  }

  // For routes that should redirect if authenticated (like login/signup)
  if (redirectIfAuthenticated && isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1C30A4" />
      </View>
    );
  }

  return <>{children}</>;
};

// Higher-order component for protecting screens
export const withAuth = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific components for common use cases
export const PrivateRoute = ({ children, fallbackRoute }) => (
  <ProtectedRoute 
    requireAuth={true} 
    fallbackRoute={fallbackRoute}
  >
    {children}
  </ProtectedRoute>
);

export const PublicRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={false}
    redirectIfAuthenticated={true}
  >
    {children}
  </ProtectedRoute>
);

export const GuestRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={false}
    redirectIfAuthenticated={false}
  >
    {children}
  </ProtectedRoute>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ProtectedRoute;