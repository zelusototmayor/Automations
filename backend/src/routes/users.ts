import { Router, Request, Response } from 'express';
import { prisma } from '../services/database';
import { authenticate } from '../middleware/auth';
import {
  getCreatorInfo,
  linkRevenueCat,
  getUserPurchases,
  getUserPurchasedCoaches,
  recordCoachPurchase,
  hasUserPurchasedCoach,
  reconcileUserPurchases,
  updateCreatorSubscription,
} from '../services/subscription';

const router = Router();

// User context type
interface UserContext {
  name?: string;
  about?: string;
  values?: string[];
  goals?: string;
  challenges?: string;
  additional?: string;
}

/**
 * GET /users/me - Get current user profile
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        context: true,
        hasCompletedOnboarding: true,
        contextLastUpdatedAt: true,
        contextNudgeDismissedAt: true,
        subscriptionTier: true,
        subscriptionExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get creator status
    const creator = await getCreatorInfo(userId);

    res.json({
      user,
      creator,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /users/me - Update user profile
 */
router.patch('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, avatar_url } = req.body;

    const updateData: { name?: string; avatarUrl?: string } = {};

    if (name !== undefined) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatarUrl = avatar_url;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        context: true,
        subscriptionTier: true,
        subscriptionExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * GET /users/me/context - Get user's personal context
 */
router.get('/me/context', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { context: true },
    });

    res.json({ context: user?.context || {} });
  } catch (error) {
    console.error('Error fetching context:', error);
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

/**
 * PATCH /users/me/context - Update user's personal context
 */
router.patch('/me/context', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const context: UserContext = req.body;

    // Validate context fields
    const validContext: UserContext = {};
    if (context.name !== undefined) validContext.name = String(context.name).slice(0, 100);
    if (context.about !== undefined) validContext.about = String(context.about).slice(0, 1000);
    if (context.values !== undefined && Array.isArray(context.values)) {
      validContext.values = context.values.slice(0, 10).map((v) => String(v).slice(0, 50));
    }
    if (context.goals !== undefined) validContext.goals = String(context.goals).slice(0, 1000);
    if (context.challenges !== undefined) validContext.challenges = String(context.challenges).slice(0, 1000);
    if (context.additional !== undefined) validContext.additional = String(context.additional).slice(0, 1000);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        context: validContext as any,
        contextLastUpdatedAt: new Date(),
      },
      select: { context: true },
    });

    res.json({ context: user?.context || {} });
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

/**
 * POST /users/me/complete-onboarding - Mark onboarding as complete
 */
router.post('/me/complete-onboarding', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true,
        contextLastUpdatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        context: true,
        hasCompletedOnboarding: true,
        subscriptionTier: true,
        subscriptionExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

/**
 * POST /users/me/dismiss-context-nudge - Dismiss the context refresh nudge
 */
router.post('/me/dismiss-context-nudge', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.user.update({
      where: { id: userId },
      data: { contextNudgeDismissedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error dismissing nudge:', error);
    res.status(500).json({ error: 'Failed to dismiss nudge' });
  }
});

/**
 * PATCH /users/me/push-token - Update push notification token
 */
router.patch('/me/push-token', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { push_token } = req.body;

    if (!push_token || typeof push_token !== 'string') {
      res.status(400).json({ error: 'Missing or invalid push_token' });
      return;
    }

    // Validate Expo push token format (ExponentPushToken[xxx])
    if (!push_token.startsWith('ExponentPushToken[')) {
      res.status(400).json({ error: 'Invalid push token format' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        pushToken: push_token,
        pushTokenUpdatedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

/**
 * POST /users/me/revenuecat - Link RevenueCat user ID
 */
router.post('/me/revenuecat', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { revenuecat_id } = req.body;

    if (!revenuecat_id) {
      res.status(400).json({ error: 'Missing revenuecat_id' });
      return;
    }

    try {
      await linkRevenueCat(userId, revenuecat_id);
    } catch (linkError: any) {
      res.status(400).json({ error: linkError.message || 'Invalid RevenueCat ID' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        subscriptionTier: true,
        subscriptionExpiry: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error linking RevenueCat:', error);
    res.status(500).json({ error: 'Failed to link RevenueCat' });
  }
});

// ============================================
// COACH PURCHASES
// ============================================

/**
 * GET /users/me/purchased-coaches - Get purchased coaches with full agent details
 */
router.get('/me/purchased-coaches', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const purchases = await prisma.coachPurchase.findMany({
      where: { userId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            tagline: true,
            avatarUrl: true,
            category: true,
            tier: true,
            priceTier: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const coachIds = purchases.map((p) => p.agentId);
    const coaches = purchases.map((p) => p.agent);

    res.json({ coachIds, coaches });
  } catch (error) {
    console.error('Error fetching purchased coaches:', error);
    res.status(500).json({ error: 'Failed to fetch purchased coaches' });
  }
});

/**
 * GET /users/me/purchases - Get detailed purchase history
 */
router.get('/me/purchases', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const purchases = await getUserPurchases(userId);
    res.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

/**
 * POST /users/me/purchases/reconcile - Reconcile purchases with RevenueCat
 * Removes refunded/invalid purchases from local records
 */
router.post('/me/purchases/reconcile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { removed, kept } = await reconcileUserPurchases(userId);
    const purchases = await getUserPurchases(userId);
    res.json({ removed, kept, purchases });
  } catch (error) {
    console.error('Error reconciling purchases:', error);
    res.status(500).json({ error: 'Failed to reconcile purchases' });
  }
});

/**
 * POST /users/me/purchases - Record a coach purchase
 * Called from mobile app after RevenueCat purchase completes
 */
router.post('/me/purchases', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { agent_id, product_id, transaction_id } = req.body;

    if (!agent_id || !product_id) {
      res.status(400).json({ error: 'Missing agent_id or product_id' });
      return;
    }

    const result = await recordCoachPurchase(userId, agent_id, product_id, transaction_id);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

/**
 * GET /users/me/purchases/:agentId - Check if user has purchased a specific coach
 */
router.get('/me/purchases/:agentId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;

    const hasPurchased = await hasUserPurchasedCoach(userId, agentId);
    res.json({ hasPurchased });
  } catch (error) {
    console.error('Error checking purchase:', error);
    res.status(500).json({ error: 'Failed to check purchase' });
  }
});

/**
 * POST /users/creator/subscription - Update creator subscription (Stripe webhook)
 * Protected by CREATOR_WEBHOOK_SECRET
 */
router.post('/creator/subscription', async (req: Request, res: Response) => {
  try {
    const expectedSecret = process.env.CREATOR_WEBHOOK_SECRET;
    const providedSecret = req.headers['x-creator-webhook-secret'];

    if (!expectedSecret || providedSecret !== expectedSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId, status, expiresAt } = req.body as {
      userId?: string;
      status?: 'active' | 'cancelled' | 'expired' | 'billing_issue';
      expiresAt?: string | null;
    };

    if (!userId || !status) {
      res.status(400).json({ error: 'Missing userId or status' });
      return;
    }

    const expiryDate = expiresAt ? new Date(expiresAt) : null;
    await updateCreatorSubscription(userId, status, expiryDate);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating creator subscription:', error);
    res.status(500).json({ error: 'Failed to update creator subscription' });
  }
});

export default router;
