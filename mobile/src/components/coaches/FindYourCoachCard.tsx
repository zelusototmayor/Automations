import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from '../ui/Icons';

const colors = {
  cardBg: '#F1E9DD',         // Sand pastel (spec)
  textPrimary: '#111827',    // Spec primary text
  textSecondary: '#6B7280',  // Spec secondary text
  sage: '#6F8F79',           // CTA start (spec)
  sageDark: '#4F6F5A',       // CTA end (spec)
};

/**
 * "Find Your Coach in 60 seconds" card - shown when user has no conversations
 * Prompts user to take a quiz for personalized coach matching
 */
export function FindYourCoachCard() {
  const router = useRouter();

  return (
    <View
      className="mx-5 rounded-2xl p-4 mb-6"
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Title and subtitle */}
      <Text
        className="text-lg font-inter-bold mb-1"
        style={{ color: colors.textPrimary }}
      >
        Find your coach in 60 seconds
      </Text>
      <Text
        className="text-body-sm mb-3"
        style={{ color: colors.textSecondary }}
      >
        Tell us what you need today
      </Text>

      {/* Buttons row */}
      <View className="flex-row items-center">
        {/* Get matched button */}
        <Pressable
          onPress={() => router.push('/quiz')}
          className="px-4 py-1.5 rounded-full active:opacity-80 mr-3"
          style={{ backgroundColor: colors.sage }}
        >
          <Text className="text-body-sm font-inter-semibold text-white">
            Get matched
          </Text>
        </Pressable>

        {/* Browse categories link */}
        <Pressable
          onPress={() => router.push('/explore')}
          className="flex-row items-center"
        >
          <Text
            className="text-body-sm font-inter-medium"
            style={{ color: colors.sageDark }}
          >
            Browse categories
          </Text>
          <ChevronRightIcon size={16} color={colors.sageDark} />
        </Pressable>
      </View>
    </View>
  );
}

export default FindYourCoachCard;
