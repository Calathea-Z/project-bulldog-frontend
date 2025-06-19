'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken } from '@/services';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { handlePostLogin } from '@/services';
import { LoadingScreen, ThemeToggle } from '@/components';
import { useRedirectIfAuthenticated } from '@/hooks';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyUserId, setVerifyUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  useRedirectIfAuthenticated();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await api
        .post('/auth/register', {
          email,
          displayName,
          password,
          phoneNumber,
        })
        .then((res) => res.data);

      if (result.auth) {
        setAccessToken(result.auth.accessToken);
        handlePostLogin(result.auth);
        toast.success('Account created!');
        router.push('/dashboard');
      } else if (result.phoneVerificationRequired && result.userId) {
        setVerifyUserId(result.userId);
        toast.success('Verification code sent to your phone.');
      } else {
        throw new Error('Unexpected registration response');
      }
    } catch (err: any) {
      console.error(err);
      const isHTML = err?.response?.headers?.['content-type']?.includes('text/html');
      const fallback = 'Sign-up failed. Please try again.';
      const msg = !isHTML && typeof err?.response?.data === 'string' ? err.response.data : fallback;
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyPhone(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await api
        .post('/auth/verify-phone', {
          userId: verifyUserId,
          code: otpCode,
        })
        .then((res) => res.data);

      if (result.auth) {
        setAccessToken(result.auth.accessToken);
        handlePostLogin(result.auth);
        toast.success('Phone verified!');
        router.push('/dashboard');
      } else {
        throw new Error('Unexpected verification response');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Verification failed.');
      setAttemptsLeft((prev) => prev - 1);
      setError('Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    if (!verifyUserId) return;
    setIsLoading(true);
    try {
      await api.post(`/two-factor-debug/send-code/${verifyUserId}`);
      toast.success('Verification code resent.');
      setResendCooldown(30);
    } catch {
      toast.error('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={verifyUserId ? handleVerifyPhone : handleSignUp}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">
          {verifyUserId ? 'Verify Your Phone' : 'Create an Account'}
        </h1>
        <p className="text-sm text-secondary text-center">
          {verifyUserId
            ? 'Enter the 6-digit code sent to your phone.'
            : 'Sign up to get started with Bulldog.'}
        </p>

        {!verifyUserId && (
          <>
            <div className="space-y-1">
              <label htmlFor="displayName" className="sr-only">
                Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                placeholder="Your name"
                className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
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

            <div className="space-y-1">
              <label htmlFor="phoneNumber" className="sr-only">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                placeholder="+15555555555"
                className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {verifyUserId && (
          <div className="space-y-1">
            <label htmlFor="otp" className="sr-only">
              Verification Code
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
              disabled={isLoading || attemptsLeft <= 0}
            />
            <div className="text-xs text-secondary text-right">Attempts left: {attemptsLeft}</div>
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-primary hover:text-accent disabled:opacity-50"
              disabled={resendCooldown > 0 || isLoading}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || (!!verifyUserId && attemptsLeft <= 0)}
        >
          {isLoading
            ? verifyUserId
              ? 'Verifying...'
              : 'Creating account...'
            : verifyUserId
              ? 'Verify Code'
              : 'Sign Up'}
        </button>

        {!verifyUserId && (
          <div className="text-center text-sm text-secondary">
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Log in
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
                <p>Need help?</p>
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="text-primary hover:text-accent transition-colors">
                    Already have an account?
                  </Link>
                  <Link
                    href="/support"
                    className="text-primary hover:text-accent transition-colors"
                  >
                    Contact support
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
