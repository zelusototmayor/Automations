'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const creatorSteps = [
  {
    step: 1,
    title: 'Define your coaching identity',
    description: 'Set your name, personality, communication style, and coaching philosophy. Your AI agent will embody your unique approach to helping others.',
  },
  {
    step: 2,
    title: 'Upload your knowledge',
    description: 'Add your expertise through documents, methodologies, frameworks, and insights. The more you share, the more valuable your agent becomes.',
  },
  {
    step: 3,
    title: 'Configure and customize',
    description: 'Fine-tune how your agent responds, set conversation boundaries, and choose your voice. Make it authentically represent you.',
  },
  {
    step: 4,
    title: 'Publish and earn',
    description: 'Launch your coaching agent to the marketplace. As users subscribe, you earn recurring revenue from your expertise.',
  },
];

const userSteps = [
  {
    step: 1,
    title: 'Discover your perfect coach',
    description: 'Browse coaches by category, expertise, and coaching style. Read reviews and find someone whose approach resonates with your goals.',
  },
  {
    step: 2,
    title: 'Try before you commit',
    description: 'Get 5 free interactions with any coach to experience their methodology and see if it\'s the right fit for you.',
  },
  {
    step: 3,
    title: 'Chat anytime, anywhere',
    description: 'Access your coaches 24/7 through our mobile app. Get guidance when you need it, on your schedule.',
  },
  {
    step: 4,
    title: 'Transform your journey',
    description: 'Apply insights from real experts to achieve your goals. Track progress and build lasting habits with consistent coaching support.',
  },
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
          <p className="mt-4 body-text text-lg max-w-2xl mx-auto">
            Whether you&apos;re sharing expertise or seeking guidance, getting started is simple
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Creators track */}
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center lg:text-left mb-8">
              <span
                className="inline-block px-4 py-1.5 text-[13px] font-medium rounded-full mb-3"
                style={{ background: 'var(--sage)', color: 'var(--cta-end)' }}
              >
                For Coaches & Creators
              </span>
              <h3 className="heading-card text-xl mt-2">
                Turn your expertise into an AI coaching agent
              </h3>
              <p className="body-text mt-2">
                Share your knowledge at scale and build a new revenue stream from your expertise
              </p>
            </div>

            <div className="space-y-4">
              {creatorSteps.map((item, index) => (
                <div
                  key={item.step}
                  className="card flex items-start gap-4 p-5"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))' }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="heading-card text-[15px]">{item.title}</h4>
                    <p className="body-sm mt-1.5 leading-relaxed">{item.description}</p>
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
            <div className="text-center lg:text-left mb-8">
              <span
                className="inline-block px-4 py-1.5 text-[13px] font-medium rounded-full mb-3"
                style={{ background: 'var(--lavender)', color: '#7C3AED' }}
              >
                For Users
              </span>
              <h3 className="heading-card text-xl mt-2">
                Find and chat with your perfect coach
              </h3>
              <p className="body-text mt-2">
                Access real expertise from proven methodologies, not generic AI responses
              </p>
            </div>

            <div className="space-y-4">
              {userSteps.map((item, index) => (
                <div
                  key={item.step}
                  className="card flex items-start gap-4 p-5"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #9333EA, #7C3AED)' }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="heading-card text-[15px]">{item.title}</h4>
                    <p className="body-sm mt-1.5 leading-relaxed">{item.description}</p>
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
