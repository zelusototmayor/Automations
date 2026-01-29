import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const PUSH_TOKEN_KEY = 'pushToken';

/**
 * Request permission for push notifications
 * Returns true if permission granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Get the current permission status
 */
export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Register for push notifications and get the token
 * Returns the Expo push token or null if failed
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return null;
    }

    // Get project ID from app.json (expo.extra.eas.projectId or expo.slug)
    const token = await Notifications.getExpoPushTokenAsync({
      // projectId is auto-configured in EAS builds
    });

    // Store token locally
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token.data);

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6F8F79',
      });
    }

    console.log('Push token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Get the stored push token
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data;

  if (data?.agentId) {
    // Navigate to chat with this agent
    router.push({
      pathname: '/chat/[agentId]',
      params: {
        agentId: data.agentId as string,
        conversationId: data.conversationId as string | undefined,
      },
    });
  }
}

/**
 * Set up notification listeners
 * Call this in app startup
 */
export function setupNotificationListeners(): () => void {
  // Handle notification tap when app is in background
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  // Handle notification received while app is in foreground
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification.request.content.title);
  });

  // Return cleanup function
  return () => {
    responseListener.remove();
    receivedListener.remove();
  };
}

/**
 * Get the last notification response (for handling cold start from notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  seconds = 5
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
