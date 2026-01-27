import { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/auth';
import VideoSplash from '../src/components/VideoSplash';
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

  // Load Inter font family
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize();
  }, []);

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

    // Show welcome screen for first-time unauthenticated users
    const shouldShowWelcome = !isAuthenticated && !hasSeenWelcome;

    if (shouldShowWelcome && !inWelcomeGroup) {
      // Redirect to welcome screen
      router.replace('/(welcome)');
    } else if (!shouldShowWelcome && inWelcomeGroup) {
      // Redirect away from welcome screen to tabs
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
            contentStyle: { backgroundColor: '#F7F6F3' }, // Spec: background base
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
