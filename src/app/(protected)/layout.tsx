'use client';

import { useAuth, AuthProvider } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { BottomNav } from '@/components';

function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const hasRedirected = useRef(false); // only show toast once per mount

  useEffect(() => {
    if (auth.status === 'unauthenticated' && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error("You're not logged in.");
      router.replace('/login');
    }
  }, [auth.status, router]);

  if (auth.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (auth.status === 'authenticated') return <>{children}</>;
  return null;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>
        <div className="min-h-screen pb-16">{children}</div>
        <BottomNav />
      </Guard>
    </AuthProvider>
  );
}
