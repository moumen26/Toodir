import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useDeviceRegister, useAuthStatus } from '../hooks/useAuth';
import { 
  registerForPushNotifications, 
  setupNotificationHandlers, 
  setupTokenRefreshListener 
} from '../services/pushNotificationsService';

const NotificationInitializer = () => {
  const { deviceRegistration, isLoading, error } = useDeviceRegister();
  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();
  const hasInitialized = useRef(false);
  const tokenListener = useRef(null);

  useEffect(() => {
    // Only initialize if user is authenticated and we haven't initialized yet
    if (!isAuthenticated || hasInitialized.current) {
      return;
    }

    const initNotifications = async () => {
      try {
        console.log('Starting notification initialization...');
        
        // Register for push notifications
        const token = await registerForPushNotifications();
        
        // Send token to backend if we have one and user is still authenticated
        if (token && isAuthenticated) {          
          try {
            const result = await deviceRegistration({ token });
            if (result?.success !== false) {
              console.log('Device registration successful');
            } else {
              console.log('Device registration failed:', result?.error);
              // Don't proceed with other initialization if registration failed
              return;
            }
          } catch (registrationError) {
            console.log('Device registration error:', registrationError);
            // Don't proceed with other initialization if registration failed
            return;
          }
        }
        
        // Setup notification handlers only if we're still authenticated
        if (isAuthenticated) {
          setupNotificationHandlers(router);
          
          // Setup token refresh listener only if we're still authenticated
          tokenListener.current = setupTokenRefreshListener((tokenData) => {
            // Only attempt re-registration if user is still authenticated
            if (isAuthenticated) {
              return deviceRegistration(tokenData);
            }
            return Promise.resolve({ success: false, error: 'User not authenticated' });
          });
        }
        
        hasInitialized.current = true;
        console.log('Notification initialization completed');
        
      } catch (error) {
        console.log('Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Cleanup function
    return () => {
      if (tokenListener.current) {
        try {
          tokenListener.current.remove();
          tokenListener.current = null;
        } catch (cleanupError) {
          console.log('Error cleaning up token listener:', cleanupError);
        }
      }
    };
  }, [isAuthenticated, deviceRegistration, router]);

  // Reset initialization flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasInitialized.current = false;
      
      // Clean up token listener on logout
      if (tokenListener.current) {
        try {
          tokenListener.current.remove();
          tokenListener.current = null;
        } catch (cleanupError) {
          console.log('Error cleaning up token listener on logout:', cleanupError);
        }
      }
    }
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer;