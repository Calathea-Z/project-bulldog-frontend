'use client';

import { setAccessToken, getAccessToken } from '@/lib/api';
import axios from 'axios';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const isRefreshing = useRef(false);

  const setAuthenticated = (token: string) => {
    // store the new access token in memory
    setAccessToken(token);
    setAuth({ status: 'authenticated', token });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('📌 AuthContext mounted');
    console.log('🔍 Pathname:', pathname);

    const isIOS = () =>
      typeof navigator !== 'undefined' && /iP(ad|hone|od)/i.test(navigator.userAgent);

    // 1) Skip refresh if on public page
    if (pathname === '/login' || pathname === '/signup') {
      console.log('🚪 Public route detected → skipping refresh.');
      setAuth({ status: 'unauthenticated' });
      return;
    }

    // 2) Already have token
    const existing = getAccessToken();
    if (existing) {
      console.log('✅ Token already in memory:', existing);
      setAuth({ status: 'authenticated', token: existing });
      return;
    }

    // 3) Prevent multiple refreshes
    if (isRefreshing.current) {
      console.log('⚠️ Refresh already in progress — skipping.');
      return;
    }
    isRefreshing.current = true;

    console.log('🔁 Attempting /auth/refresh...');
    const localRefreshToken = localStorage.getItem('refreshToken');

    const refreshRequest = isIOS()
      ? axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { token: localRefreshToken })
      : axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

    refreshRequest
      .then((res) => {
        console.log('✅ Refresh success:', res.data);
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        setAuth({ status: 'authenticated', token: accessToken });
      })
      .catch((err) => {
        console.warn('❌ Refresh failed:', err?.response?.data || err.message);
        setAuth({ status: 'unauthenticated' });
      });
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.warn('Logout failed:', err);
    }
    setAccessToken(null);
    setAuth({ status: 'unauthenticated' });
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // Only render children once we’re not in “loading” state
  if (auth.status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

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
