'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CreatorSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // In production, you'd verify the session with Stripe
    // For now, just show success after a brief delay
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--cta-end)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--sage)' }}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--cta-end)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Welcome, Creator!
        </h1>

        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Your subscription is active. You can now create AI coaching agents and start earning revenue.
        </p>

        <div className="space-y-4">
          <Link
            href="/agents/new"
            className="btn btn-primary w-full py-4 text-lg font-semibold block"
          >
            Create Your First Agent
          </Link>

          <Link
            href="/dashboard"
            className="btn btn-outline w-full py-3 block"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 text-left">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Start Tips:
          </h3>
          <ul className="space-y-3">
            {[
              'Define a clear niche and expertise area',
              'Upload your best knowledge documents',
              'Write a compelling greeting message',
              'Set a competitive price for your audience',
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
                >
                  {index + 1}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
