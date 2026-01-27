'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const creatorSteps = [
  { step: 1, title: 'Define personality', description: 'Set your coaching style and approach' },
  { step: 2, title: 'Upload knowledge', description: 'Add your expertise and methodologies' },
  { step: 3, title: 'Publish', description: 'Make your agent available to users' },
];

const userSteps = [
  { step: 1, title: 'Browse coaches', description: 'Find experts in your area of interest' },
  { step: 2, title: 'Chat on mobile', description: 'Get guidance anytime, anywhere' },
  { step: 3, title: 'Get guidance', description: 'Apply insights to your journey' },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section">
      <div className="container-landing">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="heading-section">How it works</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Creators track */}
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center lg:text-left mb-6">
              <span
                className="inline-block px-4 py-1.5 text-[13px] font-medium rounded-full mb-3"
                style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
              >
                For Creators
              </span>
              <p className="body-text">
                Turn your expertise into an AI coaching agent
              </p>
            </div>

            <div className="space-y-4">
              {creatorSteps.map((item) => (
                <div
                  key={item.step}
                  className="card flex items-start gap-4 p-4"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))' }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="heading-card text-[15px]">{item.title}</h4>
                    <p className="body-sm mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users track */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center lg:text-left mb-6">
              <span
                className="inline-block px-4 py-1.5 text-[13px] font-medium rounded-full mb-3"
                style={{ background: 'var(--lavender)', color: '#7C3AED' }}
              >
                For Users
              </span>
              <p className="body-text">
                Find and chat with the perfect coach
              </p>
            </div>

            <div className="space-y-4">
              {userSteps.map((item) => (
                <div
                  key={item.step}
                  className="card flex items-start gap-4 p-4"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #9333EA, #7C3AED)' }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="heading-card text-[15px]">{item.title}</h4>
                    <p className="body-sm mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
