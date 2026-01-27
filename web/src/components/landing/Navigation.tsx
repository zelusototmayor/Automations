'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="container-landing">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo-no-bg.png"
              alt="Better Coaching"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-semibold text-primary" style={{ letterSpacing: '-0.02em' }}>
              Better Coaching
            </span>
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
