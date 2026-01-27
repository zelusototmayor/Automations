import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/components/ui/Button';
import { TargetIcon, MessageIcon, TrendingUpIcon, SparkleIcon } from '../../src/components/ui/Icons';
import { timing, easing, createStaggeredAnimation } from '../../src/utils/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// UI Design Spec V2 - Sharper aesthetic
const colors = {
  sage400: '#6F8F79',        // CTA start (spec)
  sage600: '#4F6F5A',        // CTA end (spec)
  surface: '#F5F5F7',        // V2: Cool gray background
  textPrimary: '#111827',    // Spec primary text
  textSecondary: '#6B7280',  // Spec secondary text
};

// Features to display (using icon components, no emojis)
const features = [
  {
    iconType: 'target',
    title: 'Personalized Coaching',
    description: 'AI coaches tailored to your goals and learning style',
  },
  {
    iconType: 'message',
    title: 'Meaningful Conversations',
    description: 'Deep, contextual discussions that help you grow',
  },
  {
    iconType: 'trending',
    title: 'Track Your Progress',
    description: 'See your development over time with insights',
  },
];

// Icon component renderer
const FeatureIcon = ({ type }: { type: string }) => {
  const iconColor = '#4F6F5A'; // Spec CTA end color
  const iconSize = 24;

  switch (type) {
    case 'target':
      return <TargetIcon size={iconSize} color={iconColor} />;
    case 'message':
      return <MessageIcon size={iconSize} color={iconColor} />;
    case 'trending':
      return <TrendingUpIcon size={iconSize} color={iconColor} />;
    default:
      return <SparkleIcon size={iconSize} color={iconColor} />;
  }
};

// Dev credentials for testing (matches backend seed data)
const DEV_CREDENTIALS = {
  email: 'demo@bettercoaching.app',
  password: 'demo1234',
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { setHasSeenWelcome, signIn, isLoading } = useAuthStore();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const featureAnims = useRef(features.map(() => new Animated.Value(0))).current;
  const buttonsTranslateY = useRef(new Animated.Value(50)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run entrance animations
    Animated.sequence([
      // Logo animation (scale + fade)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: timing.slow,
          easing: easing.decelerate,
          useNativeDriver: true,
        }),
      ]),
      // Headlines fade in
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: timing.slow,
        easing: easing.decelerate,
        useNativeDriver: true,
      }),
      // Features stagger
      createStaggeredAnimation(featureAnims, 100, timing.normal),
      // Buttons slide up
      Animated.parallel([
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: timing.normal,
          easing: easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: timing.normal,
          easing: easing.decelerate,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleCreateAccount = () => {
    router.push('/auth');
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleContinueAsGuest = async () => {
    await setHasSeenWelcome(true);
    router.replace('/(tabs)');
  };

  const handleDevLogin = async () => {
    try {
      await signIn(DEV_CREDENTIALS.email, DEV_CREDENTIALS.password);
      await setHasSeenWelcome(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-6 py-4">
        {/* Hero Section */}
        <View className="items-center mt-8 mb-8">
          {/* Animated Logo */}
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
          >
            <LinearGradient
              colors={[colors.sage400, colors.sage600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.sage600,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <SparkleIcon size={48} color="white" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>

          {/* App Name & Tagline */}
          <Animated.View
            style={{ opacity: headlineOpacity, alignItems: 'center', marginTop: 24 }}
          >
            <Text
              className="font-inter-bold"
              style={{
                fontSize: 28,
                color: colors.textPrimary,
                letterSpacing: -0.5,
              }}
            >
              CoachCraft
            </Text>
            <Text
              className="font-inter-regular"
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Your personal AI coaching companion
            </Text>
          </Animated.View>
        </View>

        {/* Features Section */}
        <View className="mb-8">
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              style={{
                opacity: featureAnims[index],
                transform: [
                  {
                    translateX: featureAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: 'rgba(255,255,255,0.88)', // Spec glass surface
                borderRadius: 22, // Spec card radius
                borderWidth: 1,
                borderColor: '#E7E7E7', // Spec border
                // Spec card shadow
                shadowColor: 'rgb(17, 24, 39)',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.06,
                shadowRadius: 28,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#DCE9DF', // Sage pastel (spec)
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <FeatureIcon type={feature.iconType} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  className="font-inter-semibold"
                  style={{ fontSize: 15, color: colors.textPrimary, marginBottom: 2 }}
                >
                  {feature.title}
                </Text>
                <Text
                  className="font-inter-regular"
                  style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}
                >
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* CTA Section */}
        <Animated.View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingBottom: 16,
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsTranslateY }],
          }}
        >
          {/* Create Account Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreateAccount}
            style={{ marginBottom: 12 }}
          >
            Create Account
          </Button>

          {/* Sign In Button */}
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={handleSignIn}
            style={{ marginBottom: 16 }}
          >
            Sign In
          </Button>

          {/* Continue as Guest */}
          <Pressable
            onPress={handleContinueAsGuest}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text
              className="font-inter-medium"
              style={{ fontSize: 15, color: colors.textSecondary }}
            >
              Continue as guest
            </Text>
          </Pressable>

          {/* Dev Auto-Login Button (only in development) */}
          {__DEV__ && (
            <Pressable
              onPress={handleDevLogin}
              disabled={isLoading}
              style={{
                alignItems: 'center',
                paddingVertical: 8,
                marginTop: 8,
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Text
                className="font-inter-medium"
                style={{ fontSize: 12, color: colors.sage600 }}
              >
                [DEV] Auto-login with demo account
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
