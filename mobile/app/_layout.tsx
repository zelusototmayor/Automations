import { useEffect, useCallback, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { Mixpanel } from 'mixpanel-react-native';
import { useAuthStore } from '../src/stores/auth';
import VideoSplash from '../src/components/VideoSplash';
import { OnboardingPromptModal } from '../src/components/OnboardingPromptModal';
import { NotificationPermissionModal } from '../src/components/NotificationPermissionModal';
import { UserIntentModal } from '../src/components/UserIntentModal';
import {
  setupNotificationListeners,
  registerForPushNotifications,
  getLastNotificationResponse,
  handleNotificationResponse,
  getNotificationPermissionStatus,
} from '../src/services/notifications';
import { updatePushToken } from '../src/services/api';
import '../global.css';

const ONBOARDING_DISMISSED_KEY = 'onboarding_prompt_dismissed';
const NOTIFICATION_PROMPT_SHOWN_KEY = 'notification_prompt_shown';

// Initialize Mixpanel (only if token is configured)
const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
export const mixpanel = MIXPANEL_TOKEN ? new Mixpanel(MIXPANEL_TOKEN, true) : null;

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasSeenWelcome = useAuthStore((state) => state.hasSeenWelcome);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const showUserIntentModal = useAuthStore((state) => state.showUserIntentModal);
  const setShowUserIntentModal = useAuthStore((state) => state.setShowUserIntentModal);

  // Load Inter font family
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Track if we've shown modals this session
  const hasShownOnboardingPrompt = useRef(false);
  const hasShownNotificationPrompt = useRef(false);

  useEffect(() => {
    initialize();
  }, []);

  // Initialize Mixpanel
  useEffect(() => {
    if (mixpanel) {
      mixpanel.init().then(() => {
        mixpanel.track('App Opened');
      }).catch(console.warn);
    }
  }, []);

  // Set up push notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  // Show onboarding prompt modal after login (if not completed and not dismissed)
  useEffect(() => {
    if (!isAuthenticated || !isInitialized || hasShownOnboardingPrompt.current) return;
    if (hasCompletedOnboarding) return;

    const checkOnboardingPrompt = async () => {
      const dismissed = await SecureStore.getItemAsync(ONBOARDING_DISMISSED_KEY);
      if (!dismissed) {
        // Delay slightly to let the UI settle
        setTimeout(() => {
          setShowOnboardingPrompt(true);
          hasShownOnboardingPrompt.current = true;
        }, 500);
      }
    };

    checkOnboardingPrompt();
  }, [isAuthenticated, isInitialized, hasCompletedOnboarding]);

  // Show notification prompt after onboarding prompt is dismissed/completed
  useEffect(() => {
    if (!isAuthenticated || !isInitialized || hasShownNotificationPrompt.current) return;
    if (showOnboardingPrompt) return; // Wait for onboarding prompt to close

    const checkNotificationPrompt = async () => {
      const alreadyShown = await SecureStore.getItemAsync(NOTIFICATION_PROMPT_SHOWN_KEY);
      if (alreadyShown) return;

      const status = await getNotificationPermissionStatus();
      if (status !== 'granted') {
        // Delay to not overwhelm user
        setTimeout(() => {
          setShowNotificationPrompt(true);
          hasShownNotificationPrompt.current = true;
        }, 1000);
      }
    };

    checkNotificationPrompt();
  }, [isAuthenticated, isInitialized, showOnboardingPrompt]);

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

  const handleStartOnboarding = () => {
    setShowOnboardingPrompt(false);
    router.push('/(welcome)/onboarding');
  };

  const handleSkipOnboarding = async () => {
    setShowOnboardingPrompt(false);
    await SecureStore.setItemAsync(ONBOARDING_DISMISSED_KEY, 'true');
  };

  const handleAllowNotifications = async () => {
    setShowNotificationPrompt(false);
    await SecureStore.setItemAsync(NOTIFICATION_PROMPT_SHOWN_KEY, 'true');

    try {
      const token = await registerForPushNotifications();
      if (token) {
        await updatePushToken(token);
        console.log('Push token registered with backend');
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };

  const handleDismissNotifications = async () => {
    setShowNotificationPrompt(false);
    await SecureStore.setItemAsync(NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
  };

  const handleSelectFindCoach = () => {
    setShowUserIntentModal(false);
  };

  const handleSelectCreateCoach = () => {
    setShowUserIntentModal(false);
    // Browser is opened by the modal itself
  };

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

    if (shouldShowWelcome && !inWelcomeGroup) {
      // Redirect to welcome screen
      router.replace('/(welcome)');
    } else if (!shouldShowWelcome && inWelcomeGroup && !inOnboarding) {
      // Redirect away from welcome screen to tabs (but allow onboarding if user chose it)
      router.replace('/(tabs)');
    }
  }, [isInitialized, isAuthenticated, hasSeenWelcome, segments]);

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
          <Stack.Screen
            name="insights"
            options={{
              headerShown: true,
              headerTitle: 'What I Remember',
              presentation: 'modal',
            }}
          />
        </Stack>
        {showVideoSplash && (
          <VideoSplash onFinish={() => setShowVideoSplash(false)} />
        )}

        {/* Onboarding Prompt Modal */}
        <OnboardingPromptModal
          visible={showOnboardingPrompt}
          onStartOnboarding={handleStartOnboarding}
          onSkip={handleSkipOnboarding}
        />

        {/* Notification Permission Modal */}
        <NotificationPermissionModal
          visible={showNotificationPrompt}
          onAllow={handleAllowNotifications}
          onDismiss={handleDismissNotifications}
        />

        {/* User Intent Modal (shown after signup) */}
        <UserIntentModal
          visible={showUserIntentModal}
          onSelectFindCoach={handleSelectFindCoach}
          onSelectCreateCoach={handleSelectCreateCoach}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
