import { prisma } from './database';
import { SubscriptionTier, PriceTier } from '@prisma/client';

const FREE_TRIAL_MESSAGE_LIMIT = 5;

// RevenueCat product IDs mapped to price tiers
const PRODUCT_TO_TIER: Record<string, PriceTier> = {
  'tire_1': 'TIER_1',  // $19.99
  'tier_2': 'TIER_2',  // $49.99
  'tier_3': 'TIER_3',  // $99.99
};

const TIER_TO_PRODUCT: Record<PriceTier, string> = {
  'TIER_1': 'tire_1',
  'TIER_2': 'tier_2',
  'TIER_3': 'tier_3',
};

const TIER_PRICES: Record<PriceTier, number> = {
  'TIER_1': 19.99,
  'TIER_2': 49.99,
  'TIER_3': 99.99,
};

/**
 * Check if user is an active creator
 */
export async function isCreatorUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionExpiry: true,
    },
  });

  if (!user) return false;

  if (user.subscriptionTier !== 'CREATOR') return false;

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
): Promise<{
  allowed: boolean;
  reason?: string;
  freeTrialRemaining?: number;
  freeTrialLimit?: number;
  usedFreeTrial?: boolean;
}> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { creatorId: true, tier: true },
  });

  // If agent doesn't exist, let the caller handle the 404
  if (!agent) {
    return { allowed: false, reason: 'AGENT_NOT_FOUND' };
  }

  // Free coaches are unlimited (login still required by route auth)
  if (agent.tier === 'FREE') {
    return { allowed: true };
  }

  // Creator always has access
  if (agent.creatorId === userId) {
    return { allowed: true };
  }

  // Lifetime purchase grants access
  const hasPurchased = await hasUserPurchasedCoach(userId, agentId);
  if (hasPurchased) {
    return { allowed: true };
  }

  // Free trial usage count (per coach)
  const { remaining, limit } = await getFreeTrialUsage(userId, agentId);
  if (remaining > 0) {
    return {
      allowed: true,
      freeTrialRemaining: remaining - 1, // Will be this many after sending
      freeTrialLimit: limit,
      usedFreeTrial: true,
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
 * Check if user can create coaches (creator only)
 */
export async function canCreateCoach(userId: string): Promise<boolean> {
  return isCreatorUser(userId);
}

/**
 * Check if user has lifetime access to a specific coach
 * (creator or purchased access)
 */
export async function hasCoachAccess(
  userId: string,
  agentId: string
): Promise<boolean> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { creatorId: true, tier: true },
  });

  if (!agent) return false;

  // Free coaches are accessible to any authenticated user
  if (agent.tier === 'FREE') {
    return true;
  }

  if (agent.creatorId === userId) {
    return true;
  }

  return hasUserPurchasedCoach(userId, agentId);
}

/**
 * Update creator subscription (Stripe webhook)
 */
export async function updateCreatorSubscription(
  userId: string,
  status: 'active' | 'cancelled' | 'expired' | 'billing_issue',
  expiresAt: Date | null
): Promise<void> {
  let tier: SubscriptionTier = 'FREE';
  if (status === 'active') {
    tier = 'CREATOR';
  }

  await prisma.user.update({
    where: { id: userId },
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
  if (revenueCatId !== userId) {
    throw new Error('RevenueCat ID must match the authenticated user ID');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { revenuecatId: revenueCatId },
  });
}

/**
 * Get user's creator info
 */
export async function getCreatorInfo(userId: string): Promise<{
  tier: SubscriptionTier;
  isCreator: boolean;
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
      isCreator: false,
      expiresAt: null,
    };
  }

  const isCreator =
    user.subscriptionTier === 'CREATOR' &&
    (!user.subscriptionExpiry || user.subscriptionExpiry > new Date());

  return {
    tier: user.subscriptionTier,
    isCreator,
    expiresAt: user.subscriptionExpiry,
  };
}

// ============================================
// COACH PURCHASES (Per-coach lifetime access)
// ============================================

// ── RevenueCat v2 API ──────────────────────────────────────────────────

interface RevenueCatPurchase {
  id: string;
  customer_id: string;
  product_id: string;
  store: string;
  store_purchase_identifier: string;
  purchased_at: string;
  revenue_in_usd?: { amount: number; currency: string };
  status: 'owned' | 'refunded';
}

let cachedProjectId: string | null = null;

function getRevenueCatApiKey(): string {
  const apiKey = process.env.REVENUECAT_SECRET_KEY;
  if (!apiKey) {
    throw new Error('REVENUECAT_SECRET_KEY is not configured');
  }
  return apiKey;
}

async function getRevenueCatProjectId(): Promise<string> {
  if (cachedProjectId) return cachedProjectId;

  const explicit = process.env.REVENUECAT_PROJECT_ID;
  if (explicit) {
    cachedProjectId = explicit;
    return explicit;
  }

  // Auto-discover from v2 API
  const apiKey = getRevenueCatApiKey();
  const response = await fetch('https://api.revenuecat.com/v2/projects', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch RevenueCat projects: ${response.status} ${text}`);
  }

  const data = await response.json() as { items?: Array<{ id: string }> };
  if (!data.items?.length) {
    throw new Error('No RevenueCat projects found for this API key');
  }

  cachedProjectId = data.items[0].id;
  console.log('RevenueCat project ID auto-discovered:', cachedProjectId);
  return cachedProjectId;
}

async function fetchCustomerPurchases(appUserId: string): Promise<RevenueCatPurchase[]> {
  const apiKey = getRevenueCatApiKey();
  const projectId = await getRevenueCatProjectId();

  const response = await fetch(
    `https://api.revenuecat.com/v2/projects/${projectId}/customers/${appUserId}/purchases`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('RevenueCat v2 purchases fetch failed:', response.status, text);
    return [];
  }

  const data = await response.json() as { items?: RevenueCatPurchase[] };
  return data.items || [];
}

export async function verifyRevenueCatPurchase(
  appUserId: string,
  productId: string,
  transactionId?: string
): Promise<{ verified: boolean; transactionId?: string; purchaseDate?: Date }> {
  const purchases = await fetchCustomerPurchases(appUserId);

  // Filter to owned (not refunded) purchases for this product
  const matching = purchases.filter(
    (p) => p.product_id === productId && p.status === 'owned'
  );

  if (!matching.length) return { verified: false };

  // If a specific transaction ID was provided, try to match it
  if (transactionId) {
    const exact = matching.find(
      (p) => p.store_purchase_identifier === transactionId || p.id === transactionId
    );
    if (exact) {
      return {
        verified: true,
        transactionId: exact.store_purchase_identifier || exact.id,
        purchaseDate: new Date(exact.purchased_at),
      };
    }
  }

  // Fallback: use the most recent purchase for the product
  const sorted = [...matching].sort(
    (a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
  );
  const latest = sorted[0];

  return {
    verified: true,
    transactionId: latest.store_purchase_identifier || latest.id,
    purchaseDate: new Date(latest.purchased_at),
  };
}

/**
 * Check if user has purchased a specific coach
 */
export async function hasUserPurchasedCoach(
  userId: string,
  agentId: string
): Promise<boolean> {
  const purchase = await prisma.coachPurchase.findUnique({
    where: {
      userId_agentId: {
        userId,
        agentId,
      },
    },
  });
  return !!purchase;
}

/**
 * Record a coach purchase
 */
export async function recordCoachPurchase(
  userId: string,
  agentId: string,
  productId: string,
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  // Verify the product is valid
  if (!PRODUCT_TO_TIER[productId]) {
    return { success: false, error: 'Invalid product ID' };
  }

  // Check if already purchased
  const existing = await prisma.coachPurchase.findUnique({
    where: {
      userId_agentId: { userId, agentId },
    },
  });

  if (existing) {
    return { success: true }; // Already purchased, treat as success
  }

  // Verify agent exists and get its price tier + creator
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { priceTier: true, creatorId: true },
  });

  if (!agent) {
    return { success: false, error: 'Agent not found' };
  }

  // Verify product matches agent's price tier
  const expectedProduct = TIER_TO_PRODUCT[agent.priceTier];
  if (productId !== expectedProduct) {
    return { success: false, error: 'Product does not match agent price tier' };
  }

  // Verify purchase with RevenueCat before recording
  const verification = await verifyRevenueCatPurchase(userId, productId, transactionId);
  if (!verification.verified) {
    return { success: false, error: 'Purchase verification failed' };
  }

  // Record the purchase with creator attribution
  await prisma.coachPurchase.create({
    data: {
      userId,
      agentId,
      creatorId: agent.creatorId,
      productId,
      revenuecatTransactionId: verification.transactionId || transactionId,
      priceUsd: TIER_PRICES[agent.priceTier],
    },
  });

  return { success: true };
}

/**
 * Get all coaches a user has purchased
 */
export async function getUserPurchasedCoaches(userId: string): Promise<string[]> {
  const purchases = await prisma.coachPurchase.findMany({
    where: { userId },
    select: { agentId: true },
  });
  return purchases.map((p) => p.agentId);
}

/**
 * Get detailed purchase info for a user
 */
export async function getUserPurchases(userId: string): Promise<Array<{
  agentId: string;
  agentName: string;
  productId: string;
  priceUsd: number | null;
  purchasedAt: Date;
}>> {
  const purchases = await prisma.coachPurchase.findMany({
    where: { userId },
    include: {
      agent: {
        select: { name: true },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });

  return purchases.map((p) => ({
    agentId: p.agentId,
    agentName: p.agent.name,
    productId: p.productId,
    priceUsd: p.priceUsd,
    purchasedAt: p.purchasedAt,
  }));
}

/**
 * Reconcile user's recorded purchases against RevenueCat (remove refunded/invalid)
 */
export async function reconcileUserPurchases(userId: string): Promise<{ removed: number; kept: number }> {
  const purchases = await prisma.coachPurchase.findMany({
    where: { userId },
    select: { id: true, productId: true, revenuecatTransactionId: true },
  });

  let removed = 0;

  for (const purchase of purchases) {
    try {
      const verification = await verifyRevenueCatPurchase(
        userId,
        purchase.productId,
        purchase.revenuecatTransactionId || undefined
      );

      if (!verification.verified) {
        await prisma.coachPurchase.delete({ where: { id: purchase.id } });
        removed++;
      }
    } catch (error) {
      // If RevenueCat is unavailable, keep existing access
      console.error('Purchase reconciliation failed:', error);
    }
  }

  return { removed, kept: purchases.length - removed };
}

/**
 * Get the RevenueCat product ID for an agent's price tier
 */
export function getProductIdForAgent(priceTier: PriceTier): string {
  return TIER_TO_PRODUCT[priceTier];
}

/**
 * Get price tier info
 */
export function getPriceTierInfo(priceTier: PriceTier): { productId: string; priceUsd: number } {
  return {
    productId: TIER_TO_PRODUCT[priceTier],
    priceUsd: TIER_PRICES[priceTier],
  };
}
