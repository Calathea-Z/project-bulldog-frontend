// app/(protected)/layout.tsx
'use client';

import { useAuth, AuthProvider } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { BottomNav } from '@/components';

function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const redirectOnce = useRef(false);

  useEffect(() => {
    if (auth.status === 'unauthenticated' && !redirectOnce.current) {
      redirectOnce.current = true;
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

  if (auth.status === 'authenticated') {
    return <>{children}</>;
  }
  return null;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>
        <div
          className="flex flex-col h-screen"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 65px)' }}
        >
          {children}
        </div>
        <BottomNav />
      </Guard>
    </AuthProvider>
  );
}
