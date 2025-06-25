'use client';

import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RefObject, useEffect, useState } from 'react';
import { NewActionItemFormProps } from '@/types';
import { useDisableBodyScroll } from '@/hooks';
import { ReminderToggle } from '@/components/ui';
import { DEFAULT_REMINDER_MINUTES } from '@/utils';
import { getUserTimeZoneId } from '@/utils/timezone';
import { useUser } from '@/context/UserContext';

export function NewManualTaskModal({
  inputRef,
  newText,
  setNewText,
  newDueAt,
  setNewDueAt,
  shouldRemind,
  setShouldRemind,
  reminderMinutesBeforeDue,
  setReminderMinutesBeforeDue,
  handleAdd,
  onClose,
  isLoading = false,
}: Omit<NewActionItemFormProps, 'inputRef'> & {
  inputRef: RefObject<HTMLTextAreaElement>;
  onClose: () => void;
}) {
  useDisableBodyScroll(true);

  const { user } = useUser();
  const [userTimeZone, setUserTimeZone] = useState<string>('');
  const [userTimeZoneDisplay, setUserTimeZoneDisplay] = useState<string>('');

  useEffect(() => {
    let tz = user?.timeZoneId || getUserTimeZoneId();
    setUserTimeZone(tz);
    if (!tz) return;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
      const parts = formatter.formatToParts(now);
      const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || tz;
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const target = new Date(utc.toLocaleString('en-US', { timeZone: tz }));
      const offset = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? '+' : '';
      setUserTimeZoneDisplay(`${tzName} (UTC${sign}${offset})`);
    } catch {
      setUserTimeZoneDisplay(tz);
    }
  }, [user]);

  const handleSave = async () => {
    await handleAdd();
  };

  // Auto-enable reminder when due date is set (if not already set)
  const handleDueDateChange = (date: Date | null) => {
    setNewDueAt(date);

    // Auto-enable reminder if due date is set and reminder isn't already configured
    if (date && !shouldRemind && reminderMinutesBeforeDue === null) {
      setShouldRemind(true);
      setReminderMinutesBeforeDue(DEFAULT_REMINDER_MINUTES);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
      <div className="flex flex-col h-full w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-none md:rounded-2xl shadow-lg animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-inherit p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            Quick Add Task
          </span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <textarea
                ref={inputRef}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-3 text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="relative text-sm text-muted w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">📅</span>
              <DatePicker
                selected={newDueAt}
                onChange={handleDueDateChange}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText="Set due date"
                minDate={new Date()}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-accent bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {userTimeZoneDisplay && (
                <div className="mt-1 ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Times shown in your timezone:{' '}
                  <span className="font-medium">{userTimeZoneDisplay}</span>
                </div>
              )}
            </div>

            {/* Reminder Toggle */}
            <ReminderToggle
              shouldRemind={shouldRemind}
              onShouldRemindChange={setShouldRemind}
              reminderMinutesBeforeDue={reminderMinutesBeforeDue}
              onReminderMinutesChange={setReminderMinutesBeforeDue}
              disabled={!newDueAt}
              className="mt-4"
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-inherit p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 pb-20">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-xs border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded px-4 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!newText.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Task'}
          </button>
        </div>

        <style jsx global>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </div>
  );
}
