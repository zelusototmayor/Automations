import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentsStore } from '../../src/stores/agents';
import { useChatStore } from '../../src/stores/chat';
import { useAuthStore } from '../../src/stores/auth';
import { CoachCard } from '../../src/components/coaches/CoachCard';
import { FindYourCoachCard } from '../../src/components/coaches/FindYourCoachCard';
import { SearchBar, CategoryCard } from '../../src/components/ui';
import { ContextRefreshBanner } from '../../src/components/ContextRefreshBanner';
import { getAvatarByHash } from '../../src/utils/avatars';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V2 - SHARPER, GLASSIER AESTHETIC
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',           // CTA start (spec)
  sageDark: '#4F6F5A',       // CTA end (spec)
  sageLight: '#DCE9DF',      // Sage pastel (spec)
  surface: '#F5F5F7',        // NEW: Cool gray background (iOS-style)
  cardBg: 'rgba(255, 255, 255, 0.92)',  // NEW: Enhanced glass white
  cardBorder: '#D1D5DB',     // NEW: Darker, more visible borders
  textPrimary: '#111827',    // Spec primary text
  textSecondary: '#6B7280',  // Spec secondary text
  textMuted: '#9CA3AF',      // Spec muted text
};

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

  const { isAuthenticated, user, purchasedCoaches, purchasedCoachIds } = useAuthStore();

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

  // Deduplicate conversations by agent - keep only the most recent per agent
  const uniqueConversations = conversations.reduce((acc, conv) => {
    const agentId = conv.agent?.id || conv.agentId;
    if (!agentId) return acc;

    const existing = acc.get(agentId);
    if (!existing || new Date(conv.updatedAt) > new Date(existing.updatedAt)) {
      acc.set(agentId, conv);
    }
    return acc;
  }, new Map<string, typeof conversations[0]>());

  // Build "My Coaches" list: purchased coaches + recent conversation coaches
  // Purchased coaches come first, then any other recent conversations
  const myCoachItems: Array<{
    agentId: string;
    agentName: string;
    agentTagline?: string;
    agentAvatarUrl?: string;
    isPurchased: boolean;
    conversationId?: string;
    updatedAt?: string;
  }> = [];

  const addedAgentIds = new Set<string>();

  // Add purchased coaches first
  for (const coach of purchasedCoaches) {
    const conv = uniqueConversations.get(coach.id);
    myCoachItems.push({
      agentId: coach.id,
      agentName: coach.name,
      agentTagline: coach.tagline || undefined,
      agentAvatarUrl: coach.avatarUrl || undefined,
      isPurchased: true,
      conversationId: conv?.id,
      updatedAt: conv?.updatedAt,
    });
    addedAgentIds.add(coach.id);
  }

  // Add remaining recent conversations (not already in purchased)
  const sortedConversations = Array.from(uniqueConversations.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  for (const conv of sortedConversations) {
    const agentId = conv.agent?.id || conv.agentId;
    if (!agentId || addedAgentIds.has(agentId)) continue;
    myCoachItems.push({
      agentId,
      agentName: conv.agent?.name || 'Coach',
      agentTagline: conv.agent?.tagline || undefined,
      agentAvatarUrl: conv.agent?.avatarUrl || undefined,
      isPurchased: false,
      conversationId: conv.id,
      updatedAt: conv.updatedAt,
    });
    addedAgentIds.add(agentId);
  }

  // Check if user has any coaches or conversations
  const hasCoachItems = myCoachItems.length > 0;

  // Limit to 6 items
  const displayedCoachItems = myCoachItems.slice(0, 6);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
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
            tintColor={colors.sage}
          />
        }
      >
        {/* Search Bar at top */}
        <View className="px-5 pt-4 mb-4">
          <SearchBar
            editable={false}
            onPress={() => router.push('/explore')}
            placeholder="Search coaches..."
          />
        </View>

        {/* Context Refresh Banner - shows when context is stale */}
        {isAuthenticated && (
          <ContextRefreshBanner
            contextLastUpdatedAt={(user as any)?.contextLastUpdatedAt}
            contextNudgeDismissedAt={(user as any)?.contextNudgeDismissedAt}
          />
        )}

        {/* Conditional: My Coaches / Continue Section OR Find Your Coach Card */}
        {hasCoachItems ? (
          /* My Coaches Section - Shows purchased coaches + recent conversations */
          <View className="mb-6">
            <View className="px-5 flex-row justify-between items-center mb-3">
              <Text className="text-section font-inter-semibold text-text-primary">
                {purchasedCoaches.length > 0 ? 'My Coaches' : 'Continue'}
              </Text>
              <Text
                className="text-body-sm text-sage-600 font-inter-medium"
                onPress={() => router.push('/(tabs)/history')}
              >
                See all
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {displayedCoachItems.map((item) => {
                // Calculate time ago if there's a conversation
                let timeAgo = '';
                let hasUnread = false;
                if (item.updatedAt) {
                  const updatedAt = new Date(item.updatedAt);
                  const now = new Date();
                  const diffMs = now.getTime() - updatedAt.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffHours / 24);
                  timeAgo = diffDays > 0
                    ? `${diffDays}d ago`
                    : diffHours > 0
                      ? `${diffHours}h ago`
                      : 'Just now';
                  hasUnread = diffHours < 24;
                }

                return (
                  <Pressable
                    key={item.agentId}
                    onPress={() =>
                      item.conversationId
                        ? router.push(`/chat/${item.agentId}?conversationId=${item.conversationId}`)
                        : router.push(`/chat/${item.agentId}`)
                    }
                    className="mr-3 rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderWidth: 1.5,
                      borderColor: item.isPurchased ? colors.sage : colors.cardBorder,
                      width: 170,
                      shadowColor: '#111827',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    {/* Top section with avatar */}
                    <View
                      style={{
                        height: 72,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F5F5F7',
                        position: 'relative',
                      }}
                    >
                      {/* Purchased badge */}
                      {item.isPurchased && (
                        <View
                          className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full items-center justify-center"
                          style={{ backgroundColor: colors.sage }}
                        >
                          <Text className="text-[9px] font-inter-bold text-white">
                            Owned
                          </Text>
                        </View>
                      )}
                      {/* Avatar - image or local fallback */}
                      <Image
                        source={
                          item.agentAvatarUrl && item.agentAvatarUrl.startsWith('http')
                            ? { uri: item.agentAvatarUrl }
                            : getAvatarByHash(item.agentName)
                        }
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: '#E5E7EB',
                        }}
                      />
                    </View>
                    {/* Content below avatar */}
                    <View className="px-3.5 py-3">
                      {/* Coach name */}
                      <Text
                        className="font-inter-semibold text-body mb-0.5"
                        style={{ color: colors.textPrimary }}
                        numberOfLines={1}
                      >
                        {item.agentName}
                      </Text>
                      {/* Tagline/subtitle */}
                      <Text
                        className="text-caption mb-2.5"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={1}
                      >
                        {item.agentTagline || 'AI Coach'}
                      </Text>
                      {/* Bottom row with badge and time */}
                      <View className="flex-row items-center">
                        {timeAgo ? (
                          <>
                            {hasUnread && (
                              <View
                                className="px-2 py-0.5 rounded mr-2"
                                style={{ backgroundColor: '#F0EDE8' }}
                              >
                                <Text
                                  className="text-xs font-inter-medium"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Unread
                                </Text>
                              </View>
                            )}
                            <Text
                              className="text-caption"
                              style={{ color: colors.textMuted }}
                            >
                              {timeAgo}
                            </Text>
                          </>
                        ) : (
                          <Text
                            className="text-caption"
                            style={{ color: colors.sage }}
                          >
                            Start chatting
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* Find Your Coach Card - Shows when no conversations or purchases */
          <FindYourCoachCard />
        )}

        {/* Categories */}
        <View className="mb-6">
          <View className="px-5 flex-row justify-between items-center mb-3">
            <Text className="text-section font-inter-semibold text-text-primary">
              Categories
            </Text>
            <Text
              className="text-body font-inter-bold text-sage-600"
              onPress={() => router.push('/explore')}
            >
              {'>>'}
            </Text>
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
            <Text className="text-section font-inter-semibold text-text-primary">
              Recommended for you
            </Text>
          </View>
          {isLoadingFeatured ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={colors.sage} />
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
          className="mx-5 mb-8 py-4 px-4 flex-row items-center rounded-xl"
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 1.5,
            borderColor: colors.cardBorder,
            // Enhanced shadow
            shadowColor: '#111827',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.sageLight }}
          >
            <Text className="text-body-sm" style={{ color: colors.sageDark }}>+</Text>
          </View>
          <Text
            className="flex-1 font-inter-medium text-body"
            style={{ color: colors.textPrimary }}
          >
            Add your coach
          </Text>
          <Text
            className="text-body font-inter-medium"
            style={{ color: colors.sageDark }}
          >
            {'>'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
