'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { REMINDER_PRESETS, DEFAULT_REMINDER_MINUTES, formatReminderTime } from '@/utils';

interface ReminderToggleProps {
  shouldRemind: boolean;
  onShouldRemindChange: (value: boolean) => void;
  reminderMinutesBeforeDue: number | null;
  onReminderMinutesChange: (value: number | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ReminderToggle({
  shouldRemind,
  onShouldRemindChange,
  reminderMinutesBeforeDue,
  onReminderMinutesChange,
  disabled = false,
  className = '',
}: ReminderToggleProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(
    reminderMinutesBeforeDue || DEFAULT_REMINDER_MINUTES,
  );

  const handlePresetSelect = (value: number | 'custom') => {
    if (value === 'custom') {
      setShowCustomInput(true);
      onReminderMinutesChange(customMinutes);
    } else {
      setShowCustomInput(false);
      onReminderMinutesChange(value);
    }
  };

  const handleCustomMinutesChange = (value: number) => {
    setCustomMinutes(value);
    onReminderMinutesChange(value);
  };

  const currentPreset = REMINDER_PRESETS.find(
    (preset) => preset.value !== 'custom' && preset.value === reminderMinutesBeforeDue,
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {shouldRemind ? (
            <Bell className="w-4 h-4 text-blue-600" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Reminder</span>
        </div>
        <button
          type="button"
          onClick={() => onShouldRemindChange(!shouldRemind)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            shouldRemind ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              shouldRemind ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Reminder Options */}
      <AnimatePresence>
        {shouldRemind && !disabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Preset Chips */}
            <div className="flex flex-wrap gap-2">
              {REMINDER_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (preset.value === 'custom' && showCustomInput) ||
                    (preset.value !== 'custom' && preset.value === reminderMinutesBeforeDue)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    min="1"
                    max="10080" // 1 week in minutes
                    value={customMinutes}
                    onChange={(e) => handleCustomMinutesChange(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">minutes before</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Selection Display */}
            {reminderMinutesBeforeDue && !showCustomInput && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reminder will be sent {formatReminderTime(reminderMinutesBeforeDue)} before due date
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
