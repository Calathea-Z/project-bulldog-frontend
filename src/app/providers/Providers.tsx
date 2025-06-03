'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // sets class="dark" or class="light"
      defaultTheme="dark" // start in dark mode
      enableSystem={false} // ignore OS preference
    >
      {children}
    </ThemeProvider>
  );
}
