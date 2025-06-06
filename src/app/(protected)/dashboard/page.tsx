'use client';

import { logoutUser } from '@/services';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold">Welcome to Bulldog Assistant</h1>
      <p>{`You're successfully logged in 🎉`}</p>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
            Logging out…
          </>
        ) : (
          'Logout'
        )}
      </button>
    </main>
  );
}
