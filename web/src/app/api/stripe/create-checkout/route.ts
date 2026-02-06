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

const backendApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !backendApiUrl) {
    return null;
  }

  try {
    const response = await fetch(`${backendApiUrl}/api/auth/me`, {
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user ? { id: data.user.id, email: data.user.email } : null;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

// Creator subscription price IDs - these will be created in Stripe Dashboard
// For now, we'll create them dynamically
const CREATOR_PRICES = {
  monthly: {
    amount: 1999, // $19.99 in cents
    interval: 'month' as const,
  },
  yearly: {
    amount: 9999, // $99.99 in cents
    interval: 'year' as const,
  },
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { billingPeriod } = await request.json();

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      );
    }

    const priceConfig = CREATOR_PRICES[billingPeriod as keyof typeof CREATOR_PRICES];

    // Get or create the product
    const products = await stripe.products.list({
      limit: 1,
      active: true,
    });

    let product = products.data.find(p => p.name === 'Creator Subscription');

    if (!product) {
      product = await stripe.products.create({
        name: 'Creator Subscription',
        description: 'Create unlimited AI coaching agents and earn revenue',
      });
    }

    // Get or create the price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    let price = prices.data.find(
      p => p.unit_amount === priceConfig.amount &&
           p.recurring?.interval === priceConfig.interval
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: 'usd',
        recurring: {
          interval: priceConfig.interval,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/become-creator/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/become-creator`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          type: 'creator_subscription',
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
