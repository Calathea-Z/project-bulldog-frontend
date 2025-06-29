'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { LoadingScreen, ThemeToggle } from '@/components';
import { useRedirectIfAuthenticated } from '@/hooks';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfettiOverlay } from '@/components';
import { CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useRedirectIfAuthenticated();

  useEffect(() => {
    if (isEmailSent && emailSent === true) {
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [isEmailSent, emailSent, router]);

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
        })
        .then((res) => res.data);

      if (result.emailVerificationRequired) {
        setIsEmailSent(true);
        setEmailSent(result.emailSent);
        setSuccessMessage(result.message);
        toast.success('Account created!');
      } else {
        throw new Error('Unexpected registration response');
      }
    } catch (err: any) {
      console.error(err);
      const isHTML = err?.response?.headers?.['content-type']?.includes('text/html');
      const rawMsg = err?.response?.data;
      const fallback = 'Sign-up failed. Please try again.';

      const msg = typeof rawMsg === 'string' && !isHTML ? rawMsg : fallback;
      const lowerMsg = msg.toLowerCase();

      const actualRaw = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';
      const isDuplicateEmail =
        lowerMsg.includes('already registered') ||
        lowerMsg.includes('email already in use') ||
        actualRaw.includes('already registered') ||
        actualRaw.includes('email already in use');

      const isGenericFallback = msg === fallback;

      if (isDuplicateEmail) {
        setError(msg); // Only inline error, no toast
      } else if (!isGenericFallback) {
        toast.error(msg);
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {isLoading && <LoadingScreen />}
      {isEmailSent && emailSent === true && <ConfettiOverlay />}

      <motion.form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-zinc-900 border border-zinc-700 shadow-lg rounded-2xl p-8 space-y-6"
        aria-busy={isLoading}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-center mb-4">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">
          {isEmailSent ? 'Check Your Inbox' : 'Create an Account'}
        </h1>
        <p className="text-sm text-zinc-400 text-center">
          {isEmailSent
            ? "We've sent a verification email to your address."
            : 'Sign up to get started with Bulldog.'}
        </p>

        {!isEmailSent ? (
          <>
            <div className="space-y-1">
              <input
                id="displayName"
                type="text"
                required
                placeholder="Your name"
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                aria-label="Full name"
              />
            </div>

            <div className="space-y-1">
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                aria-label="Email address"
              />
            </div>

            <div className="relative space-y-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="password"
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </motion.button>
          </>
        ) : emailSent === false ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-yellow-50/5 border border-yellow-400/30 rounded-lg p-5 text-center space-y-3 shadow-inner">
              <p className="text-yellow-400 font-medium text-lg">⚠️ Email Not Sent</p>
              <p className="text-zinc-300 text-sm">{successMessage}</p>
              <p className="text-zinc-500 text-xs">
                Still need help? Use one of the options below.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center font-medium"
            >
              <Link href="/login" className="w-full h-full flex justify-center">
                Go to Sign In
              </Link>
            </motion.button>
            <button
              type="button"
              onClick={() => {
                setIsEmailSent(false);
                setEmailSent(null);
                setEmail('');
                setDisplayName('');
                setPassword('');
                setError('');
              }}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 py-2 rounded-md hover:border-primary transition"
            >
              Create Another Account
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-green-50/5 border border-green-400/30 rounded-lg p-5 text-center space-y-3 shadow-inner">
              <p className="text-green-400 font-medium text-lg flex items-center justify-center gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block align-middle"
                >
                  <CheckCircle className="text-green-500" size={28} />
                </motion.span>
                Verification Email Sent
              </p>
              <p className="text-zinc-300 text-sm text-center">
                A verification email was sent to{' '}
                <span className="text-white font-semibold">{email}</span>.<br />
                Please check your inbox and click the link to activate your account.
              </p>
              <p className="text-zinc-500 text-xs">
                Didn't get it? Check your spam folder or try logging in to resend.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center font-medium"
            >
              <Link href="/login" className="w-full h-full flex justify-center">
                Go to Sign In
              </Link>
            </motion.button>
            <div className="text-center text-xs text-zinc-500 mt-2">
              You'll be redirected shortly...
            </div>
          </motion.div>
        )}

        {!isEmailSent && (
          <div className="text-center text-sm text-zinc-400">
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
              <div className="text-zinc-400 space-y-2">
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
      </motion.form>
    </main>
  );
}
