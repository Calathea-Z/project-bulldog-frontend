'use client';

import { setAccessToken, getAccessToken } from '@/lib/api';
import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; token: string };

type AuthContextValue = AuthState & {
  logout: () => void;
  setAuthenticated: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });
  const pathname = usePathname();
  const setAuthenticated = (token: string) => {
    setAccessToken(token);
    setAuth({ status: 'authenticated', token });
  };

  useEffect(() => {
    // ✅ Skip refresh on public pages
    if (pathname === '/login' || pathname === '/signup') {
      setAuth({ status: 'unauthenticated' });
      return;
    }
    console.log('🔍 getAccessToken result:', getAccessToken());

    // ✅ Skip refresh if token is already set (e.g. from login)
    const existing = getAccessToken();
    if (existing) {
      setAuth({ status: 'authenticated', token: existing });
      return;
    }

    async function tryRefresh() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        setAuth({ status: 'authenticated', token: accessToken });
      } catch {
        setAuth({ status: 'unauthenticated' });
      }
    }

    tryRefresh();
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {}

    setAccessToken(null);
    setAuth({ status: 'unauthenticated' });
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...auth, logout, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
