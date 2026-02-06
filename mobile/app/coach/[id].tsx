import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
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
          <View className="bg-primary-50 rounded-2xl w-28 h-28 items-center justify-center mb-4 shadow-card">
            <Text className="text-6xl">{agent.avatar_url || ''}</Text>
          </View>

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
        <View className="h-28" />
      </ScrollView>

      {/* Fixed CTA Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 pb-8">
        {isFreeCoach ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleStartChat}
          >
            {isAuthenticated ? 'Start Chatting' : 'Sign In to Chat'}
          </Button>
        ) : hasAccess ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleStartChat}
          >
            Start Chatting
          </Button>
        ) : (
          <View>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleStartChat}
              disabled={isPurchasing}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={handlePurchase}
              loading={isPurchasing}
              disabled={isPurchasing}
              className="mt-3"
            >
              {isPurchasing ? 'Processing...' : `Unlock Coach · ${productPrice || PRICE_TIER_INFO[agent.priceTier as PriceTier]?.label || '$19.99'}`}
            </Button>
            <Text className="text-caption text-text-muted text-center mt-2">
              One-time purchase · Lifetime access
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
