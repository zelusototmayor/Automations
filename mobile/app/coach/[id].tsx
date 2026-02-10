import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentsStore } from '../../src/stores/agents';
import { useAuthStore } from '../../src/stores/auth';
import { StarRating, SessionCount, ResponseTime } from '../../src/components/ui/Rating';
import { TierBadge, VerifiedBadge, Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import type { Agent, PriceTier } from '../../src/types';
import { PRICE_TIER_INFO } from '../../src/types';
import * as revenuecat from '../../src/services/revenuecat';
import { recordCoachPurchase, getFreeTrialUsage } from '../../src/services/api';
import { getAvatarByHash } from '../../src/utils/avatars';

export default function CoachDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [productPrice, setProductPrice] = useState<string | null>(null);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const [trialLimit, setTrialLimit] = useState<number>(5);

  const { fetchAgent } = useAgentsStore();
  const { isAuthenticated, hasAccessToCoach, addPurchasedCoach } = useAuthStore();

  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      const data = await fetchAgent(id!);
      setAgent(data);

      // Load product price if this is a paid coach
      if (data?.tier?.toUpperCase() === 'PREMIUM' && data?.priceTier) {
        const product = await revenuecat.getProductForTier(data.priceTier as revenuecat.PriceTier);
        if (product) {
          setProductPrice(product.priceString);
        } else {
          // Fallback to static price info
          setProductPrice(PRICE_TIER_INFO[data.priceTier as PriceTier]?.label || '$19.99');
        }
      }

      // Load free trial usage if authenticated
      if (isAuthenticated) {
        try {
          const trial = await getFreeTrialUsage(id!);
          if (!trial.hasAccess && trial.remaining !== undefined) {
            setTrialRemaining(trial.remaining);
            setTrialLimit(trial.limit || 5);
          }
        } catch (e) {
          // Non-critical, ignore
        }
      }
    } catch (error) {
      console.error('Error loading agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has access to this coach
  // Note: Prisma returns camelCase (creatorId) from API
  const creatorId = (agent as any)?.creatorId || agent?.creator_id;
  const hasAccess = agent
    ? hasAccessToCoach(agent.id, agent.tier, creatorId)
    : false;
  const isFreeCoach = agent?.tier?.toUpperCase() === 'FREE';

  const handleStartChat = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    router.push(`/chat/${id}`);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!agent?.priceTier) {
      Alert.alert('Error', 'This coach is not available for purchase');
      return;
    }

    setIsPurchasing(true);
    try {
      // Purchase through RevenueCat
      const result = await revenuecat.purchaseCoachAccess(agent.priceTier as revenuecat.PriceTier);

      if (result) {
        // Record purchase in backend
        const productId = revenuecat.getProductIdForTier(agent.priceTier as revenuecat.PriceTier);
        await recordCoachPurchase(agent.id, productId, result.transactionId);

        // Update local state
        addPurchasedCoach(agent.id);

        Alert.alert(
          'Purchase Complete!',
          `You now have lifetime access to ${agent.name}.`,
          [{ text: 'Start Chatting', onPress: () => router.push(`/chat/${id}`) }]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Please try again');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator color="#2563EB" size="large" />
        <Text className="text-body-sm text-text-muted mt-3">Loading coach...</Text>
      </SafeAreaView>
    );
  }

  if (!agent) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center px-5">
        <Text className="text-5xl mb-4"></Text>
        <Text className="text-h3 font-inter-semibold text-text-primary mb-2">
          Coach not found
        </Text>
        <Text className="text-body text-text-secondary text-center mb-6">
          This coach may have been removed or is unavailable
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100 }}
      >
        {/* Hero Section */}
        <View className="items-center px-5 pb-6">
          {/* Avatar */}
          <Image
            source={
              agent.avatar_url && agent.avatar_url.startsWith('http')
                ? { uri: agent.avatar_url }
                : getAvatarByHash(agent.name)
            }
            style={styles.avatar}
          />

          {/* Name and Verification */}
          <View className="flex-row items-center mb-2">
            <Text className="text-h1 font-inter-bold text-text-primary text-center">
              {agent.name}
            </Text>
            {agent.is_verified && (
              <View className="ml-2">
                <VerifiedBadge showLabel />
              </View>
            )}
          </View>

          {/* Tagline */}
          <Text className="text-body text-text-secondary text-center mb-4">
            {agent.tagline}
          </Text>

          {/* Trust Signals Row */}
          <View className="flex-row items-center gap-3 mb-4">
            <TierBadge
              tier={(agent.tier?.toUpperCase() || 'FREE') as 'FREE' | 'PREMIUM' | 'CREATOR'}
              size="md"
            />
            {agent.rating_avg && (
              <StarRating
                rating={agent.rating_avg}
                reviewCount={agent.rating_count}
                size="md"
              />
            )}
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center gap-4">
            <SessionCount count={agent.usage_count || 0} size="md" />
            {agent.response_time_minutes && (
              <ResponseTime minutes={agent.response_time_minutes} size="md" />
            )}
          </View>
        </View>

        {/* About Section */}
        {agent.description && (
          <View className="px-5 mb-6">
            <Text className="text-caption font-inter-semibold text-text-muted uppercase tracking-wide mb-2">
              About
            </Text>
            <View className="bg-white rounded-card p-card-padding shadow-card border border-border">
              <Text className="text-body text-text-primary leading-6">
                {agent.description}
              </Text>
            </View>
          </View>
        )}

        {/* Expertise Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <View className="px-5 mb-6">
            <Text className="text-caption font-inter-semibold text-text-muted uppercase tracking-wide mb-2">
              Expertise
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="default" size="md">
                  {tag}
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* Conversation Starters */}
        {agent.conversation_starters && agent.conversation_starters.length > 0 && (
          <View className="px-5 mb-6">
            <Text className="text-caption font-inter-semibold text-text-muted uppercase tracking-wide mb-2">
              Try Asking
            </Text>
            {agent.conversation_starters.map((starter, index) => (
              <Pressable
                key={index}
                onPress={handleStartChat}
                className="bg-white rounded-card p-card-padding mb-2 flex-row items-center shadow-card border border-border active:bg-neutral-50"
              >
                <Text className="text-primary-600 mr-3"></Text>
                <Text className="text-body text-text-primary flex-1" numberOfLines={2}>
                  {starter}
                </Text>
                <Text className="text-neutral-300 ml-2">→</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Stats Section */}
        <View className="px-5 mb-6">
          <Text className="text-caption font-inter-semibold text-text-muted uppercase tracking-wide mb-2">
            Statistics
          </Text>
          <View className="bg-white rounded-card p-card-padding flex-row shadow-card border border-border">
            <View className="flex-1 items-center">
              <Text className="text-h2 font-inter-bold text-text-primary">
                {agent.usage_count || 0}
              </Text>
              <Text className="text-body-sm text-text-secondary">Sessions</Text>
            </View>
            <View className="w-px bg-neutral-200" />
            <View className="flex-1 items-center">
              <Text className="text-h2 font-inter-bold text-text-primary">
                {agent.rating_count || 0}
              </Text>
              <Text className="text-body-sm text-text-secondary">Reviews</Text>
            </View>
            {agent.rating_avg && (
              <>
                <View className="w-px bg-neutral-200" />
                <View className="flex-1 items-center">
                  <Text className="text-h2 font-inter-bold text-text-primary">
                    {agent.rating_avg.toFixed(1)}
                  </Text>
                  <Text className="text-body-sm text-text-secondary">Rating</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Access Status Note */}
        {agent.tier?.toUpperCase() === 'PREMIUM' && !hasAccess && (
          <View className="px-5 mb-6">
            <View className="bg-primary-50 rounded-card p-card-padding border border-primary-100">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">✨</Text>
                <View className="flex-1">
                  <Text className="text-body font-inter-semibold text-primary-800">
                    Free Preview Available
                  </Text>
                  <Text className="text-body-sm text-primary-600">
                    {trialRemaining !== null
                      ? `${trialRemaining} of ${trialLimit} free messages remaining`
                      : `Try ${trialLimit} free messages, then unlock for lifetime access`}
                  </Text>
                </View>
              </View>
              {/* Progress bar */}
              {trialRemaining !== null && (
                <View className="mt-3 rounded-full overflow-hidden" style={{ height: 4, backgroundColor: '#E5E7EB' }}>
                  <View
                    className="rounded-full"
                    style={{
                      height: 4,
                      width: `${((trialLimit - trialRemaining) / trialLimit) * 100}%`,
                      backgroundColor: trialRemaining === 0 ? '#EF4444' : '#6F8F79',
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Purchased Status */}
        {agent.tier?.toUpperCase() === 'PREMIUM' && hasAccess && (
          <View className="px-5 mb-6">
            <View className="bg-green-50 rounded-card p-card-padding flex-row items-center border border-green-100">
              <Text className="text-2xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-body font-inter-semibold text-green-800">
                  Lifetime Access Unlocked
                </Text>
                <Text className="text-body-sm text-green-600">
                  You have unlimited access to this coach
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Spacer for fixed button */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Floating CTA Button */}
      <View style={styles.ctaContainer}>
        {isFreeCoach || hasAccess ? (
          <Pressable
            onPress={handleStartChat}
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          >
            <Text style={styles.ctaButtonText}>
              {!isAuthenticated ? 'Sign In to Chat' : 'Start Chatting'}
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleStartChat}
              style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            >
              <Text style={styles.ctaButtonText}>
                {trialRemaining !== null && trialRemaining > 0
                  ? `Try Free · ${trialRemaining} of ${trialLimit} left`
                  : 'Start Chatting'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handlePurchase}
              disabled={isPurchasing}
              style={({ pressed }) => [
                styles.ctaButtonOutline,
                pressed && styles.ctaButtonOutlinePressed,
                isPurchasing && styles.ctaButtonDisabled,
              ]}
            >
              <Text style={styles.ctaButtonOutlineText}>
                {isPurchasing
                  ? 'Processing...'
                  : `Unlock Full Coach · ${productPrice || PRICE_TIER_INFO[agent.priceTier as PriceTier]?.label || '$19.99'}`}
              </Text>
            </Pressable>
            <Text style={styles.ctaSubtext}>
              One-time purchase · Lifetime access
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#F5F5F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ctaButton: {
    backgroundColor: '#4F6F5A',
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F3F2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonPressed: {
    backgroundColor: '#3D5A47',
    shadowOpacity: 0.15,
  },
  ctaButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4F6F5A',
  },
  ctaButtonOutlinePressed: {
    backgroundColor: '#F0F5F1',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  ctaButtonOutlineText: {
    color: '#4F6F5A',
    fontSize: 17,
    fontWeight: '700',
  },
  ctaSubtext: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
