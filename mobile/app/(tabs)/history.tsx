import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth';
import { useChatStore } from '../../src/stores/chat';
import type { Conversation } from '../../src/types';

// Conversation Card
function ConversationCard({
  conversation,
  onDelete,
}: {
  conversation: Conversation;
  onDelete: () => void;
}) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleLongPress = () => {
    Alert.alert('Delete Conversation', 'Are you sure you want to delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${conversation.agent_id}?conversationId=${conversation.id}`)}
      onLongPress={handleLongPress}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 mx-5"
    >
      <View className="p-4 flex-row">
        <View className="bg-primary-100 rounded-xl w-12 h-12 items-center justify-center mr-3">
          <Text className="text-xl">{conversation.agent?.avatar_url || ''}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {conversation.agent?.name || 'Coach'}
          </Text>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
            {conversation.agent?.tagline || 'Conversation'}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {formatDate(conversation.updated_at)}
          </Text>
        </View>
        <View className="justify-center">
          <Text className="text-gray-300">→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Auth Gate Component
function AuthGate() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-gray-100 rounded-full w-20 h-20 items-center justify-center mb-6">
        <Text className="text-4xl"></Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
        Your Conversations
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Sign in to save and continue your coaching conversations.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/auth')}
        className="bg-primary-600 px-8 py-4 rounded-xl"
      >
        <Text className="text-white font-semibold text-base">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { conversations, isLoadingConversations, fetchConversations, deleteConversation } =
    useChatStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background-light" edges={['top']}>
        <AuthGate />
      </SafeAreaView>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Conversations</Text>
        <Text className="text-gray-500 mt-1">Continue where you left off</Text>
      </View>

      {/* Conversations List */}
      {isLoadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4F46E5" size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-100 rounded-full w-16 h-16 items-center justify-center mb-4">
            <Text className="text-3xl"></Text>
          </View>
          <Text className="text-gray-900 font-semibold text-lg mb-2">No conversations yet</Text>
          <Text className="text-gray-500 text-center mb-6">
            Start chatting with a coach to see your conversations here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/')}
            className="bg-primary-100 px-6 py-3 rounded-xl"
          >
            <Text className="text-primary-700 font-semibold">Find a Coach</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          refreshing={isLoadingConversations}
          onRefresh={fetchConversations}
        />
      )}
    </SafeAreaView>
  );
}
