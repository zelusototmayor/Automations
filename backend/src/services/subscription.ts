import { prisma } from './database';
import { SubscriptionTier } from '@prisma/client';

const FREE_TRIAL_MESSAGE_LIMIT = 5;

/**
 * Check if user has premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionExpiry: true,
    },
  });

  if (!user) return false;

  // Check if subscription is active
  if (user.subscriptionTier === 'FREE') return false;

  // Check expiry if set
  if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
    return false;
  }

  return true;
}

/**
 * Get the number of free trial messages used for a visitor+agent pair
 */
export async function getFreeTrialUsage(
  visitorId: string,
  agentId: string
): Promise<{ used: number; remaining: number; limit: number }> {
  const trial = await prisma.freeTrial.findUnique({
    where: {
      visitorId_agentId: {
        visitorId,
        agentId,
      },
    },
  });

  const used = trial?.messageCount ?? 0;
  return {
    used,
    remaining: Math.max(0, FREE_TRIAL_MESSAGE_LIMIT - used),
    limit: FREE_TRIAL_MESSAGE_LIMIT,
  };
}

/**
 * Check if user has exhausted their free trial with a specific coach
 */
export async function hasUsedFreeTrial(
  visitorId: string,
  agentId: string
): Promise<boolean> {
  const { remaining } = await getFreeTrialUsage(visitorId, agentId);
  return remaining <= 0;
}

/**
 * Record that a free trial message was sent (increment counter)
 */
export async function recordFreeTrial(
  visitorId: string,
  agentId: string
): Promise<void> {
  await prisma.freeTrial.upsert({
    where: {
      visitorId_agentId: {
        visitorId,
        agentId,
      },
    },
    create: {
      visitorId,
      agentId,
      messageCount: 1,
    },
    update: {
      messageCount: { increment: 1 },
    },
  });
}

/**
 * Check if user can send a message to a coach
 */
export async function canSendMessage(
  userId: string,
  agentId: string
): Promise<{ allowed: boolean; reason?: string; freeTrialRemaining?: number; freeTrialLimit?: number }> {
  // Check premium status
  const isPremium = await isPremiumUser(userId);
  if (isPremium) {
    return { allowed: true };
  }

  // Check if agent is FREE tier (unlimited for everyone)
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { tier: true },
  });
  if (agent?.tier === 'FREE') {
    return { allowed: true };
  }

  // Check free trial usage count
  const { remaining, limit } = await getFreeTrialUsage(userId, agentId);
  if (remaining > 0) {
    return {
      allowed: true,
      freeTrialRemaining: remaining - 1, // Will be this many after sending
      freeTrialLimit: limit,
    };
  }

  return {
    allowed: false,
    reason: 'FREE_TRIAL_EXHAUSTED',
    freeTrialRemaining: 0,
    freeTrialLimit: limit,
  };
}

/**
 * Check if user can create coaches (premium/creator only)
 */
export async function canCreateCoach(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionExpiry: true,
    },
  });

  if (!user) return false;

  // Must be PREMIUM or CREATOR tier
  if (user.subscriptionTier === 'FREE') return false;

  // Check expiry
  if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
    return false;
  }

  return true;
}

/**
 * Update subscription from RevenueCat webhook
 */
export async function updateSubscription(
  revenueCatUserId: string,
  status: string,
  productId: string | null,
  entitlements: string[],
  expiresAt: Date | null
): Promise<void> {
  // Find user by RevenueCat ID
  const user = await prisma.user.findUnique({
    where: { revenuecatId: revenueCatUserId },
  });

  if (!user) {
    console.error('User not found for RevenueCat ID:', revenueCatUserId);
    return;
  }

  // Determine subscription tier from entitlements
  let tier: SubscriptionTier = 'FREE';
  if (status === 'active') {
    if (entitlements.includes('creator')) {
      tier = 'CREATOR';
    } else if (entitlements.includes('premium')) {
      tier = 'PREMIUM';
    }
  }

  // Update user subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionExpiry: expiresAt,
    },
  });
}

/**
 * Link RevenueCat ID to user
 */
export async function linkRevenueCat(
  userId: string,
  revenueCatId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { revenuecatId: revenueCatId },
  });
}

/**
 * Get user's subscription info
 */
export async function getSubscriptionInfo(userId: string): Promise<{
  tier: SubscriptionTier;
  isPremium: boolean;
  expiresAt: Date | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionExpiry: true,
    },
  });

  if (!user) {
    return {
      tier: 'FREE',
      isPremium: false,
      expiresAt: null,
    };
  }

  const isPremium =
    user.subscriptionTier !== 'FREE' &&
    (!user.subscriptionExpiry || user.subscriptionExpiry > new Date());

  return {
    tier: user.subscriptionTier,
    isPremium,
    expiresAt: user.subscriptionExpiry,
  };
}
