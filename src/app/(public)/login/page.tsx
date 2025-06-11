'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { handlePostLogin } from '@/services';
import { LoadingScreen, ThemeToggle } from '@/components/ui';
import { useRedirectIfAuthenticated } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useRedirectIfAuthenticated();

  const resetForm = () => {
    setEmail('');
    setError('');
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      handlePostLogin(res.data);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please try again.');
      setError('Invalid email or unexpected error.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">Welcome Back</h1>
        <p className="text-sm text-secondary text-center">Sign in with your email to continue.</p>

        <div className="space-y-1">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center text-sm text-secondary">
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary hover:text-accent transition-colors font-medium"
              aria-label="Create a new account"
            >
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="text-sm text-center space-y-3">
            <div className="bg-red-50/10 border border-red-200/20 rounded-lg p-4">
              <p id="error-message" className="text-red-500 mb-2" role="alert">
                {error}
              </p>
              <div className="text-secondary space-y-2">
                <p>Need help signing in?</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/signup"
                    className="text-primary hover:text-accent transition-colors"
                    aria-label="Create a new account"
                  >
                    Create a new account
                  </Link>
                  <Link
                    href="/reset-password"
                    className="text-primary hover:text-accent transition-colors"
                    aria-label="Reset your password"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
