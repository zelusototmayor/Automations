import { useEffect, useCallback, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/auth';
import VideoSplash from '../src/components/VideoSplash';
import {
  setupNotificationListeners,
  registerForPushNotifications,
  getLastNotificationResponse,
  handleNotificationResponse,
} from '../src/services/notifications';
import { updatePushToken } from '../src/services/api';
import '../global.css';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [showVideoSplash, setShowVideoSplash] = useState(true);

  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasSeenWelcome = useAuthStore((state) => state.hasSeenWelcome);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);

  // Load Inter font family
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Track if we've registered push token this session
  const hasRegisteredPush = useRef(false);

  useEffect(() => {
    initialize();
  }, []);

  // Set up push notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  // Register for push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || hasRegisteredPush.current) return;

    const registerPush = async () => {
      try {
        const token = await registerForPushNotifications();
        if (token) {
          await updatePushToken(token);
          hasRegisteredPush.current = true;
          console.log('Push token registered with backend');
        }
      } catch (error) {
        console.error('Error registering push notifications:', error);
      }
    };

    registerPush();
  }, [isAuthenticated]);

  // Handle notification tap from cold start
  useEffect(() => {
    if (!isInitialized) return;

    const handleColdStart = async () => {
      const response = await getLastNotificationResponse();
      if (response) {
        handleNotificationResponse(response);
      }
    };

    handleColdStart();
  }, [isInitialized]);

  // Hide splash screen when fonts and auth are ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Navigation based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const inWelcomeGroup = segments[0] === '(welcome)';
    const inOnboarding = segments[1] === 'onboarding';

    // Show welcome screen for first-time unauthenticated users
    const shouldShowWelcome = !isAuthenticated && !hasSeenWelcome;

    // New users who just signed up need to complete onboarding
    const needsOnboarding = isAuthenticated && !hasCompletedOnboarding;

    if (shouldShowWelcome && !inWelcomeGroup) {
      // Redirect to welcome screen
      router.replace('/(welcome)');
    } else if (needsOnboarding && !inOnboarding) {
      // Redirect new authenticated users to onboarding
      router.replace('/(welcome)/onboarding');
    } else if (!shouldShowWelcome && !needsOnboarding && inWelcomeGroup) {
      // Redirect away from welcome screen to tabs
      router.replace('/(tabs)');
    }
  }, [isInitialized, isAuthenticated, hasSeenWelcome, hasCompletedOnboarding, segments]);

  if (!fontsLoaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5F5F7' }, // V2: Cool gray background
          }}
        >
          <Stack.Screen name="(welcome)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="coach/[id]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Back',
              headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="chat/[agentId]"
            options={{
              headerShown: true,
              headerTitle: 'Chat',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              headerShown: true,
              headerTitle: 'Upgrade to Premium',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="context"
            options={{
              headerShown: true,
              headerTitle: 'Personal Context',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="quiz"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
        {showVideoSplash && (
          <VideoSplash onFinish={() => setShowVideoSplash(false)} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
