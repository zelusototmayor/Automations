'use client';

import { useState, useEffect } from 'react';
import {
  useCreatorStore,
  PROVIDERS,
  DEFAULT_MODELS,
  LLMProvider,
  ExampleConversation,
} from '@/lib/creatorStore';
import { agentsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export function Step5Model() {
  const { accessToken } = useAuthStore();
  const {
    draft,
    setDraft,
    supportedModels,
    setSupportedModels,
    generateSystemPrompt,
  } = useCreatorStore();
  const { modelConfig } = draft;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [newExample, setNewExample] = useState<ExampleConversation>({ user: '', assistant: '' });

  useEffect(() => {
    async function fetchModels() {
      if (!accessToken) return;
      try {
        const { models } = await agentsApi.getSupportedModels(accessToken);
        setSupportedModels(models);
      } catch (error) {
        console.error('Error fetching supported models:', error);
      }
    }
    fetchModels();
  }, [accessToken, setSupportedModels]);

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
    <div className="space-y-6">
      {/* Model Provider Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          AI Model <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Choose the AI that powers your coach
        </p>

        <div className="space-y-2">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => selectProvider(provider.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-colors text-left ${
                modelConfig.provider === provider.id
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-600'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {provider.name}
                  <span className="text-gray-500 dark:text-gray-400 font-normal"> by {provider.company}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{provider.description}</p>
              </div>
              {modelConfig.provider === provider.id && (
                <div className="bg-sky-600 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Model variant selection */}
        {providerModels.length > 1 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Model variant:</p>
            <div className="flex flex-wrap gap-2">
              {providerModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateModelConfig({ model: model.id })}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    modelConfig.model === model.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {model.name}
                  {model.recommended && ' (Recommended)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Temperature Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Creativity
          </label>
          <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">
            {getTemperatureLabel(modelConfig.temperature)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          How creative vs. consistent should responses be?
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Focused</span>
            <span>Creative</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={modelConfig.temperature}
            onChange={(e) => updateModelConfig({ temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>More consistent</span>
            <span>More varied</span>
          </div>
        </div>
      </div>

      {/* Greeting Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Greeting Message <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          The first message users see when starting a chat
        </p>

        <textarea
          className="input min-h-[100px]"
          placeholder="Hey there! I'm your productivity coach, here to help you achieve your goals..."
          value={draft.greetingMessage}
          onChange={(e) => setDraft({ greetingMessage: e.target.value })}
        />
      </div>

      {/* Conversation Starters */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Conversation Starters (up to 3)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Suggested prompts users can tap to start
        </p>

        <div className="space-y-2">
          {draft.conversationStarters.map((starter, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder={`e.g., "Help me set a goal for this week"`}
                value={starter}
                onChange={(e) => updateStarter(index, e.target.value)}
              />
              <button
                onClick={() => removeStarter(index)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {draft.conversationStarters.length < 3 && (
          <button
            onClick={addConversationStarter}
            className="mt-2 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            + Add Starter
          </button>
        )}
      </div>

      {/* Advanced Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <span className="font-medium">Advanced Settings</span>
        <svg
          className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showAdvanced && (
        <div className="space-y-6">
          {/* System Prompt */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                System Prompt
              </label>
              <button
                onClick={() => setDraft({ systemPrompt: generateSystemPrompt() })}
                className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Regenerate
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              The full prompt that defines your coach's behavior
            </p>

            <textarea
              className="input min-h-[200px] font-mono text-sm"
              placeholder="System prompt..."
              value={draft.systemPrompt}
              onChange={(e) => setDraft({ systemPrompt: e.target.value })}
            />
          </div>

          {/* Example Conversations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Example Conversations
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Show your coach how to respond (few-shot learning)
            </p>

            <div className="space-y-2">
              {draft.exampleConversations.map((example, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Example {index + 1}
                    </span>
                    <button
                      onClick={() => removeExample(index)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">User:</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{example.user}</p>
                  </div>
                  <div className="bg-sky-50 dark:bg-sky-900/30 rounded-lg p-2">
                    <span className="text-xs text-sky-600 dark:text-sky-400">Coach:</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{example.assistant}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowExampleModal(true)}
              className="mt-2 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              + Add Example
            </button>
          </div>
        </div>
      )}

      {/* Example Conversation Modal */}
      {showExampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Example Conversation
              </h3>
              <button
                onClick={() => setShowExampleModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User says:
                </label>
                <textarea
                  className="input"
                  placeholder="What would a user ask?"
                  value={newExample.user}
                  onChange={(e) => setNewExample({ ...newExample, user: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coach responds:
                </label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="How should your coach respond?"
                  value={newExample.assistant}
                  onChange={(e) => setNewExample({ ...newExample, assistant: e.target.value })}
                />
              </div>

              <button
                onClick={addExampleConversation}
                disabled={!newExample.user || !newExample.assistant}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  newExample.user && newExample.assistant
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Example
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
