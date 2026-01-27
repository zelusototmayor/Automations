import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useCreatorStore } from '../../stores/creator';
import type { LLMProvider, ExampleConversation } from '../../types';

// Model providers with info
const PROVIDERS = [
  {
    id: 'anthropic' as LLMProvider,
    name: 'Claude',
    company: 'Anthropic',
    description: 'Great for nuanced, thoughtful conversations',
  },
  {
    id: 'openai' as LLMProvider,
    name: 'GPT-4',
    company: 'OpenAI',
    description: 'Versatile and widely capable',
  },
  {
    id: 'google' as LLMProvider,
    name: 'Gemini',
    company: 'Google',
    description: 'Fast and efficient responses',
  },
];

// Default models per provider
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro',
};

export function Step4Model() {
  const { draft, setDraft, supportedModels, fetchSupportedModels, generateSystemPrompt } =
    useCreatorStore();
  const { modelConfig } = draft;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [newExample, setNewExample] = useState<ExampleConversation>({ user: '', assistant: '' });

  useEffect(() => {
    fetchSupportedModels();
  }, []);

  // Generate prompt if empty
  useEffect(() => {
    if (!draft.systemPrompt && draft.name && draft.category) {
      setDraft({ systemPrompt: generateSystemPrompt() });
    }
  }, [draft.name, draft.category, draft.personalityConfig, draft.expertise, draft.boundaries]);

  const updateModelConfig = (updates: Partial<typeof modelConfig>) => {
    setDraft({ modelConfig: { ...modelConfig, ...updates } });
  };

  const selectProvider = (provider: LLMProvider) => {
    updateModelConfig({
      provider,
      model: DEFAULT_MODELS[provider],
    });
  };

  const getTemperatureLabel = (value: number) => {
    if (value < 0.3) return 'Focused';
    if (value < 0.7) return 'Balanced';
    return 'Creative';
  };

  const addExampleConversation = () => {
    if (newExample.user && newExample.assistant) {
      setDraft({
        exampleConversations: [...draft.exampleConversations, newExample],
      });
      setNewExample({ user: '', assistant: '' });
      setShowExampleModal(false);
    }
  };

  const removeExample = (index: number) => {
    const examples = draft.exampleConversations.filter((_, i) => i !== index);
    setDraft({ exampleConversations: examples });
  };

  const addConversationStarter = () => {
    if (draft.conversationStarters.length < 3) {
      setDraft({ conversationStarters: [...draft.conversationStarters, ''] });
    }
  };

  const updateStarter = (index: number, value: string) => {
    const starters = [...draft.conversationStarters];
    starters[index] = value;
    setDraft({ conversationStarters: starters });
  };

  const removeStarter = (index: number) => {
    const starters = draft.conversationStarters.filter((_, i) => i !== index);
    setDraft({ conversationStarters: starters });
  };

  const providerModels = supportedModels[modelConfig.provider] || [];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-4">
        {/* Model Provider Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            AI Model <Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            Choose the AI that powers your coach
          </Text>

          {PROVIDERS.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              onPress={() => selectProvider(provider.id)}
              className={`flex-row items-center p-4 rounded-xl mb-2 ${
                modelConfig.provider === provider.id
                  ? 'bg-primary-50 border-2 border-primary-600'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <View className="flex-1">
                <Text className="font-medium text-gray-900">
                  {provider.name}
                  <Text className="text-gray-500 font-normal"> by {provider.company}</Text>
                </Text>
                <Text className="text-sm text-gray-500">{provider.description}</Text>
              </View>
              {modelConfig.provider === provider.id && (
                <View className="bg-primary-600 w-6 h-6 rounded-full items-center justify-center">
                  <Text className="text-white text-xs">OK</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Model variant selection */}
          {providerModels.length > 1 && (
            <View className="mt-3">
              <Text className="text-xs text-gray-500 mb-2">Model variant:</Text>
              <View className="flex-row flex-wrap">
                {providerModels.map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    onPress={() => updateModelConfig({ model: model.id })}
                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                      modelConfig.model === model.id
                        ? 'bg-primary-600'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        modelConfig.model === model.id ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {model.name}
                      {model.recommended && ' (Recommended)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Temperature Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-semibold text-gray-700">Creativity</Text>
            <Text className="text-sm text-primary-600 font-medium">
              {getTemperatureLabel(modelConfig.temperature)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mb-3">
            How creative vs. consistent should responses be?
          </Text>

          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-500">Focused</Text>
              <Text className="text-xs text-gray-500">Creative</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              value={modelConfig.temperature}
              onValueChange={(value) => updateModelConfig({ temperature: value })}
              minimumTrackTintColor="#4F46E5"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#4F46E5"
            />
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-gray-400">More consistent</Text>
              <Text className="text-xs text-gray-400">More varied</Text>
            </View>
          </View>
        </View>

        {/* Greeting Message */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Greeting Message <Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            The first message users see when starting a chat
          </Text>

          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[100px]"
            placeholder="Hey there! I'm your productivity coach, here to help you achieve your goals..."
            placeholderTextColor="#9CA3AF"
            value={draft.greetingMessage}
            onChangeText={(text) => setDraft({ greetingMessage: text })}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Conversation Starters */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Conversation Starters (up to 3)
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            Suggested prompts users can tap to start
          </Text>

          {draft.conversationStarters.map((starter, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                placeholder={`e.g., "Help me set a goal for this week"`}
                placeholderTextColor="#9CA3AF"
                value={starter}
                onChangeText={(text) => updateStarter(index, text)}
              />
              <TouchableOpacity onPress={() => removeStarter(index)} className="ml-2 p-2">
                <Text className="text-gray-400 text-lg">×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {draft.conversationStarters.length < 3 && (
            <TouchableOpacity
              onPress={addConversationStarter}
              className="bg-gray-100 rounded-xl px-4 py-3 items-center"
            >
              <Text className="text-gray-600">+ Add Starter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Advanced Toggle */}
        <TouchableOpacity
          onPress={() => setShowAdvanced(!showAdvanced)}
          className="flex-row items-center justify-between bg-gray-100 rounded-xl px-4 py-3 mb-4"
        >
          <Text className="font-medium text-gray-700">Advanced Settings</Text>
          <Text className="text-gray-400">{showAdvanced ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View className="mb-6">
            {/* System Prompt */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm font-semibold text-gray-700">
                  System Prompt
                </Text>
                <TouchableOpacity
                  onPress={() => setDraft({ systemPrompt: generateSystemPrompt() })}
                >
                  <Text className="text-xs text-primary-600">Regenerate</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mb-3">
                The full prompt that defines your coach's behavior
              </Text>

              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[200px] font-mono text-sm"
                placeholder="System prompt..."
                placeholderTextColor="#9CA3AF"
                value={draft.systemPrompt}
                onChangeText={(text) => setDraft({ systemPrompt: text })}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Example Conversations */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Example Conversations
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                Show your coach how to respond (few-shot learning)
              </Text>

              {draft.exampleConversations.map((example, index) => (
                <View key={index} className="bg-gray-50 rounded-xl p-3 mb-2">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-xs font-medium text-gray-500">Example {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeExample(index)}>
                      <Text className="text-gray-400">×</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="bg-white rounded-lg p-2 mb-2">
                    <Text className="text-xs text-gray-500">User:</Text>
                    <Text className="text-sm text-gray-800">{example.user}</Text>
                  </View>
                  <View className="bg-primary-50 rounded-lg p-2">
                    <Text className="text-xs text-primary-600">Coach:</Text>
                    <Text className="text-sm text-gray-800">{example.assistant}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setShowExampleModal(true)}
                className="bg-gray-100 rounded-xl px-4 py-3 items-center"
              >
                <Text className="text-gray-600">+ Add Example</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Example Conversation Modal */}
      <Modal visible={showExampleModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Add Example Conversation
              </Text>
              <TouchableOpacity onPress={() => setShowExampleModal(false)}>
                <Text className="text-gray-400 text-xl">×</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">User says:</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                placeholder="What would a user ask?"
                placeholderTextColor="#9CA3AF"
                value={newExample.user}
                onChangeText={(text) => setNewExample({ ...newExample, user: text })}
                multiline
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Coach responds:</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 min-h-[100px]"
                placeholder="How should your coach respond?"
                placeholderTextColor="#9CA3AF"
                value={newExample.assistant}
                onChangeText={(text) => setNewExample({ ...newExample, assistant: text })}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={addExampleConversation}
              disabled={!newExample.user || !newExample.assistant}
              className={`py-4 rounded-xl items-center ${
                newExample.user && newExample.assistant ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-semibold ${
                  newExample.user && newExample.assistant ? 'text-white' : 'text-gray-500'
                }`}
              >
                Add Example
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
