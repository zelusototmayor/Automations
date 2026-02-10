import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROFILE_LINKS, SUPPORT_EMAIL } from '../../src/constants/profile';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

const FAQ_ITEMS = [
  {
    question: 'How do free messages work?',
    answer:
      'You get 5 free messages with each coach before unlocking lifetime access. Your trial is tracked per coach.',
  },
  {
    question: 'Why should I fill out Personal Context?',
    answer:
      'Your values, goals, and challenges help coaches give more relevant guidance tailored to your situation.',
  },
  {
    question: 'Can I edit what the app remembers?',
    answer:
      'Yes. Open “What I Remember” to update or remove memories your coaches use for personalization.',
  },
  {
    question: 'How do creator subscriptions work?',
    answer:
      'Creating and publishing coaches requires a Creator subscription managed on the Better Coaching web portal.',
  },
  {
    question: 'How do I restore purchases?',
    answer:
      'Use “Restore Purchases” in Profile to sync lifetime unlocks from your app store account.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((current) => !current)}
      className="rounded-card-sm p-4 mb-3 active:opacity-90"
      style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
    >
      <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
        {question}
      </Text>
      {open && (
        <Text className="text-body-sm mt-2" style={{ color: TEXT_SECONDARY }}>
          {answer}
        </Text>
      )}
      <Text className="text-caption mt-2" style={{ color: TEXT_MUTED }}>
        {open ? 'Tap to collapse' : 'Tap to expand'}
      </Text>
    </Pressable>
  );
}

export default function HelpFaqScreen() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SCREEN_BG }} edges={['bottom']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Help & FAQ
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Quick answers for common questions about coaching, billing, and your account.
          </Text>
        </View>

        {FAQ_ITEMS.map((item) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} />
        ))}

        <Pressable
          onPress={() => Linking.openURL(PROFILE_LINKS.creatorPortal)}
          className="rounded-card-sm p-4 mt-3 mb-3 active:opacity-90"
          style={{ backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: BORDER }}
        >
          <Text className="font-inter-semibold text-card-title" style={{ color: TEXT_PRIMARY }}>
            Creator Help Center
          </Text>
          <Text className="text-caption mt-1" style={{ color: TEXT_SECONDARY }}>
            Learn how creator onboarding, subscriptions, and publishing work.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Better%20Coaching%20Support`)}
          className="rounded-card-sm p-4 mb-2 active:opacity-90"
          style={{ backgroundColor: '#DCE9DF', borderWidth: 1.5, borderColor: '#B8C9B2' }}
        >
          <Text className="font-inter-semibold text-card-title" style={{ color: '#4F6F5A' }}>
            Contact Support
          </Text>
          <Text className="text-caption mt-1" style={{ color: '#5F8069' }}>
            Email {SUPPORT_EMAIL}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
