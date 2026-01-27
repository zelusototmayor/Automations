'use client';

import {
  useCreatorStore,
  APPROACHES,
  RESPONSE_STYLES,
  PERSONALITY_TRAITS,
  CoachingApproach,
  ResponseStyle,
} from '@/lib/creatorStore';

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
    <div className="space-y-8">
      {/* Coaching Approach */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Coaching Approach
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          How should your coach guide users?
        </p>

        <div className="space-y-2">
          {APPROACHES.map((approach) => (
            <button
              key={approach.id}
              onClick={() => updatePersonality({ approach: approach.id })}
              className={`w-full flex items-center p-4 rounded-xl transition-colors text-left ${
                personalityConfig.approach === approach.id
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-600'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    personalityConfig.approach === approach.id
                      ? 'text-sky-700 dark:text-sky-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {approach.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {approach.description}
                </p>
              </div>
              {personalityConfig.approach === approach.id && (
                <div className="bg-sky-600 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tone Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tone
          </label>
          <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">
            {getToneLabel(personalityConfig.tone)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          How formal or casual should your coach be?
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Formal</span>
            <span>Casual</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={personalityConfig.tone}
            onChange={(e) => updatePersonality({ tone: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Professional language</span>
            <span>Friendly, relaxed</span>
          </div>
        </div>
      </div>

      {/* Response Style */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Response Style
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          How detailed should responses be?
        </p>

        <div className="grid grid-cols-3 gap-2">
          {RESPONSE_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => updatePersonality({ responseStyle: style.id })}
              className={`p-3 rounded-xl text-center transition-colors ${
                personalityConfig.responseStyle === style.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <p className="font-medium">{style.name}</p>
              <p
                className={`text-xs mt-1 ${
                  personalityConfig.responseStyle === style.id
                    ? 'text-sky-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Personality Traits (up to 4)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What characteristics define your coach?
        </p>

        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TRAITS.map((trait) => {
            const isSelected = personalityConfig.traits?.includes(trait);
            const isDisabled = !isSelected && (personalityConfig.traits?.length || 0) >= 4;

            return (
              <button
                key={trait}
                onClick={() => !isDisabled && toggleTrait(trait)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-sky-600 text-white'
                    : isDisabled
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {trait}
              </button>
            );
          })}
        </div>

        {personalityConfig.traits && personalityConfig.traits.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Selected: {personalityConfig.traits.join(', ')}
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
        <p className="text-sm font-medium text-sky-700 dark:text-sky-400 mb-2">
          Personality Preview
        </p>
        <p className="text-sm text-sky-600 dark:text-sky-500">
          {draft.name || 'Your coach'} will be{' '}
          {getToneLabel(personalityConfig.tone).toLowerCase()},{' '}
          {APPROACHES.find((a) => a.id === personalityConfig.approach)?.name.toLowerCase()},{' '}
          and give {personalityConfig.responseStyle} responses.
          {personalityConfig.traits && personalityConfig.traits.length > 0 && (
            <> Key traits: {personalityConfig.traits.join(', ').toLowerCase()}.</>
          )}
        </p>
      </div>
    </div>
  );
}
