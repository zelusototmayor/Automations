import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../src/stores/chat';
import { useAgentsStore } from '../../src/stores/agents';
import { useAuthStore } from '../../src/stores/auth';
import * as api from '../../src/services/api';
import { InfoIcon, XIcon, ChevronLeftIcon } from '../../src/components/ui/Icons';
import { TierBadge, Badge } from '../../src/components/ui/Badge';
import { StarRating, SessionCount } from '../../src/components/ui/Rating';
import type { Message, Agent } from '../../src/types';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V2 - SHARPER AESTHETIC
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',
  sageDark: '#4F6F5A',
  sageLight: '#DCE9DF',
  lavender: '#E7E0F3',
  lavenderDark: '#8A7A9E',
  surface: '#F5F5F7',          // V2: Cool gray background
  warmWhite: 'rgba(255,255,255,0.95)',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#D1D5DB',           // V2: Darker border
};

// Avatar gradient colors
const avatarGradients: [string, string][] = [
  ['#6F8F79', '#4F6F5A'],
  ['#B8A9C9', '#8A7A9E'],
  ['#D4A5A5', '#B87878'],
  ['#A5C4D4', '#7A9EB0'],
];

function getAvatarGradient(name: string): [string, string] {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
}

// Helper to get greeting message (handles both camelCase and snake_case)
function getGreetingMessage(agent: Agent): string {
  return (agent as any).greetingMessage || agent.greeting_message || '';
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-sm'
            : 'rounded-bl-sm border'
        }`}
        style={{
          backgroundColor: isUser ? colors.sage : colors.warmWhite,
          borderColor: isUser ? undefined : colors.border,
        }}
      >
        {isStreaming && !message.content ? (
          // Show animated typing indicator when waiting for response
          <View className="flex-row items-center" style={{ minHeight: 22 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Thinking</Text>
            <Text style={{ color: colors.sage, fontSize: 18 }}> ●●●</Text>
          </View>
        ) : (
          <Text
            className={`text-body ${isUser ? 'text-white' : ''}`}
            style={{ lineHeight: 22, color: isUser ? '#fff' : colors.textPrimary }}
          >
            {message.content}
            {isStreaming && message.content && (
              <Text style={{ color: colors.sage }}>▊</Text>
            )}
          </Text>
        )}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COACH INFO MODAL
// ═══════════════════════════════════════════════════════════════════════════

function CoachInfoModal({
  visible,
  onClose,
  agent,
}: {
  visible: boolean;
  onClose: () => void;
  agent: Agent | null;
}) {
  if (!agent) return null;

  const gradientColors = getAvatarGradient(agent.name);
  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b" style={{ borderColor: colors.border }}>
          <Text className="text-lg font-inter-semibold" style={{ color: colors.textPrimary }}>
            About Coach
          </Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <XIcon size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Avatar and Name */}
          <View className="items-center pt-8 pb-6 px-5">
            <LinearGradient
              colors={gradientColors}
              style={{ width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="text-3xl font-inter-bold text-white">{initial}</Text>
            </LinearGradient>
            <Text className="text-xl font-inter-bold mt-4" style={{ color: colors.textPrimary }}>
              {agent.name}
            </Text>
            <Text className="text-body text-center mt-1" style={{ color: colors.textSecondary }}>
              {agent.tagline}
            </Text>
            {agent.tier && agent.tier !== 'free' && (
              <View className="mt-3">
                <TierBadge tier={(agent.tier?.toUpperCase() || 'FREE') as 'FREE' | 'PREMIUM' | 'CREATOR'} />
              </View>
            )}
          </View>

          {/* Stats */}
          <View className="mx-5 mb-6 rounded-xl p-4 flex-row" style={{ backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.border }}>
            <View className="flex-1 items-center">
              <Text className="text-xl font-inter-bold" style={{ color: colors.textPrimary }}>
                {agent.usage_count || 0}
              </Text>
              <Text className="text-caption" style={{ color: colors.textMuted }}>Sessions</Text>
            </View>
            <View className="w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-1 items-center">
              <Text className="text-xl font-inter-bold" style={{ color: colors.textPrimary }}>
                {agent.rating_avg?.toFixed(1) || '-'}
              </Text>
              <Text className="text-caption" style={{ color: colors.textMuted }}>Rating</Text>
            </View>
            <View className="w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-1 items-center">
              <Text className="text-xl font-inter-bold" style={{ color: colors.textPrimary }}>
                {agent.rating_count || 0}
              </Text>
              <Text className="text-caption" style={{ color: colors.textMuted }}>Reviews</Text>
            </View>
          </View>

          {/* About */}
          {agent.description && (
            <View className="mx-5 mb-6">
              <Text className="text-caption font-inter-semibold uppercase mb-2" style={{ color: colors.textMuted }}>
                About
              </Text>
              <View className="rounded-xl p-4" style={{ backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.border }}>
                <Text className="text-body" style={{ color: colors.textPrimary, lineHeight: 22 }}>
                  {agent.description}
                </Text>
              </View>
            </View>
          )}

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <View className="mx-5 mb-6">
              <Text className="text-caption font-inter-semibold uppercase mb-2" style={{ color: colors.textMuted }}>
                Expertise
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <View
                    key={tag}
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: colors.sageLight }}
                  >
                    <Text className="text-caption font-inter-medium" style={{ color: colors.sageDark }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPEECH BUBBLE SUGGESTION
// ═══════════════════════════════════════════════════════════════════════════

function SpeechBubble({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl px-4 py-2.5 mr-2 mb-2 active:opacity-80"
      style={{
        backgroundColor: colors.sageLight,
        maxWidth: 280,
      }}
    >
      <Text className="text-body-sm" style={{ color: colors.sageDark }}>
        {text}
      </Text>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME VIEW (shows before first message - like coach detail page)
// ═══════════════════════════════════════════════════════════════════════════

function WelcomeView({
  agent,
  suggestions,
  onSuggestionPress,
  isPremium,
}: {
  agent: Agent;
  suggestions: string[];
  onSuggestionPress: (text: string) => void;
  isPremium: boolean;
}) {
  const gradientColors = getAvatarGradient(agent.name);
  const initial = agent.name.charAt(0).toUpperCase();
  const greeting = getGreetingMessage(agent);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
        {/* Hero Section */}
        <View className="items-center px-5 pt-6 pb-6">
          {/* Avatar */}
          <LinearGradient
            colors={gradientColors}
            style={{ width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text className="text-3xl font-inter-bold text-white">{initial}</Text>
          </LinearGradient>

          {/* Name */}
          <Text className="text-xl font-inter-bold mt-4" style={{ color: colors.textPrimary }}>
            {agent.name}
          </Text>

          {/* Tagline */}
          <Text className="text-body text-center mt-1" style={{ color: colors.textSecondary }}>
            {agent.tagline}
          </Text>

          {/* Badge */}
          {agent.tier && agent.tier !== 'free' && (
            <View className="mt-3">
              <TierBadge tier={(agent.tier?.toUpperCase() || 'FREE') as 'FREE' | 'PREMIUM' | 'CREATOR'} />
            </View>
          )}

          {/* Trust Signals */}
          <View className="flex-row items-center gap-4 mt-3">
            {agent.rating_avg && (
              <StarRating
                rating={agent.rating_avg}
                reviewCount={agent.rating_count}
                size="sm"
              />
            )}
            <SessionCount count={agent.usage_count || 0} size="sm" />
          </View>
        </View>

        {/* About Section */}
        {agent.description && (
          <View className="px-5 mb-4">
            <Text className="text-caption font-inter-semibold uppercase tracking-wide mb-2" style={{ color: colors.textMuted }}>
              About
            </Text>
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-body" style={{ color: colors.textPrimary, lineHeight: 22 }}>
                {agent.description}
              </Text>
            </View>
          </View>
        )}

        {/* Expertise Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <View className="px-5 mb-4">
            <Text className="text-caption font-inter-semibold uppercase tracking-wide mb-2" style={{ color: colors.textMuted }}>
              Expertise
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="px-5 mb-4">
          <Text className="text-caption font-inter-semibold uppercase tracking-wide mb-2" style={{ color: colors.textMuted }}>
            Statistics
          </Text>
          <View
            className="rounded-xl p-4 flex-row"
            style={{ backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-1 items-center">
              <Text className="text-lg font-inter-bold" style={{ color: colors.textPrimary }}>
                {agent.usage_count || 0}
              </Text>
              <Text className="text-caption" style={{ color: colors.textMuted }}>Sessions</Text>
            </View>
            <View className="w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-1 items-center">
              <Text className="text-lg font-inter-bold" style={{ color: colors.textPrimary }}>
                {agent.rating_count || 0}
              </Text>
              <Text className="text-caption" style={{ color: colors.textMuted }}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Free Trial Note */}
        {!isPremium && agent.tier === 'premium' && (
          <View className="px-5 mb-4">
            <View
              className="rounded-xl p-4 flex-row items-center"
              style={{ backgroundColor: colors.sageLight, borderWidth: 1, borderColor: colors.sage }}
            >
              <Text className="text-2xl mr-3">✨</Text>
              <View className="flex-1">
                <Text className="text-body font-inter-semibold" style={{ color: colors.sageDark }}>
                  Free Preview Available
                </Text>
                <Text className="text-body-sm" style={{ color: colors.sage }}>
                  Try 5 free messages with this coach
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHAT SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export default function ChatScreen() {
  const { agentId, conversationId: initialConvId } = useLocalSearchParams<{
    agentId: string;
    conversationId?: string;
  }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [input, setInput] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(!!initialConvId);

  const {
    messages,
    isStreaming,
    streamingContent,
    isSending,
    sendMessage,
    fetchConversation,
    clearCurrentConversation,
    startNewConversation,
  } = useChatStore();

  const { fetchAgent } = useAgentsStore();
  const { isPremium, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadInitialData();

    return () => {
      clearCurrentConversation();
    };
  }, [agentId, initialConvId]);

  const loadInitialData = async () => {
    try {
      // Load agent
      const agentData = await fetchAgent(agentId!);
      setAgent(agentData);

      // Load suggestions (conversation starters)
      const { suggestions: starters } = await api.getSuggestions(agentId!);
      setSuggestions(starters);

      // Load existing conversation if we have an ID
      if (initialConvId) {
        await fetchConversation(initialConvId);
        setConversationId(initialConvId);
        setHasUserSentMessage(true);
      } else {
        // New conversation — show the coach's greeting message
        const greeting = getGreetingMessage(agentData);
        if (greeting) {
          startNewConversation(agentId!, greeting);
          setHasUserSentMessage(true);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoadingAgent(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isSending) return;

    // Check if user is logged in
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to chat with coaches.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/auth'),
          },
        ]
      );
      return;
    }

    setInput('');
    setHasUserSentMessage(true);

    try {
      const newConvId = await sendMessage(agentId!, text, conversationId);
      setConversationId(newConvId);
    } catch (error: any) {
      // Revert if error
      if (messages.length === 0) {
        setHasUserSentMessage(false);
      }

      if (error.message === 'FREE_TRIAL_EXHAUSTED') {
        Alert.alert(
          'Free Trial Used',
          "You've used all 5 free messages with this coach. Subscribe to continue the conversation.",
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Subscribe',
              onPress: () => router.push('/paywall'),
            },
          ]
        );
      } else if (error.message?.includes('Authentication')) {
        Alert.alert(
          'Sign In Required',
          'Your session has expired. Please sign in again.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => router.push('/auth'),
            },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to send message');
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && hasUserSentMessage) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingContent]);

  // Build display messages (include streaming if active)
  const displayMessages = [...messages];
  if (isStreaming) {
    displayMessages.push({
      id: 'streaming',
      conversation_id: conversationId || '',
      role: 'assistant',
      content: streamingContent || '', // Show typing indicator even if no content yet
      created_at: new Date().toISOString(),
    });
  }

  if (isLoadingAgent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.sage} size="large" />
        <Text className="text-body-sm mt-3" style={{ color: colors.textMuted }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!agent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-5" style={{ backgroundColor: colors.surface }}>
        <Text className="text-lg font-inter-semibold" style={{ color: colors.textPrimary }}>
          Coach not found
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text style={{ color: colors.sage }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: hasUserSentMessage ? agent.name : '',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            color: colors.textPrimary,
          },
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <ChevronLeftIcon size={24} color={colors.textPrimary} />
            </Pressable>
          ),
          headerRight: hasUserSentMessage
            ? () => (
                <Pressable onPress={() => setShowInfoModal(true)} className="p-2 -mr-2">
                  <InfoIcon size={22} color={colors.textSecondary} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          keyboardVerticalOffset={90}
        >
          {/* Show welcome view OR chat messages */}
          {!hasUserSentMessage ? (
            <WelcomeView
              agent={agent}
              suggestions={suggestions}
              onSuggestionPress={(text) => handleSend(text)}
              isPremium={isPremium}
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={displayMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isStreaming={item.id === 'streaming'}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input Area - always visible */}
          <View
            className="px-4 py-3 border-t"
            style={{ backgroundColor: colors.warmWhite, borderColor: colors.border }}
          >
            {/* Speech bubble suggestions - show before first message */}
            {!hasUserSentMessage && suggestions.length > 0 && (
              <View className="mb-3">
                <Text className="text-caption font-inter-medium mb-2" style={{ color: colors.textMuted }}>
                  Try asking:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {suggestions.map((suggestion, index) => (
                    <SpeechBubble
                      key={index}
                      text={suggestion}
                      onPress={() => handleSend(suggestion)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View className="flex-row items-end">
              <TextInput
                className="flex-1 rounded-2xl px-4 py-3 mr-2 max-h-24 text-body font-inter-regular"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
                placeholder="Type your message..."
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                multiline
                editable={!isSending}
              />
              <Pressable
                onPress={() => handleSend()}
                disabled={!input.trim() || isSending}
                className="rounded-full w-11 h-11 items-center justify-center"
                style={{
                  backgroundColor: input.trim() && !isSending ? colors.sage : colors.border,
                }}
              >
                {isSending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-lg font-inter-bold">↑</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Coach Info Modal */}
      <CoachInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        agent={agent}
      />
    </>
  );
}
