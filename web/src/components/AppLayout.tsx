'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 spinner"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'My Agents' },
    { href: '/integrations', label: 'Integrations' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
              >
                Better Coaching
              </Link>
              <nav className="hidden md:flex space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-[14px] text-[15px] font-medium transition-all ${
                      pathname === item.href
                        ? 'chip-selected'
                        : ''
                    }`}
                    style={pathname !== item.href ? { color: 'var(--text-secondary)' } : {}}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="body-sm">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="body-sm hover:text-primary transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
