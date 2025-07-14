'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Check, Pencil, Trash2, CalendarDays } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { ActionItem } from '@/types';
import {
  convertToUtcDate,
  formatDate,
  formatDateOnly,
  convertLocalToUTC,
  formatReminderTime,
  normalizeDateString,
  isTaskOverdue,
  getMutationErrorMessage,
  cn,
} from '@/utils';
import { UseMutationResult } from '@tanstack/react-query';
import { ReminderToggle, BulldogDatePicker } from '@/components/ui';

interface ActionItemRowProps {
  item: ActionItem;
  handleToggle: (id: string) => void;
  handleDelete: (id: string) => void;
  updateActionItem: UseMutationResult<
    void,
    unknown,
    { id: string; payload: Partial<ActionItem> },
    unknown
  >;
  userTimeZoneDisplay: string;
}

export function ActionItemRow({
  item,
  handleToggle,
  handleDelete,
  updateActionItem,
}: ActionItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editDueAt, setEditDueAt] = useState<Date | null>(item.dueAt ? new Date(item.dueAt) : null);
  const [isDateOnly, setIsDateOnly] = useState(item.isDateOnly ?? false);
  const [shouldRemind, setShouldRemind] = useState(item.shouldRemind ?? false);
  const [reminderMinutesBeforeDue, setReminderMinutesBeforeDue] = useState<number | null>(
    item.reminderMinutesBeforeDue ?? null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOverdue = isTaskOverdue(item.dueAt, item.isDone);

  const isDirty = useMemo(() => {
    const currentDueAt = editDueAt
      ? isDateOnly
        ? convertToUtcDate(editDueAt).toISOString()
        : convertLocalToUTC(editDueAt)
      : null;
    const normalizedCurrentDueAt = normalizeDateString(currentDueAt);
    const normalizedOriginalDueAt = normalizeDateString(item.dueAt || null);
    return (
      editText !== item.text ||
      normalizedCurrentDueAt !== normalizedOriginalDueAt ||
      isDateOnly !== (item.isDateOnly ?? false) ||
      shouldRemind !== (item.shouldRemind ?? false) ||
      reminderMinutesBeforeDue !== (item.reminderMinutesBeforeDue ?? null)
    );
  }, [editText, editDueAt, isDateOnly, shouldRemind, reminderMinutesBeforeDue, item]);

  const handleSave = useCallback(() => {
    if (!editText.trim()) return toast.error('Text cannot be empty');
    if (!isDirty) return setIsEditing(false);
    if (updateActionItem.isPending) return;

    const currentDueAt = editDueAt
      ? isDateOnly
        ? convertToUtcDate(editDueAt).toISOString()
        : convertLocalToUTC(editDueAt)
      : null;

    setIsEditing(false);
    updateActionItem.mutate(
      {
        id: item.id,
        payload: {
          text: editText,
          dueAt: currentDueAt,
          isDateOnly,
          shouldRemind,
          reminderMinutesBeforeDue,
        },
      },
      {
        onSuccess: () => toast.success('Updated successfully'),
        onError: (error) => {
          setIsEditing(true);
          toast.error(getMutationErrorMessage(error, 'Update failed.'));
        },
      },
    );
  }, [
    editText,
    editDueAt,
    isDateOnly,
    shouldRemind,
    reminderMinutesBeforeDue,
    updateActionItem,
    item.id,
    isDirty,
  ]);

  const handleCancel = useCallback(() => {
    setEditText(item.text);
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
    setIsDateOnly(item.isDateOnly ?? false);
    setShouldRemind(item.shouldRemind ?? false);
    setReminderMinutesBeforeDue(item.reminderMinutesBeforeDue ?? null);
    setIsEditing(false);
  }, [item]);

  return (
    <motion.li
      layout
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className={`rounded-2xl border border-zinc-700 bg-zinc-900 shadow-sm transition-all ${
        isEditing ? 'ring-1 ring-blue-600/40' : ''
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isEditing ? 'edit' : 'view'}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-4 space-y-4"
        >
          {isEditing ? (
            <>
              <h3 className="text-sm font-semibold text-zinc-200">
                Editing: <span className="text-white">{item.text}</span>
              </h3>

              <TextareaAutosize
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                minRows={2}
                maxRows={6}
                autoFocus
                className="w-full resize-none rounded-md border border-accent bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                ref={textareaRef}
              />

              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={isDateOnly}
                  onChange={(e) => setIsDateOnly(e.target.checked)}
                  className="accent-blue-600"
                />
                All-day
              </label>

              <fieldset aria-label="Due date selection" className="space-y-2">
                <legend className="text-xs text-zinc-400">Due Date:</legend>
                <BulldogDatePicker
                  selected={editDueAt}
                  onChange={setEditDueAt}
                  isDateOnly={isDateOnly}
                  disableBodyScroll={false}
                />
              </fieldset>

              <div className="border-t border-zinc-700 pt-4">
                <fieldset aria-label="Reminder Settings" className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor={`reminder-toggle-${item.id}`}
                      className="text-sm font-medium text-white"
                    >
                      Set Reminder
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 w-6 text-right">
                        {shouldRemind ? 'On' : 'Off'}
                      </span>
                      <input
                        id={`reminder-toggle-${item.id}`}
                        type="checkbox"
                        checked={shouldRemind}
                        onChange={(e) => setShouldRemind(e.target.checked)}
                        className="accent-blue-500 w-5 h-5"
                      />
                    </div>
                  </div>

                  {shouldRemind && (
                    <>
                      <div className="flex gap-2 flex-wrap">
                        {[10, 30, 60, 1440].map((min) => (
                          <motion.button
                            key={min}
                            whileTap={{ scale: 0.95 }}
                            layoutId={min.toString()}
                            onClick={() => setReminderMinutesBeforeDue(min)}
                            className={cn(
                              'text-xs px-3 py-1 rounded-full transition',
                              reminderMinutesBeforeDue === min
                                ? 'bg-blue-600 text-white ring-1 ring-inset ring-blue-500'
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600',
                            )}
                          >
                            {min === 1440 ? '1 day' : `${min} min`}
                          </motion.button>
                        ))}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          layoutId="custom"
                          onClick={() => setReminderMinutesBeforeDue(null)}
                          className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        >
                          Custom...
                        </motion.button>
                      </div>

                      <p className="text-xs text-zinc-500 mt-2">
                        Reminder will be sent {formatReminderTime(reminderMinutesBeforeDue || 0)}{' '}
                        before due date
                      </p>
                    </>
                  )}
                </fieldset>
              </div>

              <div className="border-t border-zinc-700 pt-4 flex justify-end gap-2 scroll-mt-32">
                <button
                  onClick={handleCancel}
                  className="text-xs px-3 py-1.5 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded text-white transition-colors',
                    isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-600 cursor-not-allowed',
                  )}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <motion.div layout className="flex justify-between items-start gap-4 group">
              {/* Left section */}
              <div className="flex gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(item.id)}
                  className="h-5 w-5 rounded-full border border-blue-500 flex items-center justify-center mt-0.5"
                >
                  <Check
                    className={`w-3.5 h-3.5 ${item.isDone ? 'opacity-100 text-blue-500' : 'opacity-0'}`}
                  />
                </button>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium break-words">{item.text}</p>
                  <div className="flex items-center text-zinc-400 text-xs gap-2 mt-1 flex-wrap">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {item.dueAt
                        ? item.isDateOnly
                          ? formatDateOnly(item.dueAt)
                          : formatDate(item.dueAt)
                        : 'No due date'}
                    </span>
                    {isOverdue && <span className="text-red-500 font-semibold">• Overdue</span>}
                  </div>
                </div>
              </div>

              {/* Right section */}
              <motion.div
                layout
                className="flex flex-col items-end justify-between gap-2 flex-shrink-0 w-[90px]"
              >
                {item.shouldRemind && item.reminderMinutesBeforeDue ? (
                  <motion.span
                    layout
                    className="inline-block px-2 py-0.5 text-[11px] text-blue-300 bg-blue-500/10 rounded font-medium uppercase tracking-wide text-center w-full"
                  >
                    {formatReminderTime(item.reminderMinutesBeforeDue)}
                  </motion.span>
                ) : (
                  <div className="h-[20px] w-full" />
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditing(true)} aria-label="Edit task">
                    <Pencil className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} aria-label="Delete task">
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500 transition" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.li>
  );
}

export const MemoizedActionItemRow = React.memo(ActionItemRow, (prev, next) => {
  const a = prev.item;
  const b = next.item;
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.dueAt === b.dueAt &&
    a.isDone === b.isDone &&
    a.isDateOnly === b.isDateOnly &&
    a.shouldRemind === b.shouldRemind &&
    a.reminderMinutesBeforeDue === b.reminderMinutesBeforeDue
  );
});
