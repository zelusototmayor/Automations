import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from '../ui/Icons';

const colors = {
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#4A7C59',
  primaryDark: '#3D6649',
};

/**
 * "Find Your Coach in 60 seconds" card - shown when user has no conversations
 * Prompts user to take a quiz for personalized coach matching
 */
export function FindYourCoachCard() {
  const router = useRouter();

  return (
    <View
      className="mx-5 p-4 mb-6"
      style={{
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      }}
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
          className="px-4 py-1.5 active:opacity-80 mr-3"
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
          }}
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
            style={{ color: colors.primary }}
          >
            Browse categories
          </Text>
          <ChevronRightIcon size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export default FindYourCoachCard;
