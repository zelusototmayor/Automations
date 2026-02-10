import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROFILE_LINKS, SUPPORT_EMAIL } from '../../src/constants/profile';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

function ActionCard({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
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

export default function ContactScreen() {
  const handleEmailPress = async (subject: string) => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Email unavailable', `Please contact us directly at ${SUPPORT_EMAIL}.`);
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_BG }} edges={['bottom']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Contact Us
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Need help with your account, billing, or your coaching experience? We are here.
          </Text>
        </View>

        <View
          className="rounded-card p-4 mb-5"
          style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
        >
          <Text className="text-label font-inter-semibold uppercase mb-2" style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}>
            Support Email
          </Text>
          <Text className="text-card-title font-inter-semibold" style={{ color: TEXT_PRIMARY }}>
            {SUPPORT_EMAIL}
          </Text>
          <Text className="text-caption mt-2" style={{ color: TEXT_SECONDARY }}>
            Typical response time is within 1-2 business days.
          </Text>
        </View>

        <ActionCard
          title="General Support"
          subtitle="Questions about app usage and account setup"
          onPress={() => {
            void handleEmailPress('General support request');
          }}
        />

        <ActionCard
          title="Billing & Purchases"
          subtitle="Issues with subscriptions, unlocks, or restores"
          onPress={() => {
            void handleEmailPress('Billing and purchase support');
          }}
        />

        <ActionCard
          title="Privacy Request"
          subtitle="Data access, deletion, and privacy rights requests"
          onPress={() => {
            void handleEmailPress('Privacy and data request');
          }}
        />

        <ActionCard
          title="Creator Team"
          subtitle="Questions about becoming or managing a creator account"
          onPress={() => Linking.openURL(PROFILE_LINKS.creatorPortal)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
