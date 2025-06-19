'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { api, handlePostLogin, setAccessToken } from '@/services';
import { LoadingScreen, ThemeToggle } from '@/components';
import { useRedirectIfAuthenticated } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useRedirectIfAuthenticated();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/login', { email, password }).then((res) => res.data);

      if (data.auth) {
        handlePostLogin(data.auth);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else if (data.twoFactor) {
        setTwoFactorUserId(data.twoFactor.userId);
        toast.success('2FA code sent — please enter it.');
      } else {
        throw new Error('Unexpected login response');
      }
    } catch (err: any) {
      console.error(err);
      const isHTML = err?.response?.headers?.['content-type']?.includes('text/html');
      const fallback = 'Login failed. Please try again.';
      const msg = !isHTML && typeof err?.response?.data === 'string' ? err.response.data : fallback;
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await api
        .post('/auth/verify-2fa', {
          userId: twoFactorUserId,
          code: otpCode,
        })
        .then((res) => res.data);

      if (result.auth) {
        setAccessToken(result.auth.accessToken);
        handlePostLogin(result.auth);
        toast.success('2FA verified!');
        router.push('/dashboard');
      } else {
        throw new Error('Unexpected 2FA response');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Invalid or expired 2FA code.');
      setError('2FA verification failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={twoFactorUserId ? handleVerifyOtp : handleLogin}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">Welcome Back</h1>
        <p className="text-sm text-secondary text-center">
          {twoFactorUserId
            ? 'Enter your 2FA code below'
            : 'Sign in with your email and password to continue.'}
        </p>

        {!twoFactorUserId && (
          <>
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
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {twoFactorUserId && (
          <div className="space-y-1">
            <label htmlFor="otp" className="sr-only">
              2FA Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              required
              placeholder="Enter 6-digit code"
              className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : twoFactorUserId ? 'Verify Code' : 'Sign In'}
        </button>

        {!twoFactorUserId && (
          <div className="text-center text-sm text-secondary">
            <p>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}

        {error && (
          <div className="text-sm text-center space-y-3">
            <div className="bg-red-50/10 border border-red-200/20 rounded-lg p-4">
              <p className="text-red-500 mb-2" role="alert">
                {error}
              </p>
              <div className="text-secondary space-y-2">
                <p>Need help signing in?</p>
                <div className="flex flex-col gap-2">
                  <Link href="/signup" className="text-primary hover:text-accent transition-colors">
                    Create a new account
                  </Link>
                  <Link
                    href="/reset-password"
                    className="text-primary hover:text-accent transition-colors"
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
