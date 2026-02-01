'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  Navigation,
  Hero,
  ValuePillars,
  HowItWorks,
  PlatformEconomy,
  FooterCTA,
} from '@/components/landing';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand store to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect authenticated users to dashboard after hydration
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show loading spinner until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <ValuePillars />
      <HowItWorks />
      <PlatformEconomy />
      <FooterCTA />
    </main>
  );
}
