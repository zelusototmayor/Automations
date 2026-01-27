'use client';

import {
  useCreatorStore,
  EXPERTISE_TEMPLATES,
  BOUNDARY_TEMPLATES,
} from '@/lib/creatorStore';

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
    <div className="space-y-6">
      {/* Expertise */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Areas of Expertise
          </label>
          {draft.category && (
            <button
              onClick={applyExpertiseTemplate}
              className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Use template
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What can your coach help with? Be specific.
        </p>

        <textarea
          className="input min-h-[150px]"
          placeholder={`Describe what your coach specializes in...

Example:
- Setting and achieving goals
- Building productive habits
- Overcoming procrastination`}
          value={draft.expertise}
          onChange={(e) => setDraft({ expertise: e.target.value })}
        />
      </div>

      {/* Boundaries */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Boundaries
          </label>
          {draft.category && (
            <button
              onClick={applyBoundaryTemplate}
              className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Use template
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What should your coach NOT do? This keeps conversations safe.
        </p>

        <textarea
          className="input min-h-[120px]"
          placeholder={`List things your coach should avoid...

Example:
- Provide medical diagnoses
- Make decisions for the user
- Give legal or financial advice`}
          value={draft.boundaries}
          onChange={(e) => setDraft({ boundaries: e.target.value })}
        />
      </div>

      {/* Example Topics */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Example Topics (optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What specific questions or topics can your coach address?
        </p>

        <div className="space-y-2">
          {draft.exampleTopics.map((topic, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder={`Topic ${index + 1}...`}
                value={topic}
                onChange={(e) => updateExampleTopic(index, e.target.value)}
              />
              <button
                onClick={() => removeExampleTopic(index)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {draft.exampleTopics.length < 5 && (
          <button
            onClick={addExampleTopic}
            className="mt-2 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            + Add Topic
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
        <p className="text-sm font-medium text-sky-700 dark:text-sky-400 mb-2">
          Tips for Great Expertise
        </p>
        <ul className="space-y-1 text-sm text-sky-600 dark:text-sky-500">
          <li>Be specific about what you can help with</li>
          <li>Set clear boundaries to keep users safe</li>
          <li>Include example topics users might ask about</li>
          <li>Think about your target audience</li>
        </ul>
      </div>
    </div>
  );
}
