'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { authApi, ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name || undefined);

      setAuth(result.accessToken, result.refreshToken, result.user);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Better Coaching
            </h1>
          </Link>
          <p className="body-text mt-2">
            Creator Portal
          </p>
        </div>

        <div className="card p-6">
          <h2 className="heading-card text-xl mb-6">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-[13px] font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 spinner mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-[15px] font-medium transition-colors"
              style={{ color: 'var(--cta-start)' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
