'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // sets class="dark" or class="light"
      defaultTheme="dark" // start in dark mode
      enableSystem={false} // ignore OS preference
    >
      {children}
      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}
