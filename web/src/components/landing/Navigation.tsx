'use client';

import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="container-landing">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold text-primary" style={{ letterSpacing: '-0.02em' }}>
            Better Coaching
          </Link>

          <Link
            href="/login"
            className="text-[15px] font-medium text-secondary hover:text-primary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
