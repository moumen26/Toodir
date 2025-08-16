import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotifications() {
  let token;
  
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the Expo push token
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    
    token = expoPushToken.data;
    
  } catch (error) {
    console.log('Error getting push token:', error);
    return null;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('reminders_channel', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
      });
    } catch (error) {
      console.log('Error setting notification channel:', error);
    }
  }

  return token;
}

// Handle notification taps/actions
export function setupNotificationHandlers(router) {
  // Handle notifications received while app is foregrounded
  const receivedListener = Notifications.addNotificationReceivedListener(notification => {
    
    // Reset badge count when notification is received
    Notifications.setBadgeCountAsync(0);
    
    // You can add custom handling here if needed
    // For example, update local state, show in-app notification, etc.
  });

  // Handle notification taps
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;    
    // Reset badge count when notification is tapped
    Notifications.setBadgeCountAsync(0);
    
    // Handle deep linking
    if (data.deepLink) {
      try {
        Linking.openURL(data.deepLink);
      } catch (error) {
        console.log('Error opening deep link:', error);
      }
    }
    
    // Navigate to reminder details
    if (data.reminderId && router) {
      try {
        router.push(`/ReminderDetails?reminderId=${data.reminderId}`);
      } catch (error) {
        console.log('Error navigating to reminder details:', error);
      }
    }
  });

  // Handle initial notification when app is opened from quit state
  const handleInitialNotification = async () => {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data;
        if (data.reminderId && router) {
          router.push(`/ReminderDetails?reminderId=${data.reminderId}`);
        }
      }
    } catch (error) {
      console.log('Error handling initial notification:', error);
    }
  };
  
  handleInitialNotification();

  // Return cleanup function
  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
}

// Handle token refresh
export function setupTokenRefreshListener(deviceRegistrationFn) {
  if (!deviceRegistrationFn) {
    console.warn('Device registration function not provided to setupTokenRefreshListener');
    return { remove: () => {} };
  }

  return Notifications.addPushTokenListener(async ({ token }) => {    
    // Send new token to server using the provided registration function
    try {
      await deviceRegistrationFn({ token });
      console.log('Device re-registered with new token successfully');
    } catch (error) {
      console.log('Device re-registration error:', error);
    }
  });
}

// Utility function to clear all notifications
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.log('Error clearing notifications:', error);
  }
}

// Utility function to schedule a local notification (for testing)
export async function scheduleTestNotification(title = 'Test', body = 'This is a test notification') {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'test',
          timestamp: Date.now() 
        },
      },
      trigger: { seconds: 2 },
    });
  } catch (error) {
    console.log('Error scheduling test notification:', error);
  }
}