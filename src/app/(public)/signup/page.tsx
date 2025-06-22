'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { LoadingScreen, ThemeToggle } from '@/components';
import { useRedirectIfAuthenticated } from '@/hooks';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useRedirectIfAuthenticated();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Format phone number if provided
      let formattedPhoneNumber = phoneNumber;
      if (phoneNumber.trim()) {
        // Remove any non-digit characters and add +1 prefix
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
          formattedPhoneNumber = `+1${digitsOnly}`;
        } else {
          toast.error('Please enter a valid 10-digit US phone number');
          setIsLoading(false);
          return;
        }
      }

      const result = await api
        .post('/auth/register', {
          email,
          displayName,
          password,
          phoneNumber: formattedPhoneNumber,
        })
        .then((res) => res.data);

      if (result.emailVerificationRequired) {
        setIsEmailSent(true);
        setSuccessMessage(result.message);
        toast.success('Account created!');
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

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={handleSignUp}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">
          {isEmailSent ? 'Check Your Email' : 'Create an Account'}
        </h1>
        <p className="text-sm text-secondary text-center">
          {isEmailSent ? successMessage : 'Sign up to get started with Bulldog.'}
        </p>

        {!isEmailSent ? (
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

            <div className="relative space-y-1">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="password"
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

            <div className="space-y-1">
              <label htmlFor="phoneNumber" className="sr-only">
                Phone Number (Optional)
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="555-555-5555 (Optional)"
                className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50/10 border border-green-200/20 rounded-lg p-4 text-center">
              <p className="text-green-500 mb-2">✅ Account created successfully!</p>
              <p className="text-secondary text-sm">
                Please check your email and click the verification link to activate your account.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition flex items-center justify-center"
              >
                Go to Sign In
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                  setDisplayName('');
                  setPassword('');
                  setPhoneNumber('');
                  setError('');
                }}
                className="w-full bg-background border border-accent text-text py-2 rounded hover:border-primary transition"
              >
                Create Another Account
              </button>
            </div>
          </div>
        )}

        {!isEmailSent && (
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
