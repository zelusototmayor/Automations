import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAgentsStore } from '../../src/stores/agents';
import { useChatStore } from '../../src/stores/chat';
import { useAuthStore } from '../../src/stores/auth';
import { CoachCard } from '../../src/components/coaches/CoachCard';
import { FindYourCoachCard } from '../../src/components/coaches/FindYourCoachCard';
import { SearchBar, CategoryCard } from '../../src/components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// BETTER COACHING DESIGN SYSTEM - NEUTRAL BASE WITH SAGE ACCENT
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  // Accent (sage green)
  primary: '#4A7C59',
  primaryLight: '#E8F0EB',
  primaryDark: '#3D6649',
  // Special
  premium: '#7C6FA0',
  error: '#DC2626',
  success: '#16A34A',
};

// Avatar gradient colors for Continue section cards (sage green only)
const avatarGradients = [
  ['#4A7C59', '#3D6649'], // Sage green gradient (primary to primaryDark)
  ['#5A8B69', '#4A7C59'], // Lighter sage variation
  ['#3D6649', '#2D5039'], // Darker sage variation
  ['#6B9C7A', '#5A8B69'], // Lightest sage variation
];

function getAvatarGradient(name: string): [string, string] {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length] as [string, string];
}

export default function HomeScreen() {
  const router = useRouter();

  const {
    featured,
    categories,
    isLoadingFeatured,
    fetchFeatured,
    fetchCategories,
    setCategory,
  } = useAgentsStore();

  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
  } = useChatStore();

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchFeatured();
    fetchCategories();
    // Only fetch conversations if user is authenticated
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const handleCategoryPress = (categoryId: string) => {
    setCategory(categoryId);
    router.push('/explore');
  };

  // Check if user has any conversations
  const hasConversations = conversations.length > 0;

  // Get recent conversations sorted by updated_at (already sorted from API)
  const recentConversations = conversations.slice(0, 5);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingFeatured || isLoadingConversations}
            onRefresh={() => {
              fetchFeatured();
              fetchCategories();
              if (isAuthenticated) {
                fetchConversations();
              }
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar at top */}
        <View className="px-5 pt-4 mb-6">
          <SearchBar
            editable={false}
            onPress={() => router.push('/explore')}
            placeholder="Search coaches..."
          />
        </View>

        {/* Conditional: Continue Section OR Find Your Coach Card */}
        {hasConversations ? (
          /* Continue Section - Shows recent conversations */
          <View className="mb-6">
            <View className="px-5 flex-row justify-between items-center mb-3">
              <Text className="text-section font-inter-semibold" style={{ color: colors.textPrimary }}>
                Continue
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/history')}>
                <Text className="text-body-sm font-inter-medium" style={{ color: colors.primary }}>
                  See all
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {recentConversations.map((conversation) => {
                const agent = conversation.agent;
                if (!agent) return null;
                const gradientColors = getAvatarGradient(agent.name);
                const initial = agent.name.charAt(0).toUpperCase();
                // Calculate time ago
                const updatedAt = new Date(conversation.updated_at);
                const now = new Date();
                const diffMs = now.getTime() - updatedAt.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                const timeAgo = diffDays > 0
                  ? `${diffDays}d ago`
                  : diffHours > 0
                    ? `${diffHours}h ago`
                    : 'Just now';
                // Mock unread status (could come from conversation data)
                const hasUnread = diffHours < 24;
                const isPremium = (agent as any).tier && (agent as any).tier !== 'free';
                return (
                  <Pressable
                    key={conversation.id}
                    onPress={() => router.push(`/chat/${agent.id}?conversationId=${conversation.id}`)}
                    className="mr-3 overflow-hidden"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      width: 170,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    {/* Gradient banner at top with letter */}
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        height: 56,
                        paddingHorizontal: 14,
                        paddingTop: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Text className="text-xl font-inter-bold text-white">
                        {initial}
                      </Text>
                      {isPremium && (
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: colors.premium }}
                        >
                          <Text className="text-xs font-inter-bold text-white">
                            P
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                    {/* Content below banner */}
                    <View className="px-3.5 py-3">
                      {/* Coach name */}
                      <Text
                        className="font-inter-semibold text-body mb-0.5"
                        style={{ color: colors.textPrimary }}
                        numberOfLines={1}
                      >
                        {agent.name}
                      </Text>
                      {/* Tagline/subtitle */}
                      <Text
                        className="text-caption mb-2.5"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={1}
                      >
                        {agent.tagline || 'AI Coach'}
                      </Text>
                      {/* Bottom row with unread badge and time */}
                      <View className="flex-row items-center">
                        {hasUnread && (
                          <View
                            className="px-2 py-0.5 rounded mr-2"
                            style={{ backgroundColor: colors.primaryLight }}
                          >
                            <Text
                              className="text-xs font-inter-medium"
                              style={{ color: colors.primary }}
                            >
                              Unread
                            </Text>
                          </View>
                        )}
                        <Text
                          className="text-caption"
                          style={{ color: colors.textTertiary }}
                        >
                          {timeAgo}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* Find Your Coach Card - Shows when no conversations */
          <FindYourCoachCard />
        )}

        {/* Categories */}
        <View className="mb-6">
          <View className="px-5 flex-row justify-between items-center mb-3">
            <Text className="text-section font-inter-semibold" style={{ color: colors.textPrimary }}>
              Categories
            </Text>
            <Pressable onPress={() => router.push('/explore')}>
              <Text className="text-body font-inter-bold" style={{ color: colors.primary }}>
                {'>>'}
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                emoji={category.emoji}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recommended for you (renamed from Featured Coaches) */}
        <View className="px-5 pb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-section font-inter-semibold" style={{ color: colors.textPrimary }}>
              Recommended for you
            </Text>
          </View>
          {isLoadingFeatured ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
              {featured.map((agent) => (
                <View key={agent.id} className="w-1/2 px-1.5 mb-3">
                  <CoachCard agent={agent} variant="grid" />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add Your Coach Footer */}
        <Pressable
          onPress={() => router.push('/explore')}
          className="mx-5 mb-8 py-4 px-4 flex-row items-center"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
          }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Text className="text-body-sm" style={{ color: colors.primary }}>🏠</Text>
          </View>
          <Text
            className="flex-1 font-inter-medium text-body"
            style={{ color: colors.textPrimary }}
          >
            Add your coach
          </Text>
          <Text
            className="text-body font-inter-medium"
            style={{ color: colors.primary }}
          >
            {'>'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
