'use client';

export function VideoPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="relative rounded-[22px] overflow-hidden"
        style={{
          background: 'var(--ink)',
          boxShadow: 'var(--shadow-elevated)',
          aspectRatio: '16/9'
        }}
      >
        {/* Video placeholder content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))' }}>
          {/* Play button */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
            }}
          >
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <p className="mt-6 text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            Explainer Video Coming Soon
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-placeholder)' }}>
            See how Better Coaching works
          </p>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 rounded-tl-lg" style={{ borderColor: 'var(--cta-start)', opacity: 0.5 }} />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 rounded-tr-lg" style={{ borderColor: 'var(--cta-start)', opacity: 0.5 }} />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 rounded-bl-lg" style={{ borderColor: 'var(--cta-end)', opacity: 0.5 }} />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 rounded-br-lg" style={{ borderColor: 'var(--cta-end)', opacity: 0.5 }} />
      </div>
    </div>
  );
}
