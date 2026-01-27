import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCreatorStore } from '../../stores/creator';

// Simulated message type for preview
interface PreviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Message Bubble for Preview
function PreviewMessageBubble({ message }: { message: PreviewMessage }) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-primary-600 rounded-br-md' : 'bg-white rounded-bl-md border border-gray-200'
        }`}
      >
        <Text className={isUser ? 'text-white' : 'text-gray-800'}>{message.content}</Text>
      </View>
    </View>
  );
}

// Test prompts to try
const TEST_PROMPTS = [
  'Tell me about yourself',
  'What can you help me with?',
  'Give me a tip to get started',
];

export function Step5Preview() {
  const { draft } = useCreatorStore();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

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

  // Simulate a response (in real app, this would call the API)
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);

    // Simulate delay
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

  // Generate a simulated response based on draft config
  const generateSimulatedResponse = (userMessage: string): string => {
    const { personalityConfig, expertise, name, tagline } = draft;
    const lowerMessage = userMessage.toLowerCase();

    // Response about self
    if (lowerMessage.includes('yourself') || lowerMessage.includes('who are you')) {
      return `I'm ${name || 'your coach'}${tagline ? ` - ${tagline}` : ''}. I'm here to help you achieve your goals through ${
        personalityConfig.approach === 'socratic'
          ? 'thoughtful questions that help you discover insights'
          : personalityConfig.approach === 'supportive'
          ? 'empathetic support and encouragement'
          : 'clear, actionable guidance'
      }. What would you like to work on today?`;
    }

    // Response about capabilities
    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      if (expertise) {
        return `Great question! ${expertise.split('\n').slice(0, 3).join(' ')} Would you like to dive into any of these areas?`;
      }
      return `I can help you with a variety of topics in my area of expertise. What's on your mind today?`;
    }

    // Response for tips
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

    // Default response
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: PreviewMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowInfo(false);
    simulateResponse(userMessage.content);
  };

  const handleTestPrompt = (prompt: string) => {
    setInput(prompt);
    setShowInfo(false);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      keyboardVerticalOffset={180}
    >
      <View className="flex-1">
        {/* Coach Header */}
        <View className="bg-white border-b border-gray-100 px-5 py-3 flex-row items-center">
          <View className="bg-primary-100 rounded-xl w-10 h-10 items-center justify-center mr-3">
            <Text className="text-xl">{draft.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">{draft.name || 'Your Coach'}</Text>
            <Text className="text-xs text-gray-500">Preview Mode</Text>
          </View>
          <View className="bg-yellow-100 px-2 py-1 rounded-full">
            <Text className="text-xs text-yellow-700">Test</Text>
          </View>
        </View>

        {/* Info Banner */}
        {showInfo && (
          <View className="bg-primary-50 px-5 py-3">
            <Text className="text-sm text-primary-700">
              This is a preview with simulated responses. After publishing, your coach will use
              the real AI model.
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PreviewMessageBubble message={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-8">
              <Text className="text-gray-400">No messages yet</Text>
            </View>
          }
          ListFooterComponent={
            isTyping ? (
              <View className="items-start mb-3">
                <View className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                  <ActivityIndicator size="small" color="#4F46E5" />
                </View>
              </View>
            ) : null
          }
        />

        {/* Test Prompts */}
        {messages.length <= 1 && (
          <View className="px-4 pb-2">
            <Text className="text-xs text-gray-500 mb-2">Try asking:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TEST_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTestPrompt(prompt)}
                  className="bg-primary-50 px-3 py-2 rounded-full mr-2"
                >
                  <Text className="text-sm text-primary-700">{prompt}</Text>
                </TouchableOpacity>
              ))}
              {draft.conversationStarters.filter(Boolean).map((starter, index) => (
                <TouchableOpacity
                  key={`starter-${index}`}
                  onPress={() => handleTestPrompt(starter)}
                  className="bg-gray-100 px-3 py-2 rounded-full mr-2"
                >
                  <Text className="text-sm text-gray-700">{starter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View className="bg-white border-t border-gray-100 px-4 py-3">
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 mr-2 max-h-24 text-gray-900"
              placeholder="Type a test message..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isTyping}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
              className={`rounded-full w-11 h-11 items-center justify-center ${
                input.trim() && !isTyping ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <Text className="text-white text-lg">↑</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card */}
        <View className="bg-gray-50 px-5 py-4 border-t border-gray-200">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Coach Summary</Text>
          <View className="flex-row flex-wrap">
            <View className="bg-white rounded-lg px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-gray-600">
                {PROVIDERS.find((p) => p.id === draft.modelConfig.provider)?.name || 'Model'}
              </Text>
            </View>
            <View className="bg-white rounded-lg px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-gray-600 capitalize">
                {draft.personalityConfig.approach}
              </Text>
            </View>
            <View className="bg-white rounded-lg px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-gray-600 capitalize">
                {draft.personalityConfig.responseStyle}
              </Text>
            </View>
            {draft.category && (
              <View className="bg-white rounded-lg px-2 py-1 mr-2 mb-1">
                <Text className="text-xs text-gray-600 capitalize">{draft.category}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Helper for provider names
const PROVIDERS = [
  { id: 'anthropic', name: 'Claude' },
  { id: 'openai', name: 'GPT-4' },
  { id: 'google', name: 'Gemini' },
];
