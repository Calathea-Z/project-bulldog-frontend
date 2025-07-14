'use client';

import { X, Clock } from 'lucide-react';
import { useState, useEffect, useRef, Fragment } from 'react';
import { NewActionItemFormProps } from '@/types';
import { useDisableBodyScroll, useUserTimeZoneDisplay } from '@/hooks';
import { ReminderToggle, BulldogDatePicker } from '@/components/ui';
import { DEFAULT_REMINDER_MINUTES } from '@/utils';
import { Transition } from '@headlessui/react';

export function NewManualTaskModal({
  show,
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
  isDateOnly,
  setIsDateOnly,
}: Omit<NewActionItemFormProps, 'inputRef'> & {
  show: boolean;
  onClose: () => void;
  isDateOnly?: boolean;
  setIsDateOnly?: (value: boolean) => void;
}) {
  useDisableBodyScroll(true);

  // Use props if available, otherwise use local state
  const [localIsDateOnly, setLocalIsDateOnly] = useState(false);
  const isDateOnlyValue = isDateOnly ?? localIsDateOnly;
  const setIsDateOnlyValue = setIsDateOnly ?? setLocalIsDateOnly;

  // Ensure newDueAt is set to now on open if not already set
  useEffect(() => {
    if (!newDueAt) {
      setNewDueAt(new Date());
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userTimeZoneDisplay = useUserTimeZoneDisplay();

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

  // Ref for textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!show) return null;

  return (
    <Transition
      show={show}
      as={Fragment}
      appear
      enter="ease-out duration-200"
      enterFrom="opacity-0 translate-y-8"
      enterTo="opacity-100 translate-y-0"
      leave="ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-8"
      afterEnter={() => textareaRef.current && textareaRef.current.focus()}
    >
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
              {/* Text input at the top */}
              <textarea
                ref={textareaRef}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-3 text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="What needs to be done?"
              />
              {/* All Day Toggle */}
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={isDateOnlyValue}
                  onChange={(e) => setIsDateOnlyValue(e.target.checked)}
                  className="accent-blue-600"
                />
                All-day
              </label>
              <div className="relative text-sm text-muted w-full">
                <BulldogDatePicker
                  selected={newDueAt}
                  onChange={handleDueDateChange}
                  isDateOnly={isDateOnlyValue}
                />
                {userTimeZoneDisplay && !isDateOnlyValue && (
                  <div className="mt-1 ml-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
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
    </Transition>
  );
}
