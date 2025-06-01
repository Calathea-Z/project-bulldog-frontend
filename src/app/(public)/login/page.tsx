'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email },
        { withCredentials: true },
      );

      const { accessToken } = res.data;
      console.log('✅ accessToken from login:', accessToken); // ← check this
      setAuthenticated(accessToken);

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please try again.');
      setError('Invalid email or unexpected error.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Login</h1>

        <input
          type="email"
          required
          placeholder="Your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Sign In
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </main>
  );
}
