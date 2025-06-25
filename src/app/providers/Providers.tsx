'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/services';
import { getUserTimeZoneId } from '@/utils/timezone';
import { PUBLIC_ROUTES } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProvider } from '@/context/UserContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showTzBanner, setShowTzBanner] = useState(false);
  const [userTz, setUserTz] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (PUBLIC_ROUTES.includes(pathname)) return;

    const dismissed = localStorage.getItem('tzBannerDismissed');
    if (dismissed) return;

    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.get('/users/me');
        const user = res.data;
        setUserTz(user.timeZoneId || null);

        const detectedTz = getUserTimeZoneId();

        if ((!user.timeZoneId || user.timeZoneId === 'UTC') && detectedTz && detectedTz !== 'UTC') {
          try {
            await api.put(`/users/${user.id}`, { timeZoneId: detectedTz });
            setUserTz(detectedTz);
          } catch (updateError) {
            console.warn('Failed to update user timezone:', updateError);
          }
        }

        if (!user.timeZoneId || user.timeZoneId === 'UTC') {
          setShowTzBanner(true);
        }
      } catch (error) {
        console.warn('Failed to fetch user timezone info:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  const handleDismiss = () => {
    setShowTzBanner(false);
    localStorage.setItem('tzBannerDismissed', '1');
  };

  return (
    <UserProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AnimatePresence>
          {showTzBanner && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              role="alert"
              className="fixed top-0 left-0 w-full z-50 bg-yellow-100 text-yellow-900 px-4 py-3 flex items-center justify-between shadow-md"
            >
              <span>
                <strong>We couldn&apos;t detect your timezone.</strong> Please select it to make
                sure your reminders fire at the right time.
              </span>
              <div className="flex gap-2 ml-4">
                <a
                  href="/settings"
                  className="px-3 py-1 rounded bg-yellow-300 hover:bg-yellow-400 font-semibold"
                >
                  Select Timezone
                </a>
                <button
                  onClick={handleDismiss}
                  className="ml-2 px-3 py-1 rounded bg-yellow-200 hover:bg-yellow-300"
                  aria-label="Dismiss timezone alert"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {children}
        <Toaster position="bottom-center" />
      </ThemeProvider>
    </UserProvider>
  );
}
