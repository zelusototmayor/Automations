import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useCreatorStore } from '../../stores/creator';

// Example expertise templates by category
const EXPERTISE_TEMPLATES: Record<string, string> = {
  productivity: `I specialize in:
- Goal setting and achievement
- Time management and prioritization
- Building effective habits and routines
- Overcoming procrastination
- Creating systems for productivity`,
  career: `I specialize in:
- Career planning and transitions
- Interview preparation
- Leadership development
- Networking strategies
- Negotiation and communication`,
  wellness: `I specialize in:
- Stress management techniques
- Mindfulness and meditation
- Work-life balance
- Building healthy habits
- Emotional regulation`,
  creativity: `I specialize in:
- Overcoming creative blocks
- Brainstorming techniques
- Writing and storytelling
- Developing creative projects
- Building a creative practice`,
  relationships: `I specialize in:
- Communication skills
- Conflict resolution
- Setting healthy boundaries
- Building meaningful connections
- Navigating relationship challenges`,
  finance: `I specialize in:
- Personal budgeting
- Financial goal setting
- Debt management strategies
- Building wealth habits
- Business and freelance finances`,
  learning: `I specialize in:
- Study techniques and strategies
- Memory and retention methods
- Learning new skills efficiently
- Academic planning
- Self-directed learning`,
};

const BOUNDARY_TEMPLATES: Record<string, string> = {
  productivity: `- Provide medical or mental health diagnoses
- Give legal or financial advice
- Make decisions for you
- Judge or criticize your past choices`,
  career: `- Make job decisions for you
- Guarantee specific outcomes
- Provide legal employment advice
- Share confidential information`,
  wellness: `- Diagnose mental health conditions
- Replace professional therapy
- Prescribe medications or treatments
- Provide medical advice`,
  creativity: `- Create content on your behalf
- Guarantee creative success
- Judge the worth of your work
- Make artistic decisions for you`,
  relationships: `- Make relationship decisions for you
- Provide couples therapy
- Take sides in conflicts
- Share information with others`,
  finance: `- Provide specific investment advice
- Recommend financial products
- Make financial decisions for you
- Give tax or legal advice`,
  learning: `- Complete assignments for you
- Guarantee academic results
- Replace professional tutoring
- Make educational decisions`,
};

export function Step3Expertise() {
  const { draft, setDraft } = useCreatorStore();

  const applyExpertiseTemplate = () => {
    if (draft.category && EXPERTISE_TEMPLATES[draft.category]) {
      setDraft({ expertise: EXPERTISE_TEMPLATES[draft.category] });
    }
  };

  const applyBoundaryTemplate = () => {
    if (draft.category && BOUNDARY_TEMPLATES[draft.category]) {
      setDraft({ boundaries: BOUNDARY_TEMPLATES[draft.category] });
    }
  };

  const addExampleTopic = () => {
    if (draft.exampleTopics.length < 5) {
      setDraft({ exampleTopics: [...draft.exampleTopics, ''] });
    }
  };

  const updateExampleTopic = (index: number, value: string) => {
    const topics = [...draft.exampleTopics];
    topics[index] = value;
    setDraft({ exampleTopics: topics });
  };

  const removeExampleTopic = (index: number) => {
    const topics = draft.exampleTopics.filter((_, i) => i !== index);
    setDraft({ exampleTopics: topics });
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-4">
        {/* Expertise */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-semibold text-gray-700">
              Areas of Expertise
            </Text>
            {draft.category && (
              <TouchableOpacity onPress={applyExpertiseTemplate}>
                <Text className="text-xs text-primary-600">Use template</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-xs text-gray-500 mb-3">
            What can your coach help with? Be specific.
          </Text>

          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[150px]"
            placeholder="Describe what your coach specializes in...

Example:
- Setting and achieving goals
- Building productive habits
- Overcoming procrastination"
            placeholderTextColor="#9CA3AF"
            value={draft.expertise}
            onChangeText={(text) => setDraft({ expertise: text })}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Boundaries */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-semibold text-gray-700">
              Boundaries
            </Text>
            {draft.category && (
              <TouchableOpacity onPress={applyBoundaryTemplate}>
                <Text className="text-xs text-primary-600">Use template</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-xs text-gray-500 mb-3">
            What should your coach NOT do? This keeps conversations safe.
          </Text>

          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[120px]"
            placeholder="List things your coach should avoid...

Example:
- Provide medical diagnoses
- Make decisions for the user
- Give legal or financial advice"
            placeholderTextColor="#9CA3AF"
            value={draft.boundaries}
            onChangeText={(text) => setDraft({ boundaries: text })}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Example Topics */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Example Topics (optional)
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            What specific questions or topics can your coach address?
          </Text>

          {draft.exampleTopics.map((topic, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                placeholder={`Topic ${index + 1}...`}
                placeholderTextColor="#9CA3AF"
                value={topic}
                onChangeText={(text) => updateExampleTopic(index, text)}
              />
              <TouchableOpacity
                onPress={() => removeExampleTopic(index)}
                className="ml-2 p-2"
              >
                <Text className="text-gray-400 text-lg">×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {draft.exampleTopics.length < 5 && (
            <TouchableOpacity
              onPress={addExampleTopic}
              className="bg-gray-100 rounded-xl px-4 py-3 items-center"
            >
              <Text className="text-gray-600">+ Add Topic</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View className="bg-primary-50 rounded-xl p-4">
          <Text className="text-sm font-medium text-primary-700 mb-2">
            Tips for Great Expertise
          </Text>
          <View className="space-y-1">
            <Text className="text-sm text-primary-600">• Be specific about what you can help with</Text>
            <Text className="text-sm text-primary-600">• Set clear boundaries to keep users safe</Text>
            <Text className="text-sm text-primary-600">• Include example topics users might ask about</Text>
            <Text className="text-sm text-primary-600">• Think about your target audience</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
