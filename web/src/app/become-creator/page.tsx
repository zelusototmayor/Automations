'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

type BillingPeriod = 'monthly' | 'yearly';

const PRICING = {
  monthly: {
    price: 19.99,
    period: 'month',
    savings: null,
  },
  yearly: {
    price: 99.99,
    period: 'year',
    savings: 'Save $140/year',
  },
};

const BENEFITS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Create Unlimited Agents',
    description: 'Build as many AI coaching agents as you want, each with unique expertise and personality.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Earn 65% Revenue Share',
    description: 'Keep the majority of subscription revenue when users subscribe to your coaching agents.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics Dashboard',
    description: 'Track your agents\' performance, subscriber growth, and earnings in real-time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Voice Cloning',
    description: 'Add your voice to your agents for a truly personal coaching experience.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Knowledge Upload',
    description: 'Upload documents, frameworks, and methodologies to train your agents.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Priority Support',
    description: 'Get help when you need it with dedicated creator support.',
  },
];

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push('/login?redirect=/become-creator');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPricing = PRICING[billingPeriod];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Better Coaching
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium"
              style={{ color: 'var(--cta-end)' }}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-outline text-sm px-4 py-2"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
          >
            Creator Subscription
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Turn Your Expertise Into Revenue
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Create AI coaching agents that share your knowledge and earn money while you sleep.
            Join hundreds of coaches building the future of personalized guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pricing Card */}
          <div className="order-2 lg:order-1">
            <div
              className="card p-8 sticky top-8"
              style={{ background: 'var(--surface)' }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Choose Your Plan
              </h2>

              {/* Billing Toggle */}
              <div className="flex rounded-xl p-1 mb-8" style={{ background: 'var(--bg-base)' }}>
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    billingPeriod === 'monthly' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    background: billingPeriod === 'monthly' ? 'var(--surface)' : 'transparent',
                    color: billingPeriod === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    billingPeriod === 'yearly' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    background: billingPeriod === 'yearly' ? 'var(--surface)' : 'transparent',
                    color: billingPeriod === 'yearly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  Yearly
                  {PRICING.yearly.savings && (
                    <span
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
                    >
                      {PRICING.yearly.savings}
                    </span>
                  )}
                </button>
              </div>

              {/* Price Display */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${selectedPricing.price}
                  </span>
                  <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    /{selectedPricing.period}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Billed annually (${(99.99).toFixed(2)}/year)
                  </p>
                )}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="btn btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Start Creating Agents'}
              </button>

              <p className="text-center text-sm mt-4" style={{ color: 'var(--text-placeholder)' }}>
                Cancel anytime. 7-day money-back guarantee.
              </p>

              {/* What's Included */}
              <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  What&apos;s included:
                </h3>
                <ul className="space-y-3">
                  {[
                    'Unlimited AI coaching agents',
                    '65% revenue share on subscriptions',
                    'Voice cloning for your agents',
                    'Knowledge document uploads',
                    'Analytics dashboard',
                    'Priority creator support',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: 'var(--cta-end)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Why Become a Creator?
            </h2>
            <div className="grid gap-6">
              {BENEFITS.map((benefit, index) => (
                <div
                  key={index}
                  className="card p-6 flex gap-4"
                  style={{ background: 'var(--surface)' }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
                  >
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Split Explanation */}
            <div
              className="card p-6 mt-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                How Revenue is Split
              </h3>

              {/* Visual Split Bar */}
              <div className="h-8 rounded-full overflow-hidden flex mb-4">
                <div className="h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: '65%', background: 'var(--cta-end)' }}>
                  65% You
                </div>
                <div className="h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: '30%', background: '#6B7280' }}>
                  30% Apple
                </div>
                <div className="h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: '5%', background: '#9CA3AF' }}>
                </div>
              </div>

              {/* Split Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'var(--cta-end)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Your earnings</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--cta-end)' }}>65%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#6B7280' }}></div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Apple App Store fee</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#9CA3AF' }}></div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Platform fee</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>5%</span>
                </div>
              </div>

              {/* Earnings Examples */}
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Example: With 100 subscribers
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-base)' }}>
                    <div className="text-lg font-bold" style={{ color: 'var(--cta-end)' }}>$519</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>@ $7.99/mo</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-base)' }}>
                    <div className="text-lg font-bold" style={{ color: 'var(--cta-end)' }}>$1,299</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>@ $19.99/mo</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-base)' }}>
                    <div className="text-lg font-bold" style={{ color: 'var(--cta-end)' }}>$3,249</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>@ $49.99/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How does the revenue share work?',
                a: 'You keep 65% of all subscription revenue from your agents. Apple takes 30%, and we take a 5% platform fee. For example, if someone subscribes to your $19.99/month agent, you earn $12.99/month.',
              },
              {
                q: 'Can I set my own prices?',
                a: 'Yes! You can choose from three price tiers: $7.99, $19.99, or $49.99 per month. Pick the tier that matches the value you provide.',
              },
              {
                q: 'What happens if I cancel my creator subscription?',
                a: 'Your existing agents will continue to work, but you won\'t be able to create new agents or edit existing ones until you resubscribe.',
              },
              {
                q: 'How do I get paid?',
                a: 'We process payouts monthly via direct deposit or PayPal. You\'ll need to reach a minimum of $50 in earnings before your first payout.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="card p-6"
                style={{ background: 'var(--surface)' }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
            &copy; {new Date().getFullYear()} Better Coaching. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
