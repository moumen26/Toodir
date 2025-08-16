import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDeviceRegister } from '../hooks/useAuth';
import { 
  registerForPushNotifications, 
  setupNotificationHandlers, 
  setupTokenRefreshListener 
} from '../services/pushNotificationsService';

const NotificationInitializer = () => {
  const { deviceRegistration, isLoading, error } = useDeviceRegister();
  const router = useRouter();

  useEffect(() => {
    let tokenListener = null;

    const initNotifications = async () => {
      try {
        // Register for push notifications
        const token = await registerForPushNotifications();
        
        // Send token to backend if we have one
        if (token) {
          console.log('Registering device with token:', token);
          await deviceRegistration({ token });
        }
        
        // Setup notification handlers
        setupNotificationHandlers(router);
        
        // Setup token refresh listener
        tokenListener = setupTokenRefreshListener(deviceRegistration);
        
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Cleanup function
    return () => {
      if (tokenListener) {
        tokenListener.remove();
      }
    };
  }, [deviceRegistration, router]);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer;