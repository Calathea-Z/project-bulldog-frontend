import './globals.css';
import { ThemeProvider } from 'next-themes';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Codename Bulldog',
  description: 'Your personal AI productivity assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
