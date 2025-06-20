'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { AuthState, AuthContextValue } from '@/types';
import { useRefreshToken } from '@/hooks';
import { setAccessToken, getAccessToken, logoutUser } from '@/services';
import { PUBLIC_ROUTES } from '@/constants';
import { LoadingScreen } from '@/components';
import { isIOS } from '@/utils';

/**
 * Authentication context for managing user authentication state
 * Provides authentication status, tokens, and auth-related functions
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication provider component that manages authentication state and provides auth context
 * Handles token management, authentication status, and iOS-specific token storage
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });
  const pathname = usePathname();
  const refresh = useRefreshToken();

  /**
   * Sets the authenticated state with the provided tokens
   * Handles token storage in sessionStorage and iOS-specific localStorage
   */
  const setAuthenticated = (accessToken: string, refreshToken?: string) => {
    setAccessToken(accessToken); // ✅ handles sessionStorage sync now

    setAuth({ status: 'authenticated', accessToken });

    if (isIOS() && refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  /**
   * Effect hook to handle initial authentication state
   * Checks for existing tokens and handles iOS-specific token restoration
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) {
      setAuth({ status: 'unauthenticated', accessToken: null });
      return;
    }

    const existing = getAccessToken();
    if (existing) {
      setAuth({ status: 'authenticated', accessToken: existing });
      return;
    }

    // iOS-specific restore
    if (isIOS()) {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        refresh().then((token) => {
          if (token) {
            setAuthenticated(token); // accessToken only
          } else {
            setAuth({ status: 'unauthenticated', accessToken: null });
          }
        });
        return;
      }
    }
    setAuth({ status: 'unauthenticated', accessToken: null });
  }, []);

  /**
   * Handles user logout by clearing auth state and showing success message
   */
  const logout = async () => {
    await logoutUser();
    setAuth({ status: 'unauthenticated', accessToken: null });

    toast.success('Logged out successfully');
  };

  // Only render children once we're not in "loading" state
  if (auth.status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ ...auth, logout, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
