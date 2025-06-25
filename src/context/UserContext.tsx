import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { api } from '@/services';
import { User } from '@/types';
import { usePathname } from 'next/navigation';
import { PUBLIC_ROUTES } from '@/constants';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, '');
  const isPublic = PUBLIC_ROUTES.includes(normalizedPath);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<User>('/users/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPublic) {
      fetchUser();
    }
  }, [fetchUser, isPublic]);

  return (
    <UserContext.Provider value={{ user, isLoading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
