'use client';

import { useRef, useEffect, useState } from 'react';
import { useUserSettings, useUserTimeZoneDisplay } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function SettingsPage() {
  const {
    user,
    timeZones,
    selectedTimeZone,
    isLoading,
    isSaving,
    setSelectedTimeZone,
    updateTimeZone,
  } = useUserSettings();

  const userTimeZoneDisplay = useUserTimeZoneDisplay();

  const timezoneRef = useRef<HTMLDivElement | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Scroll to timezone picker if not set
  useEffect(() => {
    if (!isLoading && user && !user.timeZoneId && timezoneRef.current) {
      timezoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowBanner(true);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <main className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* Timezone missing banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md px-4 py-3 text-sm"
          >
            Please set your timezone to ensure reminders and times are shown correctly.
            <button onClick={() => setShowBanner(false)} className="ml-4 text-xs underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile */}
      <section className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <p className="text-gray-900 dark:text-gray-100">{user?.displayName}</p>
          </div>
        </div>
      </section>

      {/* Timezone */}
      <section ref={timezoneRef} className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Timezone Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Set your timezone to ensure times are interpreted correctly when uploading documents.
        </p>

        {/* Local Timezone Display */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-zinc-700 rounded-md">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Your local time zone: {userTimeZoneDisplay}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
            >
              <option value="">Select a timezone...</option>
              {timeZones.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.displayName} (UTC{tz.baseUtcOffset >= 0 ? '+' : ''}
                  {tz.baseUtcOffset})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={updateTimeZone}
            disabled={isSaving || !selectedTimeZone}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Timezone'}
          </button>
        </div>
      </section>
    </main>
  );
}
