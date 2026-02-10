import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/auth';
import { PROFILE_LINKS, SUPPORT_EMAIL } from '../../src/constants/profile';

const ONBOARDING_DISMISSED_KEY = 'onboarding_prompt_dismissed';
const NOTIFICATION_PROMPT_SHOWN_KEY = 'notification_prompt_shown';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

function SectionCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-card-sm p-4 mb-3 active:opacity-90"
      style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
    >
      <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
        {title}
      </Text>
      <Text className="text-caption mt-1" style={{ color: TEXT_SECONDARY }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function PrivacySecurityScreen() {
  const { signOut } = useAuthStore();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSignOutAll = async () => {
    Alert.alert('Sign out everywhere?', 'This signs you out on this device now. To revoke all sessions, contact support.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const clearDeviceSession = async () => {
    Alert.alert(
      'Clear local secure data?',
      'This removes saved tokens and app settings from this device and signs you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(ONBOARDING_DISMISSED_KEY);
              await SecureStore.deleteItemAsync(NOTIFICATION_PROMPT_SHOWN_KEY);
              await signOut();
            } catch {
              Alert.alert('Unable to clear data', 'Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_BG }} edges={['bottom']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Privacy & Security
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Manage your data visibility, session security, and account controls.
          </Text>
        </View>

        <View
          className="rounded-card p-4 mb-5"
          style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
        >
          <Text className="text-label font-inter-semibold uppercase mb-3" style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}>
            Device Security
          </Text>

          <View className="flex-row items-center mb-4">
            <View className="flex-1 pr-3">
              <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
                Require Face ID / Biometrics
              </Text>
              <Text className="text-caption mt-1" style={{ color: TEXT_SECONDARY }}>
                Add quick app lock protection on supported devices.
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={(value) => {
                setBiometricsEnabled(value);
                if (value) {
                  Alert.alert(
                    'Use device security settings',
                    'Set Face ID or passcode controls from your phone settings for stronger protection.'
                  );
                }
              }}
              trackColor={{ false: '#D1D5DB', true: '#DCE9DF' }}
              thumbColor={biometricsEnabled ? '#6F8F79' : '#FFFFFF'}
            />
          </View>

          <View className="flex-row items-center">
            <View className="flex-1 pr-3">
              <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
                Share Anonymous Analytics
              </Text>
              <Text className="text-caption mt-1" style={{ color: TEXT_SECONDARY }}>
                Help improve coaching quality with anonymous usage patterns.
              </Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#DCE9DF' }}
              thumbColor={analyticsEnabled ? '#6F8F79' : '#FFFFFF'}
            />
          </View>
        </View>

        <SectionCard
          title="Privacy Policy"
          subtitle="Read how your personal data is collected and used"
          onPress={() => Linking.openURL(PROFILE_LINKS.privacyPolicy)}
        />

        <SectionCard
          title="Terms of Service"
          subtitle="Review account, billing, and usage terms"
          onPress={() => Linking.openURL(PROFILE_LINKS.termsOfService)}
        />

        <SectionCard
          title="Request Data Export"
          subtitle="Email support to request a copy of your account data"
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Data%20export%20request`)}
        />

        <SectionCard
          title="Sign Out on This Device"
          subtitle="Immediately end your current app session"
          onPress={handleSignOutAll}
        />

        <SectionCard
          title="Manage Passcode & Biometrics"
          subtitle="Open device settings for app-level security controls"
          onPress={() => Linking.openSettings?.()}
        />

        <Pressable
          onPress={clearDeviceSession}
          className="rounded-card-sm p-4 mt-2 mb-6 active:opacity-90"
          style={{ backgroundColor: '#FDE8E8', borderWidth: 1.5, borderColor: '#F7CACA' }}
        >
          <Text className="font-inter-semibold text-card-title" style={{ color: '#CF3A3A' }}>
            Clear Local Secure Data
          </Text>
          <Text className="text-caption mt-1" style={{ color: '#B24A4A' }}>
            Removes stored auth data and signs you out from this device.
          </Text>
        </Pressable>

        <Text className="text-caption mt-1 mb-4" style={{ color: TEXT_MUTED }}>
          Need account deletion or legal help? Contact {SUPPORT_EMAIL}.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
