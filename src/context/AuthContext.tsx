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

  useEffect(() => {
    // 1) If on a public page, flip to “unauthenticated”
    if (pathname === '/login' || pathname === '/signup') {
      setAuth({ status: 'unauthenticated' });
      return;
    }

    // 2) If we already have a valid in-memory token, just mark “authenticated”
    const existing = getAccessToken();
    if (existing) {
      setAuth({ status: 'authenticated', token: existing });
      return;
    }

    // 3) Otherwise, we have to call /auth/refresh exactly once
    if (isRefreshing.current) {
      // safety check (shouldn’t really happen with [] deps, but React Strict Mode can fire useEffect twice in dev)
      return;
    }
    isRefreshing.current = true;

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        setAuth({ status: 'authenticated', token: accessToken });
      })
      .catch(() => {
        setAuth({ status: 'unauthenticated' });
      });
  }, [pathname]);

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      // ignore
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
