'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { api } from '@/services';
import { LoadingScreen, ThemeToggle } from '@/components';

// The actual component that uses searchParams
function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Missing verification token.');
      setIsLoading(false);
      return;
    }

    async function verify(token: string) {
      setIsLoading(true);
      try {
        await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setIsSuccess(true);
        toast.success('Email verified successfully!');
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    verify(token);
  }, [searchParams]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary">
      <div className="flex justify-center mb-4 rounded-md">
        <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
      </div>

      {isSuccess ? (
        <>
          <h1 className="text-2xl font-bold text-center text-primary">Email Verified!</h1>
          <p className="text-sm text-secondary text-center">
            Your email address has been successfully verified. You can now sign in to your account.
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center text-primary">Verification Failed</h1>
          <p className="text-sm text-secondary text-center">
            {error || 'There was an issue verifying your email address.'}
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// The page itself, which wraps the client component in Suspense
export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      <Suspense fallback={<LoadingScreen />}>
        <VerifyEmail />
      </Suspense>
      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
