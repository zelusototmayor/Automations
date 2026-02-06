import { View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Web URL for creator subscription flow
const WEB_CREATOR_URL =
  process.env.EXPO_PUBLIC_CREATOR_PORTAL_URL || 'https://bettercoaching.app/become-creator';

interface UserIntentModalProps {
  visible: boolean;
  onSelectFindCoach: () => void;
  onSelectCreateCoach: () => void;
}

export function UserIntentModal({
  visible,
  onSelectFindCoach,
  onSelectCreateCoach
}: UserIntentModalProps) {

  const handleCreateCoach = async () => {
    // Open web browser for creator subscription
    try {
      await Linking.openURL(WEB_CREATOR_URL);
    } catch (error) {
      console.error('Failed to open creator URL:', error);
    }
    onSelectCreateCoach();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <View className="bg-sage-50 px-6 pt-8 pb-6 items-center">
            <View className="bg-sage-100 rounded-full w-16 h-16 items-center justify-center mb-4">
              <Ionicons name="sparkles" size={32} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center">
              Welcome to Better Coaching!
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              What brings you here today?
            </Text>
          </View>

          {/* Options */}
          <View className="p-6 space-y-3">
            {/* Find a Coach Option */}
            <TouchableOpacity
              onPress={onSelectFindCoach}
              className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-5 flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="bg-purple-100 rounded-xl w-12 h-12 items-center justify-center mr-4">
                <Ionicons name="search" size={24} color="#7C3AED" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Find a Coach
                </Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  Discover AI coaches for your goals
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Create a Coach Option */}
            <TouchableOpacity
              onPress={handleCreateCoach}
              className="bg-sage-50 border-2 border-sage-100 rounded-2xl p-5 flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="bg-sage-100 rounded-xl w-12 h-12 items-center justify-center mr-4">
                <Ionicons name="create" size={24} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Create a Coach
                </Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  Share your expertise & earn revenue
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="open-outline" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <View className="px-6 pb-6">
            <Text className="text-gray-400 text-xs text-center">
              You can explore both options anytime from the app
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
