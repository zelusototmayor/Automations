import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { registerForPushNotifications, getNotificationPermissionStatus } from '../../src/services/notifications';
import { updatePushToken } from '../../src/services/api';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const SAGE = '#6F8F79';

type PermissionState = 'loading' | 'granted' | 'denied' | 'undetermined';

function ToggleRow({
  title,
  subtitle,
  value,
  onToggle,
  disabled,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      className="rounded-card-sm p-4 mb-3 flex-row items-center"
      style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER, opacity: disabled ? 0.55 : 1 }}
    >
      <View className="flex-1 pr-3">
        <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
          {title}
        </Text>
        <Text className="text-caption mt-1" style={{ color: TEXT_SECONDARY }}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#DCE9DF' }}
        thumbColor={value ? SAGE : '#FFFFFF'}
      />
    </View>
  );
}

export default function NotificationsSettingsScreen() {
  const [permissionState, setPermissionState] = useState<PermissionState>('loading');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [savingPush, setSavingPush] = useState(false);

  const supportsPush = Device.isDevice;

  const refreshPermissionState = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionState(status as PermissionState);
      setPushEnabled(status === 'granted');
    } catch {
      setPermissionState('denied');
      setPushEnabled(false);
    }
  };

  useEffect(() => {
    refreshPermissionState();
  }, []);

  const enablePushNotifications = async () => {
    if (!supportsPush) {
      Alert.alert('Physical device required', 'Push notifications only work on a physical iOS or Android device.');
      return;
    }

    setSavingPush(true);
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        const status = await Notifications.getPermissionsAsync();
        if (status.status === 'denied') {
          Alert.alert('Notifications blocked', 'Please enable notifications in system settings to receive reminders.');
        }
        setPushEnabled(false);
        await refreshPermissionState();
        return;
      }

      await updatePushToken(token);
      setPushEnabled(true);
      setPermissionState('granted');
      Alert.alert('Notifications enabled', 'You will now receive coaching reminders and updates.');
    } catch (error: any) {
      Alert.alert('Unable to enable notifications', error?.message || 'Please try again.');
      setPushEnabled(false);
    } finally {
      setSavingPush(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      await enablePushNotifications();
      return;
    }

    setPushEnabled(false);
    Alert.alert(
      'Disable push reminders?',
      'Push permissions are controlled by your device. You can fully disable notifications in system settings.',
      [
        { text: 'Keep enabled', onPress: () => setPushEnabled(true), style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings?.() },
      ]
    );
  };

  const permissionLabel =
    permissionState === 'granted'
      ? 'Enabled'
      : permissionState === 'loading'
        ? 'Checking...'
        : permissionState === 'undetermined'
          ? 'Not requested'
          : 'Disabled in system settings';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_BG }} edges={['bottom']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Notifications
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Control how Better Coaching keeps you updated.
          </Text>
        </View>

        <View
          className="rounded-card p-4 mb-5"
          style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
        >
          <Text className="text-label font-inter-semibold uppercase mb-2" style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}>
            Push Permission
          </Text>
          <Text className="text-card-title font-inter-semibold" style={{ color: TEXT_PRIMARY }}>
            {permissionLabel}
          </Text>
          <Text className="text-caption mt-2" style={{ color: TEXT_SECONDARY }}>
            {supportsPush
              ? 'Enable push to receive reminders when you are away from the app.'
              : 'Push notifications are unavailable on simulators and web previews.'}
          </Text>
          {!supportsPush && (
            <Text className="text-caption mt-2" style={{ color: TEXT_MUTED }}>
              Current platform: {Platform.OS}
            </Text>
          )}
          {(permissionState === 'denied' || !supportsPush) && (
            <Pressable
              onPress={() => Linking.openSettings?.()}
              className="mt-4 px-4 py-2 self-start rounded-pill active:opacity-80"
              style={{ backgroundColor: '#DCE9DF' }}
            >
              <Text className="font-inter-semibold" style={{ color: '#4F6F5A' }}>
                Open System Settings
              </Text>
            </Pressable>
          )}
        </View>

        <ToggleRow
          title="Enable Push Notifications"
          subtitle="Coach reminders and accountability nudges"
          value={pushEnabled}
          onToggle={(value) => {
            if (!savingPush) {
              void handlePushToggle(value);
            }
          }}
          disabled={savingPush}
        />

        <ToggleRow
          title="Practice Reminders"
          subtitle="Prompts to follow through on your goals"
          value={remindersEnabled}
          onToggle={setRemindersEnabled}
          disabled={!pushEnabled}
        />

        <ToggleRow
          title="Insight Highlights"
          subtitle="Updates when your coaches learn new patterns"
          value={insightsEnabled}
          onToggle={setInsightsEnabled}
          disabled={!pushEnabled}
        />

        <ToggleRow
          title="Email Updates"
          subtitle="Product updates and coaching announcements"
          value={emailEnabled}
          onToggle={setEmailEnabled}
        />

        <View className="mt-4 px-1">
          <Text className="text-caption" style={{ color: TEXT_MUTED }}>
            Notification category toggles are saved locally for now and will sync server-side in a future release.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
