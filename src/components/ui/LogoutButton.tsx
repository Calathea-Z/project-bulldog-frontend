'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logoutUser } from '@/services';
import { LogoutButtonProps } from '@/types';

export const LogoutButton = ({ className = '', label = 'Logout' }: LogoutButtonProps) => {
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
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition disabled:opacity-50 flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
          Logging out…
        </>
      ) : (
        <span className="transition-opacity">{label}</span>
      )}
    </button>
  );
};
