import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/components/ui/Button';
import { TierBadge } from '../../src/components/ui/Badge';
import {
  UserIcon,
  TargetIcon,
  BellIcon,
  CreditCardIcon,
  HelpCircleIcon,
  MailIcon,
  FileTextIcon,
  LogOutIcon,
  LockIcon,
  SettingsIcon,
  ChevronRightIcon,
  SparkleIcon,
  AwardIcon,
} from '../../src/components/ui/Icons';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V2 - SHARPER AESTHETIC
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',           // CTA start (spec)
  sageLight: '#DCE9DF',      // Sage pastel (spec)
  sageDark: '#4F6F5A',       // CTA end (spec)
  lavender: '#E7E0F3',       // Lavender pastel (spec)
  lavenderLight: '#E7E0F3',
  lavenderDark: '#8A7A9E',
  blush: '#D4A5A5',
  blushLight: '#F0D4D4',
  blushDark: '#B87878',
  sky: '#D9ECF7',            // Sky pastel (spec)
  skyLight: '#D9ECF7',
  skyDark: '#7A9EB0',
  cream: '#F5F0E8',
  surface: '#F5F5F7',        // V2: Cool gray background
  warmWhite: 'rgba(255, 255, 255, 0.92)', // V2: Enhanced glass
  border: '#D1D5DB',         // V2: Darker border
  textPrimary: '#111827',    // Spec primary text
  textSecondary: '#6B7280',  // Spec secondary text
  textMuted: '#9CA3AF',      // Spec muted text
  error: '#CF3A3A',
  premium: '#E6B800',
};

// ═══════════════════════════════════════════════════════════════════════════
// MENU ITEM COMPONENT - Premium Style
// ═══════════════════════════════════════════════════════════════════════════

function MenuItem({
  icon,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
  comingSoon = false,
}: {
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
  comingSoon?: boolean;
}) {
  const handlePress = () => {
    if (comingSoon) {
      Alert.alert('Coming Soon', `${title} will be available in a future update.`);
      return;
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-card-sm px-4 py-4 mb-3 flex-row items-center active:opacity-90"
      style={{
        backgroundColor: colors.warmWhite,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 3,
        opacity: comingSoon ? 0.6 : 1,
      }}
    >
      <View
        className="rounded-avatar w-10 h-10 items-center justify-center mr-4"
        style={{ backgroundColor: iconBgColor }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="font-inter-medium text-card-title"
          style={{ color: danger ? colors.error : colors.textPrimary }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-caption" style={{ color: colors.textMuted }}>
            {comingSoon ? 'Coming soon' : subtitle}
          </Text>
        )}
      </View>
      {showArrow && <ChevronRightIcon size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH GATE COMPONENT - Premium Style
// ═══════════════════════════════════════════════════════════════════════════

function AuthGate() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <LinearGradient
        colors={[colors.lavenderLight, colors.lavender]}
        className="rounded-full w-24 h-24 items-center justify-center mb-6"
        style={{ borderRadius: 48 }}
      >
        <UserIcon size={40} color="white" strokeWidth={1.5} />
      </LinearGradient>
      <Text
        className="text-title font-inter-bold text-center mb-3"
        style={{ color: colors.textPrimary }}
      >
        Your Profile
      </Text>
      <Text
        className="text-body text-center mb-8"
        style={{ color: colors.textSecondary }}
      >
        Sign in to personalize your coaching experience and sync your data across devices.
      </Text>
      <Button
        variant="primary"
        size="lg"
        onPress={() => router.push('/auth')}
      >
        Sign In
      </Button>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export default function ProfileScreen() {
  const router = useRouter();
  const { user, subscription, isAuthenticated, isPremium, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }} edges={['top']}>
        <AuthGate />
      </SafeAreaView>
    );
  }

  // Get user initial for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header - Premium Gradient Background */}
        <LinearGradient
          colors={[colors.cream, colors.surface]}
          className="px-5 pt-6 pb-6"
        >
          <View className="items-center">
            {/* Avatar with gradient */}
            <LinearGradient
              colors={[colors.lavender, colors.lavenderDark]}
              className="rounded-full w-20 h-20 items-center justify-center mb-4"
              style={{ borderRadius: 40 }}
            >
              <Text className="text-3xl font-inter-bold text-white">{userInitial}</Text>
            </LinearGradient>

            {/* Name and badges */}
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                className="text-title font-inter-bold"
                style={{ color: colors.textPrimary }}
              >
                {user?.name || 'User'}
              </Text>
              {isPremium && <TierBadge tier="PREMIUM" size="sm" />}
            </View>

            {/* Email */}
            <Text className="text-body-sm" style={{ color: colors.textMuted }}>
              {user?.email}
            </Text>
          </View>
        </LinearGradient>

        {/* Subscription Card */}
        <View className="px-5 mb-6">
          {isPremium ? (
            <View
              className="px-4 py-4 rounded-card flex-row items-center"
              style={{ backgroundColor: colors.lavenderLight, borderWidth: 1, borderColor: colors.lavender }}
            >
              <View
                className="w-10 h-10 rounded-avatar items-center justify-center mr-4"
                style={{ backgroundColor: colors.lavender }}
              >
                <AwardIcon size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text
                  className="font-inter-semibold text-card-title"
                  style={{ color: colors.lavenderDark }}
                >
                  Premium Member
                </Text>
                <Text className="text-caption" style={{ color: colors.lavenderDark }}>
                  {subscription?.expiresAt
                    ? `Renews ${new Date(subscription.expiresAt).toLocaleDateString()}`
                    : 'Active subscription'}
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/paywall')}
              className="rounded-card overflow-hidden active:opacity-90"
            >
              <LinearGradient
                colors={[colors.sage, colors.sageDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-4 flex-row items-center"
              >
                <View
                  className="w-10 h-10 rounded-avatar items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <SparkleIcon size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-card-title text-white">
                    Upgrade to Premium
                  </Text>
                  <Text className="text-caption text-white opacity-80">
                    Unlock all coaches & features
                  </Text>
                </View>
                <ChevronRightIcon size={20} color="white" />
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {/* Menu Sections */}
        <View className="px-5">
          {/* Personalization */}
          <Text
            className="text-label font-inter-semibold uppercase tracking-wide mb-3 ml-1"
            style={{ color: colors.textMuted, letterSpacing: 1.5 }}
          >
            Personalization
          </Text>
          <MenuItem
            icon={<TargetIcon size={20} color={colors.sageDark} />}
            iconBgColor={colors.sageLight}
            iconColor={colors.sageDark}
            title="Personal Context"
            subtitle="Values, goals, and preferences"
            onPress={() => router.push('/context')}
          />
          <MenuItem
            icon={<UserIcon size={20} color={colors.lavenderDark} />}
            iconBgColor={colors.lavenderLight}
            iconColor={colors.lavenderDark}
            title="Edit Profile"
            subtitle="Name and avatar"
            onPress={() => {}}
            comingSoon
          />

          {/* Settings */}
          <Text
            className="text-label font-inter-semibold uppercase tracking-wide mb-3 ml-1 mt-6"
            style={{ color: colors.textMuted, letterSpacing: 1.5 }}
          >
            Settings
          </Text>
          <MenuItem
            icon={<BellIcon size={20} color={colors.blushDark} />}
            iconBgColor={colors.blushLight}
            iconColor={colors.blushDark}
            title="Notifications"
            subtitle="Push and email preferences"
            onPress={() => {}}
            comingSoon
          />
          <MenuItem
            icon={<CreditCardIcon size={20} color={colors.skyDark} />}
            iconBgColor={colors.skyLight}
            iconColor={colors.skyDark}
            title="Subscription"
            subtitle={isPremium ? 'Manage your plan' : 'Upgrade to premium'}
            onPress={() => router.push('/paywall')}
          />
          <MenuItem
            icon={<LockIcon size={20} color={colors.lavenderDark} />}
            iconBgColor={colors.lavenderLight}
            iconColor={colors.lavenderDark}
            title="Privacy & Security"
            subtitle="Manage your data"
            onPress={() => {}}
            comingSoon
          />

          {/* Support */}
          <Text
            className="text-label font-inter-semibold uppercase tracking-wide mb-3 ml-1 mt-6"
            style={{ color: colors.textMuted, letterSpacing: 1.5 }}
          >
            Support
          </Text>
          <MenuItem
            icon={<HelpCircleIcon size={20} color={colors.sageDark} />}
            iconBgColor={colors.sageLight}
            iconColor={colors.sageDark}
            title="Help & FAQ"
            onPress={() => {}}
            comingSoon
          />
          <MenuItem
            icon={<MailIcon size={20} color={colors.skyDark} />}
            iconBgColor={colors.skyLight}
            iconColor={colors.skyDark}
            title="Contact Us"
            onPress={() => {}}
            comingSoon
          />
          <MenuItem
            icon={<FileTextIcon size={20} color={colors.blushDark} />}
            iconBgColor={colors.blushLight}
            iconColor={colors.blushDark}
            title="Terms & Privacy"
            onPress={() => {}}
            comingSoon
          />

          {/* Sign Out */}
          <View className="mt-8 mb-8">
            <MenuItem
              icon={<LogOutIcon size={20} color={colors.error} />}
              iconBgColor="#FDE8E8"
              iconColor={colors.error}
              title="Sign Out"
              onPress={handleSignOut}
              showArrow={false}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
