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
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email'>('sms');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setTwoFactorData(data.twoFactor);
        setIsCodeSent(false);
        // Default to SMS if available, otherwise email
        setSelectedMethod(data.twoFactor.canUseSms ? 'sms' : 'email');
        toast.success('Please choose how to receive your 2FA code.');
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

  async function handleRequestTwoFactor() {
    if (!twoFactorUserId) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/request-2fa', {
        userId: twoFactorUserId,
        method: selectedMethod,
      });

      toast.success(`Verification code sent via ${selectedMethod === 'sms' ? 'SMS' : 'email'}!`);
      setIsCodeSent(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to send verification code. Please try again.');
      setError('Failed to send verification code.');
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
          verificationMethod: selectedMethod,
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

  const showMethodSelection = twoFactorUserId && !isCodeSent;
  const showOtpInput = twoFactorUserId && isCodeSent;

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={showOtpInput ? handleVerifyOtp : handleLogin}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">Welcome Back</h1>
        <p className="text-sm text-secondary text-center">
          {showMethodSelection
            ? 'Choose how to receive your verification code'
            : showOtpInput
              ? 'Enter your verification code'
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

            <div className="relative space-y-1">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-secondary hover:text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </>
        )}

        {showMethodSelection && twoFactorData && (
          <div className="space-y-4">
            <div className="text-sm text-secondary">
              <p>We&apos;ll send a verification code to:</p>
            </div>

            {twoFactorData.canUseSms && (
              <button
                type="button"
                onClick={() => setSelectedMethod('sms')}
                className={`w-full p-3 rounded border transition ${
                  selectedMethod === 'sms'
                    ? 'bg-primary border-primary text-surface'
                    : 'bg-background border-accent text-text hover:border-primary'
                }`}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div className="font-medium">📱 SMS</div>
                  <div className="text-sm opacity-80">{twoFactorData.phoneNumber}</div>
                </div>
              </button>
            )}

            {twoFactorData.canUseEmail && (
              <button
                type="button"
                onClick={() => setSelectedMethod('email')}
                className={`w-full p-3 rounded border transition ${
                  selectedMethod === 'email'
                    ? 'bg-primary border-primary text-surface'
                    : 'bg-background border-accent text-text hover:border-primary'
                }`}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div className="font-medium">📧 Email</div>
                  <div className="text-sm opacity-80">{twoFactorData.email}</div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={handleRequestTwoFactor}
              className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading
                ? 'Sending...'
                : `Send Code via ${selectedMethod === 'sms' ? 'SMS' : 'Email'}`}
            </button>
          </div>
        )}

        {showOtpInput && (
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
              disabled={isLoading}
            />
          </div>
        )}

        {!twoFactorUserId && (
          <button
            type="submit"
            className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        )}

        {showOtpInput && (
          <button
            type="submit"
            className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        )}

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
