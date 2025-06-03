'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { handlePostLogin } from '@/services/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import icon512 from '../../../../public/icon-512.png';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useRedirectIfAuthenticated();

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
      >
        <div className="flex justify-center mb-4">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">Welcome Back</h1>
        <p className="text-sm text-secondary text-center">Sign in with your email to continue.</p>

        <input
          type="email"
          required
          placeholder="your@email.com"
          className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </form>

      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
