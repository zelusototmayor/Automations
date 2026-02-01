'use client';

import { useState } from 'react';
import { VideoPlaceholder } from './VideoPlaceholder';
import { WaitlistModal } from './WaitlistModal';

export function Hero() {
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    // Show modal to collect user type
    setShowModal(true);
    setIsSubmitting(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEmail('');
  };

  return (
    <section className="section pt-12 sm:pt-16 lg:pt-20">
      <div className="container-landing">
        <div className="text-center max-w-3xl mx-auto animate-fade-up">
          <h1 className="heading-hero">
            Your expertise, amplified.
          </h1>

          <p className="mt-6 text-lg sm:text-xl body-text leading-relaxed">
            Create AI coaching agents from your knowledge, or discover the perfect coach for your journey. Join the waitlist to be first in line.
          </p>

          {/* Waitlist Form */}
          <form onSubmit={handleJoinWaitlist} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-5 py-3.5 rounded-[14px] text-base"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="btn btn-primary text-base px-8 py-3.5 w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
            </button>
          </form>

          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Be the first to know when we launch. No spam, ever.
          </p>
        </div>

        {/* Video Section */}
        <div className="mt-16 sm:mt-20 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <VideoPlaceholder />
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showModal}
        onClose={handleModalClose}
        email={email}
      />
    </section>
  );
}
