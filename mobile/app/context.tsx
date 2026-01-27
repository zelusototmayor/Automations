import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/auth';
import type { UserContext } from '../src/types';

// Value Chip Component
function ValueChip({
  value,
  isSelected,
  onToggle,
}: {
  value: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        isSelected ? 'bg-primary-600' : 'bg-white border border-gray-200'
      }`}
    >
      <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

// Suggested values
const SUGGESTED_VALUES = [
  'Growth',
  'Family',
  'Creativity',
  'Health',
  'Freedom',
  'Impact',
  'Learning',
  'Balance',
  'Adventure',
  'Security',
  'Connection',
  'Excellence',
];

export default function ContextScreen() {
  const router = useRouter();
  const { user, updateContext } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [context, setContext] = useState<UserContext>({
    name: '',
    about: '',
    values: [],
    goals: '',
    challenges: '',
    additional: '',
  });

  useEffect(() => {
    if (user?.personal_context) {
      setContext({
        name: user.personal_context.name || '',
        about: user.personal_context.about || '',
        values: user.personal_context.values || [],
        goals: user.personal_context.goals || '',
        challenges: user.personal_context.challenges || '',
        additional: user.personal_context.additional || '',
      });
    }
  }, [user]);

  const toggleValue = (value: string) => {
    setContext((prev) => {
      const values = prev.values || [];
      if (values.includes(value)) {
        return { ...prev, values: values.filter((v) => v !== value) };
      }
      if (values.length >= 6) {
        Alert.alert('Limit Reached', 'You can select up to 6 values');
        return prev;
      }
      return { ...prev, values: [...values, value] };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateContext(context);
      Alert.alert('Saved!', 'Your personal context has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Intro */}
        <View className="bg-primary-50 rounded-xl p-4 mb-6">
          <Text className="text-primary-800 font-medium">Why set your context?</Text>
          <Text className="text-primary-600 text-sm mt-1">
            Your coaches will use this to give more personalized, relevant advice.
            Everything here is optional.
          </Text>
        </View>

        {/* Name */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Your Name (optional)
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
            placeholder="What should coaches call you?"
            placeholderTextColor="#9CA3AF"
            value={context.name}
            onChangeText={(text) => setContext((prev) => ({ ...prev, name: text }))}
          />
        </View>

        {/* About */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            About You (optional)
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[80px]"
            placeholder="Brief description of who you are, what you do..."
            placeholderTextColor="#9CA3AF"
            value={context.about}
            onChangeText={(text) => setContext((prev) => ({ ...prev, about: text }))}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Values */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Core Values (select up to 6)
          </Text>
          <View className="flex-row flex-wrap">
            {SUGGESTED_VALUES.map((value) => (
              <ValueChip
                key={value}
                value={value}
                isSelected={context.values?.includes(value) || false}
                onToggle={() => toggleValue(value)}
              />
            ))}
          </View>
        </View>

        {/* Goals */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Current Goals (optional)
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[80px]"
            placeholder="What are you working towards right now?"
            placeholderTextColor="#9CA3AF"
            value={context.goals}
            onChangeText={(text) => setContext((prev) => ({ ...prev, goals: text }))}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Challenges */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Challenges (optional)
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[80px]"
            placeholder="What's holding you back?"
            placeholderTextColor="#9CA3AF"
            value={context.challenges}
            onChangeText={(text) => setContext((prev) => ({ ...prev, challenges: text }))}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Additional */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Anything Else (optional)
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[80px]"
            placeholder="Any other context that might help your coaches..."
            placeholderTextColor="#9CA3AF"
            value={context.additional}
            onChangeText={(text) => setContext((prev) => ({ ...prev, additional: text }))}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white border-t border-gray-100 px-6 py-4 pb-8">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className={`py-4 rounded-xl items-center ${
            isSaving ? 'bg-gray-300' : 'bg-primary-600'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Context</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
