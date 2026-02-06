import { Router, Request, Response } from 'express';
// RevenueCat webhooks are not used for access control in the current model.

const router = Router();

// RevenueCat webhook event type
interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    id: string;
    type: string;
    app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    expiration_at_ms: number;
    environment: 'SANDBOX' | 'PRODUCTION';
    [key: string]: any;
  };
}

// In-memory deduplication (for simplicity - in production use Redis or database)
const processedEvents = new Set<string>();

/**
 * POST /webhooks/revenuecat - Handle RevenueCat events (no-op in current model)
 */
router.post('/revenuecat', async (req: Request, res: Response) => {
  try {
    // Verify webhook authenticity
    const authHeader = req.headers['authorization'];
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.error('Invalid webhook authorization');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload: RevenueCatWebhookEvent = req.body;
    const { event } = payload;

    console.log('RevenueCat webhook received:', event.type, event.id);

    // Skip sandbox events in production
    if (process.env.NODE_ENV === 'production' && event.environment === 'SANDBOX') {
      res.status(200).json({ received: true, skipped: 'sandbox' });
      return;
    }

    // Idempotency check - prevent duplicate processing
    if (processedEvents.has(event.id)) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    // Record the event for idempotency
    processedEvents.add(event.id);

    // Clean up old events (keep only last 1000)
    if (processedEvents.size > 1000) {
      const eventsArray = Array.from(processedEvents);
      processedEvents.clear();
      eventsArray.slice(-500).forEach((e) => processedEvents.add(e));
    }

    // No-op: RevenueCat webhooks are logged for monitoring only.
    console.log('RevenueCat webhook received (no-op):', event.type);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
