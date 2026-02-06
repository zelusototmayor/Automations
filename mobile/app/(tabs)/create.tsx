import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth';
import { useAgentsStore } from '../../src/stores/agents';
import type { Agent } from '../../src/types';

// My Coach Card
function MyCoachCard({ agent }: { agent: Agent }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/creator/${agent.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3"
    >
      <View className="p-4 flex-row">
        <View className="bg-primary-100 rounded-xl w-12 h-12 items-center justify-center mr-3">
          <Text className="text-xl">{agent.avatar_url || ''}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
              {agent.name}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${
                agent.is_published ? 'bg-green-100' : 'bg-yellow-100'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  agent.is_published ? 'text-green-700' : 'text-yellow-700'
                }`}
              >
                {agent.is_published ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
            {agent.tagline || 'No tagline'}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {agent.usage_count} sessions • {agent.rating_count} ratings
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Creator Gate Component
function CreatorGate() {
  const creatorPortalUrl =
    process.env.EXPO_PUBLIC_CREATOR_PORTAL_URL || 'https://bettercoaching.app/become-creator';

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-primary-100 rounded-full w-20 h-20 items-center justify-center mb-6">
        <Text className="text-4xl"></Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
        Create Your Own Coach
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Build AI coaches powered by your expertise. Share them with the world and earn when
        others use them.
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(creatorPortalUrl)}
        className="bg-primary-600 px-8 py-4 rounded-xl"
      >
        <Text className="text-white font-semibold text-base">Become a Creator</Text>
      </TouchableOpacity>
      <Text className="text-gray-400 text-sm mt-4">Creator subscription required</Text>
    </View>
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
        Sign In to Create
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Create an account to build and share your own AI coaching agents.
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

export default function CreateScreen() {
  const router = useRouter();
  const { isAuthenticated, isCreator } = useAuthStore();
  const { myAgents, isLoadingMyAgents, fetchMyAgents } = useAgentsStore();

  useEffect(() => {
    if (isAuthenticated && isCreator) {
      fetchMyAgents();
    }
  }, [isAuthenticated, isCreator]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background-light" edges={['top']}>
        <AuthGate />
      </SafeAreaView>
    );
  }

  // Not creator
  if (!isCreator) {
    return (
      <SafeAreaView className="flex-1 bg-background-light" edges={['top']}>
        <CreatorGate />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Creator Studio</Text>
          <Text className="text-gray-500 mt-1">Build and manage your coaches</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/creator/new')}
          className="bg-primary-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">+ New</Text>
        </TouchableOpacity>
      </View>

      {/* My Coaches */}
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {isLoadingMyAgents ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#4F46E5" />
          </View>
        ) : myAgents.length === 0 ? (
          <View className="py-12 items-center">
            <View className="bg-gray-100 rounded-full w-16 h-16 items-center justify-center mb-4">
              <Text className="text-3xl"></Text>
            </View>
            <Text className="text-gray-500 text-center mb-4">
              You haven't created any coaches yet.{'\n'}Start building your first one!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/creator/new')}
              className="bg-primary-100 px-6 py-3 rounded-xl"
            >
              <Text className="text-primary-700 font-semibold">Create Your First Coach</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-gray-500 text-sm mb-3">
              {myAgents.length} coach{myAgents.length !== 1 ? 'es' : ''}
            </Text>
            {myAgents.map((agent) => (
              <MyCoachCard key={agent.id} agent={agent} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
