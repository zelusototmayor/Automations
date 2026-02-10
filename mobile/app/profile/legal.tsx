import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROFILE_LINKS } from '../../src/constants/profile';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

function LegalCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
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

export default function LegalScreen() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_BG }} edges={['bottom']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Terms & Privacy
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Review the legal policies that govern your Better Coaching account and data.
          </Text>
        </View>

        <LegalCard
          title="Privacy Policy"
          subtitle="How we collect, process, and protect personal information"
          onPress={() => Linking.openURL(PROFILE_LINKS.privacyPolicy)}
        />

        <LegalCard
          title="Terms of Service"
          subtitle="Rules for platform usage, billing, and account responsibilities"
          onPress={() => Linking.openURL(PROFILE_LINKS.termsOfService)}
        />

        <View
          className="rounded-card p-4 mt-2"
          style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
        >
          <Text className="text-label font-inter-semibold uppercase mb-2" style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}>
            Helpful Notes
          </Text>
          <Text className="text-body-sm" style={{ color: TEXT_SECONDARY }}>
            In-app purchases are processed by Apple or Google and follow your app store billing terms.
          </Text>
          <Text className="text-body-sm mt-3" style={{ color: TEXT_SECONDARY }}>
            If policy pages do not open, copy these links into your browser:
          </Text>
          <Text className="text-caption mt-2" style={{ color: TEXT_MUTED }}>
            {PROFILE_LINKS.privacyPolicy}
          </Text>
          <Text className="text-caption mt-1" style={{ color: TEXT_MUTED }}>
            {PROFILE_LINKS.termsOfService}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
