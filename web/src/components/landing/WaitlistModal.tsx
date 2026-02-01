'use client';

import { useState } from 'react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

type UserType = 'coach' | 'user' | null;

export function WaitlistModal({ isOpen, onClose, email }: WaitlistModalProps) {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);

    // TODO: Send to backend/database
    // For now, just log it
    console.log('Waitlist submission:', { email, userType: selectedType });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setSelectedType(null);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-[22px] p-6 sm:p-8 animate-fade-up"
        style={{
          background: 'var(--bg-base)',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-black/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubmitted ? (
          <>
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-4"
                style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="heading-card text-xl">Almost there!</h3>
              <p className="mt-2 body-text">
                Help us personalize your experience. What brings you to Better Coaching?
              </p>
            </div>

            <div className="space-y-3">
              {/* Coach option */}
              <button
                onClick={() => setSelectedType('coach')}
                className={`w-full p-4 rounded-[14px] text-left transition-all ${
                  selectedType === 'coach' ? 'ring-2 ring-emerald-500' : ''
                }`}
                style={{
                  background: selectedType === 'coach' ? 'var(--sage)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{
                      background: selectedType === 'coach' ? 'var(--cta-end)' : 'var(--sage)',
                      color: selectedType === 'coach' ? 'white' : 'var(--cta-end)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      I want to be a coach
                    </h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Create AI agents from my expertise and earn revenue
                    </p>
                  </div>
                </div>
              </button>

              {/* User option */}
              <button
                onClick={() => setSelectedType('user')}
                className={`w-full p-4 rounded-[14px] text-left transition-all ${
                  selectedType === 'user' ? 'ring-2 ring-purple-500' : ''
                }`}
                style={{
                  background: selectedType === 'user' ? 'var(--lavender)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{
                      background: selectedType === 'user' ? '#7C3AED' : 'var(--lavender)',
                      color: selectedType === 'user' ? 'white' : '#7C3AED'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      I want to find coaches
                    </h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Get personalized guidance from AI coaching agents
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedType || isSubmitting}
              className="btn btn-primary w-full mt-6 py-3.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="heading-card text-xl">You&apos;re on the list!</h3>
            <p className="mt-3 body-text">
              Thanks for joining! We&apos;ll notify you at <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{email}</span> when we launch.
            </p>
            <button
              onClick={handleClose}
              className="btn btn-outline mt-6 px-8 py-2.5"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
