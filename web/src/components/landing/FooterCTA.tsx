'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function FooterCTA() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

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
            Whether you want to share your expertise or find the guidance you need, we&apos;re here to help.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="btn btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
            >
              Create your agent
            </Link>
            <a
              href="#"
              className="btn btn-outline text-base px-8 py-3.5 w-full sm:w-auto"
            >
              Find your coach
            </a>
          </div>
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
    </section>
  );
}
