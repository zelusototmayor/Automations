'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const userBenefits = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '5 Free Interactions',
    description: 'Try any coach with 5 free conversations. Experience their methodology and see if it\'s the right fit before committing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Subscribe to Your Favorites',
    description: 'Unlock unlimited access to coaches you love with a simple subscription. Cancel anytime, no long-term commitments.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '24/7 Availability',
    description: 'Your coaches are always available. Get guidance at 3am or during your lunch break - whenever inspiration strikes.',
  },
];

const coachBenefits = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Monthly Creator Fee',
    description: 'Simple, transparent pricing. Pay a monthly fee to host your coaching agents on our platform with no hidden costs.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Earn From Subscriptions',
    description: 'Keep the majority of subscription revenue. When users subscribe to your coach, you earn recurring income from your expertise.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Scale Without Limits',
    description: 'Help thousands of people simultaneously without any additional effort. Your knowledge works while you sleep.',
  },
];

export function PlatformEconomy() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section" style={{ background: 'var(--surface)' }}>
      <div className="container-landing">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="heading-section">The Better Coaching Economy</h2>
          <p className="mt-4 body-text text-lg max-w-2xl mx-auto">
            A fair marketplace where coaches monetize their expertise and users access world-class guidance at a fraction of traditional coaching costs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Users */}
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div
              className="card p-6 sm:p-8 h-full"
              style={{ background: 'var(--bg-base)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{ background: 'var(--lavender)', color: '#7C3AED' }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-card text-lg">For Users</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Access expert guidance affordably
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {userBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center"
                      style={{ background: 'var(--lavender)', color: '#7C3AED' }}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                        {benefit.title}
                      </h4>
                      <p className="body-sm mt-1">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 p-4 rounded-[14px]"
                style={{ background: 'var(--lavender)', opacity: 0.6 }}
              >
                <p className="text-sm font-medium" style={{ color: '#7C3AED' }}>
                  Traditional coaching: $200-500/hour
                </p>
                <p className="text-sm mt-1" style={{ color: '#7C3AED' }}>
                  Better Coaching: Unlimited access for a fraction of the cost
                </p>
              </div>
            </div>
          </div>

          {/* For Coaches */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div
              className="card p-6 sm:p-8 h-full"
              style={{ background: 'var(--bg-base)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-card text-lg">For Coaches</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Monetize your expertise at scale
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {coachBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center"
                      style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                        {benefit.title}
                      </h4>
                      <p className="body-sm mt-1">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 p-4 rounded-[14px]"
                style={{ background: 'var(--sage)', opacity: 0.6 }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--cta-end)' }}>
                  Your knowledge, working 24/7
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--cta-end)' }}>
                  Build passive income from expertise you already have
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How Revenue Works */}
        <div
          className={`mt-16 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className="card p-6 sm:p-8 text-center max-w-3xl mx-auto"
            style={{ background: 'var(--bg-base)' }}
          >
            <h3 className="heading-card text-lg mb-4">Simple, Transparent Economics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div
                  className="text-3xl font-bold mb-2"
                  style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  5
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Free interactions per coach for users
                </p>
              </div>
              <div>
                <div
                  className="text-3xl font-bold mb-2"
                  style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  70%+
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Revenue share for coaches
                </p>
              </div>
              <div>
                <div
                  className="text-3xl font-bold mb-2"
                  style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  24/7
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your AI coach never sleeps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
