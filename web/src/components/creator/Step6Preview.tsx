'use client';

import { useState, useRef, useEffect } from 'react';
import { useCreatorStore, PROVIDERS, APPROACHES } from '@/lib/creatorStore';

interface PreviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const TEST_PROMPTS = [
  'Tell me about yourself',
  'What can you help me with?',
  'Give me a tip to get started',
];

export function Step6Preview() {
  const { draft } = useCreatorStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with greeting
  useEffect(() => {
    if (draft.greetingMessage) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: draft.greetingMessage,
        },
      ]);
    }
  }, [draft.greetingMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateSimulatedResponse = (userMessage: string): string => {
    const { personalityConfig, expertise, name, tagline } = draft;
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('yourself') || lowerMessage.includes('who are you')) {
      return `I'm ${name || 'your coach'}${tagline ? ` - ${tagline}` : ''}. I'm here to help you achieve your goals through ${
        personalityConfig.approach === 'socratic'
          ? 'thoughtful questions that help you discover insights'
          : personalityConfig.approach === 'supportive'
          ? 'empathetic support and encouragement'
          : 'clear, actionable guidance'
      }. What would you like to work on today?`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      if (expertise) {
        return `Great question! ${expertise.split('\n').slice(0, 3).join(' ')} Would you like to dive into any of these areas?`;
      }
      return `I can help you with a variety of topics in my area of expertise. What's on your mind today?`;
    }

    if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
      const tips = [
        "Start small - pick one thing you can do today.",
        "Consistency beats intensity. Show up every day, even if just for 5 minutes.",
        "Reflect on your progress regularly. Celebrate small wins!",
        "Focus on systems, not just goals. Build habits that support your vision.",
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      return `Here's a tip for you: ${tip} What specific area would you like to explore further?`;
    }

    const responses = [
      `That's an interesting point. ${
        personalityConfig.approach === 'socratic'
          ? 'What do you think is driving that?'
          : 'Let me share some thoughts on that.'
      }`,
      `I appreciate you sharing that with me. ${
        personalityConfig.approach === 'supportive'
          ? "It sounds like you're putting real thought into this."
          : 'How would you like to approach this?'
      }`,
      `Thanks for bringing that up. ${
        personalityConfig.traits?.includes('Encouraging')
          ? "You're already showing great awareness by thinking about this."
          : "Let's explore this together."
      }`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const response = generateSimulatedResponse(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: PreviewMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    simulateResponse(userMessage.content);
  };

  const handleTestPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      {/* Coach Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mr-3">
          <span className="text-xl">{draft.avatar}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">
            {draft.name || 'Your Coach'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Preview Mode</p>
        </div>
        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
          Test
        </span>
      </div>

      {/* Info Banner */}
      <div className="bg-sky-50 dark:bg-sky-900/20 px-4 py-2">
        <p className="text-sm text-sky-700 dark:text-sky-400">
          This is a preview with simulated responses. After publishing, your coach will use the real AI model.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Test Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {TEST_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleTestPrompt(prompt)}
                className="bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-3 py-2 rounded-full text-sm hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
            {draft.conversationStarters.filter(Boolean).map((starter, index) => (
              <button
                key={`starter-${index}`}
                onClick={() => handleTestPrompt(starter)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-end gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Type a test message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              input.trim() && !isTyping
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coach Summary</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs">
            {PROVIDERS.find((p) => p.id === draft.modelConfig.provider)?.name || 'Model'}
          </span>
          <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs capitalize">
            {draft.personalityConfig.approach}
          </span>
          <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs capitalize">
            {draft.personalityConfig.responseStyle}
          </span>
          {draft.category && (
            <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs capitalize">
              {draft.category}
            </span>
          )}
          {draft.knowledgeDocuments.filter((d) => d.status === 'ready').length > 0 && (
            <span className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-lg text-xs">
              {draft.knowledgeDocuments.filter((d) => d.status === 'ready').length} knowledge doc(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
