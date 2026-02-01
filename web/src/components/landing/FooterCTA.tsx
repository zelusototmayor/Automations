'use client';

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { WaitlistModal } from './WaitlistModal';

export function FooterCTA() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEmail('');
  };

  return (
    <section ref={ref} className="section">
      <div className="container-landing">
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="heading-section">Ready to get started?</h2>
          <p className="mt-4 body-text text-lg">
            Whether you want to share your expertise or find the guidance you need, join the waitlist to be first in line.
          </p>

          {/* Waitlist Form */}
          <form onSubmit={handleJoinWaitlist} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
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
              disabled={!email}
              className="btn btn-primary text-base px-8 py-3.5 w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
            >
              Join the Waitlist
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="meta-text">
              &copy; {new Date().getFullYear()} Better Coaching. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="meta-text hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="meta-text hover:text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
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
