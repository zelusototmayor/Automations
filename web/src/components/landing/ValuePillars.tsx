'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const pillars = [
  {
    title: 'Your knowledge, their coach',
    description:
      'Transform your expertise into AI coaching agents that work 24/7. Share your unique approach and help people at scale.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    color: 'sage',
  },
  {
    title: 'Find the right fit',
    description:
      'Browse coaches by category, style, and expertise. Find someone whose approach resonates with your goals.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    color: 'lavender',
  },
  {
    title: 'Conversations that matter',
    description:
      'Real methodologies from real experts, not generic AI. Get guidance rooted in proven approaches and genuine experience.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    color: 'sky',
  },
];

const colorStyles: Record<string, { bg: string; icon: string }> = {
  sage: { bg: 'var(--sage)', icon: 'var(--cta-end)' },
  lavender: { bg: 'var(--lavender)', icon: '#7C3AED' },
  sky: { bg: 'var(--sky)', icon: '#0EA5E9' },
};

export function ValuePillars() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section" style={{ background: 'var(--surface)' }}>
      <div className="container-landing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`text-center transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-5"
                style={{
                  background: colorStyles[pillar.color].bg,
                  color: colorStyles[pillar.color].icon,
                }}
              >
                {pillar.icon}
              </div>
              <h3 className="heading-card mb-3">
                {pillar.title}
              </h3>
              <p className="body-text">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
