import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2026-01-28.clover',
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const backendApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
const creatorWebhookSecret = process.env.CREATOR_WEBHOOK_SECRET;

async function notifyCreatorStatusUpdate(
  userId: string,
  status: 'active' | 'cancelled' | 'expired' | 'billing_issue',
  expiresAt?: number | null
) {
  if (!backendApiUrl || !creatorWebhookSecret) {
    console.error('Missing BACKEND_API_URL or CREATOR_WEBHOOK_SECRET');
    return;
  }

  try {
    await fetch(`${backendApiUrl}/api/users/creator/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-webhook-secret': creatorWebhookSecret,
      },
      body: JSON.stringify({
        userId,
        status,
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
      }),
    });
  } catch (error) {
    console.error('Failed to notify backend creator status:', error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout completed:', session.id);
        // Subscription events will update creator status; no-op here.
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        const userId = subscription.metadata?.userId;
        if (userId) {
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await notifyCreatorStatusUpdate(userId, 'active', periodEnd);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);
        const userId = subscription.metadata?.userId;
        if (userId) {
          const status = subscription.status;
          let creatorStatus: 'active' | 'billing_issue' | 'expired' = 'billing_issue';
          if (status === 'active' || status === 'trialing') {
            creatorStatus = 'active';
          } else if (status === 'past_due' || status === 'unpaid') {
            creatorStatus = 'billing_issue';
          } else if (status === 'canceled') {
            creatorStatus = 'expired';
          }
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await notifyCreatorStatusUpdate(userId, creatorStatus, periodEnd);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);
        const userId = subscription.metadata?.userId;
        if (userId) {
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await notifyCreatorStatusUpdate(userId, 'expired', periodEnd);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);
        const subscriptionId = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;
        if (subId) {
          try {
            const stripe = getStripe();
            const subscription = await stripe.subscriptions.retrieve(subId);
            const userId = subscription.metadata?.userId;
            if (userId) {
              const periodEnd = subscription.items.data[0]?.current_period_end;
              await notifyCreatorStatusUpdate(userId, 'billing_issue', periodEnd);
            }
          } catch (error) {
            console.error('Failed to retrieve subscription for billing issue:', error);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
