import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useCreatorStore } from '../../stores/creator';

// Coaching approaches with descriptions
const APPROACHES = [
  {
    id: 'socratic',
    name: 'Socratic',
    description: 'Ask questions to help users discover insights themselves',
  },
  {
    id: 'direct',
    name: 'Direct',
    description: 'Give clear, actionable advice and recommendations',
  },
  {
    id: 'supportive',
    name: 'Supportive',
    description: 'Focus on empathy, validation, and encouragement',
  },
  {
    id: 'custom',
    name: 'Adaptive',
    description: 'Adapt approach based on what the user needs',
  },
] as const;

// Response styles
const RESPONSE_STYLES = [
  { id: 'concise', name: 'Concise', description: 'Brief and to the point' },
  { id: 'balanced', name: 'Balanced', description: 'Thorough but focused' },
  { id: 'detailed', name: 'Detailed', description: 'Comprehensive explanations' },
] as const;

// Personality traits
const PERSONALITY_TRAITS = [
  'Encouraging', 'Patient', 'Analytical', 'Creative',
  'Practical', 'Challenging', 'Humorous', 'Structured',
  'Intuitive', 'Empathetic', 'Direct', 'Thoughtful',
];

export function Step2Personality() {
  const { draft, setDraft } = useCreatorStore();
  const { personalityConfig } = draft;

  const updatePersonality = (updates: Partial<typeof personalityConfig>) => {
    setDraft({
      personalityConfig: { ...personalityConfig, ...updates },
    });
  };

  const toggleTrait = (trait: string) => {
    const traits = personalityConfig.traits || [];
    if (traits.includes(trait)) {
      updatePersonality({ traits: traits.filter((t) => t !== trait) });
    } else if (traits.length < 4) {
      updatePersonality({ traits: [...traits, trait] });
    }
  };

  const getToneLabel = (value: number) => {
    if (value < 33) return 'Formal';
    if (value < 66) return 'Balanced';
    return 'Casual';
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-4">
        {/* Coaching Approach */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Coaching Approach
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            How should your coach guide users?
          </Text>

          {APPROACHES.map((approach) => (
            <TouchableOpacity
              key={approach.id}
              onPress={() => updatePersonality({ approach: approach.id })}
              className={`flex-row items-center p-4 rounded-xl mb-2 ${
                personalityConfig.approach === approach.id
                  ? 'bg-primary-50 border-2 border-primary-600'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <View className="flex-1">
                <Text
                  className={`font-medium ${
                    personalityConfig.approach === approach.id
                      ? 'text-primary-700'
                      : 'text-gray-900'
                  }`}
                >
                  {approach.name}
                </Text>
                <Text className="text-sm text-gray-500">{approach.description}</Text>
              </View>
              {personalityConfig.approach === approach.id && (
                <View className="bg-primary-600 w-6 h-6 rounded-full items-center justify-center">
                  <Text className="text-white text-xs">OK</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tone Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-semibold text-gray-700">Tone</Text>
            <Text className="text-sm text-primary-600 font-medium">
              {getToneLabel(personalityConfig.tone)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mb-3">
            How formal or casual should your coach be?
          </Text>

          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-500">Formal</Text>
              <Text className="text-xs text-gray-500">Casual</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              value={personalityConfig.tone}
              onValueChange={(value) => updatePersonality({ tone: Math.round(value) })}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-gray-400">Professional language</Text>
              <Text className="text-xs text-gray-400">Friendly, relaxed</Text>
            </View>
          </View>
        </View>

        {/* Response Style */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Response Style
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            How detailed should responses be?
          </Text>

          <View className="flex-row">
            {RESPONSE_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => updatePersonality({ responseStyle: style.id })}
                className={`flex-1 p-3 rounded-xl mr-2 last:mr-0 ${
                  personalityConfig.responseStyle === style.id
                    ? 'bg-primary-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    personalityConfig.responseStyle === style.id
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {style.name}
                </Text>
                <Text
                  className={`text-xs text-center mt-1 ${
                    personalityConfig.responseStyle === style.id
                      ? 'text-primary-200'
                      : 'text-gray-500'
                  }`}
                >
                  {style.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personality Traits */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Personality Traits (up to 4)
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            What characteristics define your coach?
          </Text>

          <View className="flex-row flex-wrap">
            {PERSONALITY_TRAITS.map((trait) => {
              const isSelected = personalityConfig.traits?.includes(trait);
              const isDisabled = !isSelected && (personalityConfig.traits?.length || 0) >= 4;

              return (
                <TouchableOpacity
                  key={trait}
                  onPress={() => !isDisabled && toggleTrait(trait)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    isSelected
                      ? 'bg-primary-600'
                      : isDisabled
                      ? 'bg-gray-100 opacity-50'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected ? 'text-white font-medium' : 'text-gray-700'
                    }`}
                  >
                    {trait}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {personalityConfig.traits && personalityConfig.traits.length > 0 && (
            <Text className="text-xs text-gray-500 mt-2">
              Selected: {personalityConfig.traits.join(', ')}
            </Text>
          )}
        </View>

        {/* Preview */}
        <View className="bg-primary-50 rounded-xl p-4">
          <Text className="text-sm font-medium text-primary-700 mb-2">
            Personality Preview
          </Text>
          <Text className="text-sm text-primary-600">
            {draft.name || 'Your coach'} will be{' '}
            {getToneLabel(personalityConfig.tone).toLowerCase()},{' '}
            {APPROACHES.find((a) => a.id === personalityConfig.approach)?.name.toLowerCase()},{' '}
            and give {personalityConfig.responseStyle} responses.
            {personalityConfig.traits && personalityConfig.traits.length > 0 && (
              <> Key traits: {personalityConfig.traits.join(', ').toLowerCase()}.</>
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
