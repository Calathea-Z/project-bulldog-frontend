'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { AuthState, AuthContextValue } from '@/types';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { setAccessToken, getAccessToken } from '@/services/api';
import { logoutUser } from '@/services/auth';
import { PUBLIC_ROUTES } from '@/constants/routes';
import LoadingScreen from '@/components/ui/LoadingScreen';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });
  const pathname = usePathname();
  const refresh = useRefreshToken();
  const isRefreshing = useRef(false);

  const setAuthenticated = (token: string) => {
    // store the new access token in memory
    setAccessToken(token);
    setAuth({ status: 'authenticated', accessToken: token });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Skip refresh if on public page
    if (PUBLIC_ROUTES.includes(pathname)) {
      setAuth({ status: 'unauthenticated', accessToken: null });
      return;
    }

    // If already have token
    const existing = getAccessToken();
    if (existing) {
      setAuth({ status: 'authenticated', accessToken: existing });
      return;
    }

    // Prevent multiple refreshes
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    // Call refresh from hook
    refresh().then((token) => {
      if (token) {
        setAuth({ status: 'authenticated', accessToken: token });
      } else {
        setAuth({ status: 'unauthenticated', accessToken: null });
      }
    });
  }, []);

  const logout = async () => {
    await logoutUser();
    setAuth({ status: 'unauthenticated', accessToken: null });

    toast.success('Logged out successfully');
  };

  // Only render children once we’re not in “loading” state
  if (auth.status === 'loading') {
    return <LoadingScreen />;
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
