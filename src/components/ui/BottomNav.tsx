'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-label="Dashboard"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href="/settings"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              pathname === '/settings' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
