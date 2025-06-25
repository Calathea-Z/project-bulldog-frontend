'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Check, Pencil, Trash2, Bell } from 'lucide-react';
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
} from '@/utils';
import { UseMutationResult } from '@tanstack/react-query';
import { ReminderToggle } from '@/components/ui';

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
  userTimeZoneDisplay,
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

  // Sync local edit state with item props when they change (e.g., from external updates)
  useEffect(() => {
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
    setShouldRemind(item.shouldRemind ?? false);
    setReminderMinutesBeforeDue(item.reminderMinutesBeforeDue ?? null);
  }, [item.dueAt, item.shouldRemind, item.reminderMinutesBeforeDue]);

  // Track dirty state for immediate visual feedback
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
  }, [
    editText,
    editDueAt,
    isDateOnly,
    shouldRemind,
    reminderMinutesBeforeDue,
    item.text,
    item.dueAt,
    item.isDateOnly,
    item.shouldRemind,
    item.reminderMinutesBeforeDue,
  ]);

  const handleEditClick = () => setIsEditing(true);
  const handleDeleteClick = () => handleDelete(item.id);
  const handleToggleClick = () => handleToggle(item.id);

  const handleSave = useCallback(() => {
    if (!editText.trim()) {
      toast.error('Text cannot be empty');
      return;
    }

    // Prevent multiple simultaneous mutations
    if (updateActionItem.isPending) {
      return;
    }

    // Check if anything has actually changed using a more robust comparison
    const currentDueAt = editDueAt
      ? isDateOnly
        ? convertToUtcDate(editDueAt).toISOString()
        : convertLocalToUTC(editDueAt)
      : null;

    // Normalize the original dueAt for comparison
    const originalDueAt = item.dueAt || null;

    const hasTextChanged = editText !== item.text;
    const hasDueAtChanged =
      normalizeDateString(currentDueAt) !== normalizeDateString(originalDueAt);
    const hasDateOnlyChanged = isDateOnly !== (item.isDateOnly ?? false);
    const hasRemindChanged = shouldRemind !== (item.shouldRemind ?? false);
    const hasReminderTimeChanged =
      reminderMinutesBeforeDue !== (item.reminderMinutesBeforeDue ?? null);

    if (
      !hasTextChanged &&
      !hasDueAtChanged &&
      !hasDateOnlyChanged &&
      !hasRemindChanged &&
      !hasReminderTimeChanged
    ) {
      setIsEditing(false);
      return;
    }

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
        onSuccess: () => {
          toast.success('Updated successfully');
        },
        onError: (error) => {
          // Reopen edit mode on error so user can retry
          setIsEditing(true);
          const errorMessage = getMutationErrorMessage(
            error,
            'Failed to update. Please try again.',
          );
          toast.error(errorMessage);
          console.error('Update failed:', error);
        },
      },
    );
  }, [
    editText,
    editDueAt,
    isDateOnly,
    updateActionItem,
    item.id,
    shouldRemind,
    reminderMinutesBeforeDue,
    item.text,
    item.dueAt,
    item.isDateOnly,
    item.shouldRemind,
    item.reminderMinutesBeforeDue,
  ]);

  const handleCancel = useCallback(() => {
    setEditText(item.text);
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
    setIsDateOnly(item.isDateOnly ?? false);
    setShouldRemind(item.shouldRemind ?? false);
    setReminderMinutesBeforeDue(item.reminderMinutesBeforeDue ?? null);
    setIsEditing(false);
  }, [item]);

  // Add keyboard event listener to textarea when editing
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    };

    // Use global listener for Escape key
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isEditing, handleCancel]);

  // Separate effect for Enter key on textarea
  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;

    const textarea = textareaRef.current;

    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
        keyboardEvent.preventDefault();
        handleSave();
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleSave]);

  const isOverdue = isTaskOverdue(item.dueAt, item.isDone);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl shadow-sm bg-muted/60 border border-border overflow-hidden"
      role="group"
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="px-4 py-3 edit-container min-h-[110px]"
          >
            <div className="flex flex-col gap-4 mt-1">
              <TextareaAutosize
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                minRows={2}
                maxRows={6}
                autoFocus
                className="w-full resize-none rounded-md border border-accent bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                aria-label="Edit task text"
                ref={textareaRef}
              />
              <div className="text-xs text-muted text-right mt-[-6px] mb-1">
                {editText.length} characters
              </div>

              <div className="relative text-sm text-muted w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">📅</span>
                <DatePicker
                  selected={editDueAt}
                  onChange={(date) => setEditDueAt(date)}
                  showTimeSelect={!isDateOnly}
                  dateFormat={isDateOnly ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm aa'}
                  placeholderText="Set due date"
                  minDate={new Date()}
                  calendarClassName="react-datepicker"
                  popperPlacement="bottom-start"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-accent bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  timeIntervals={15}
                  timeCaption="Time"
                  isClearable
                  aria-label={`Select due date for task "${item.text}"${isDateOnly ? ' (all-day)' : ' with time'}`}
                />
                {userTimeZoneDisplay && (
                  <div className="mt-1 ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Your local time zone: <span className="font-medium">{userTimeZoneDisplay}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 ml-1">
                  <label
                    htmlFor={`all-day-${item.id}`}
                    className="flex items-center gap-2 text-sm text-muted mt-1 ml-1"
                  >
                    <input
                      id={`all-day-${item.id}`}
                      type="checkbox"
                      checked={isDateOnly}
                      onChange={(e) => setIsDateOnly(e.target.checked)}
                      className="accent-primary"
                    />
                    All-day
                  </label>
                </div>
              </div>

              <ReminderToggle
                shouldRemind={shouldRemind}
                onShouldRemindChange={setShouldRemind}
                reminderMinutesBeforeDue={reminderMinutesBeforeDue}
                onReminderMinutesChange={setReminderMinutesBeforeDue}
                disabled={!editDueAt}
                className="mt-2"
              />

              <div className="flex justify-end gap-2 mt-1 pt-2">
                <button
                  onClick={handleCancel}
                  title="Cancel editing task"
                  className="text-xs rounded bg-gray-200 px-3 py-1.5 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  title={isDirty ? 'Save task changes' : 'No changes to save'}
                  className={`text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-2 transition-colors ${
                    isDirty
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ✅ Save
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="px-4 py-3 min-h-[110px]"
          >
            <div className="flex flex-col justify-between gap-2">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleToggleClick}
                  className="h-5 w-5 rounded-full border border-primary flex items-center justify-center transition bg-background"
                  aria-label={`Mark task "${item.text}" as ${item.isDone ? 'incomplete' : 'done'}`}
                >
                  <Check
                    className={`w-3.5 h-3.5 transition-opacity ${
                      item.isDone ? 'opacity-100 text-primary' : 'opacity-0'
                    }`}
                  />
                </button>
                <p className="text-sm font-medium leading-snug text-text break-words">
                  {item.text}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-muted ml-8">
                <div className="flex gap-2 items-center">
                  <span>
                    📅{' '}
                    {item.dueAt
                      ? item.isDateOnly
                        ? formatDateOnly(item.dueAt)
                        : formatDate(item.dueAt)
                      : 'No due date'}
                  </span>
                  {item.shouldRemind && item.reminderMinutesBeforeDue && (
                    <span
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors cursor-help"
                      title={`Reminder set for ${formatReminderTime(item.reminderMinutesBeforeDue)} before due date`}
                    >
                      <Bell className="w-3 h-3" />
                      {formatReminderTime(item.reminderMinutesBeforeDue)}
                    </span>
                  )}
                  {isOverdue && (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      🔴 Overdue
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEditClick}
                    className="text-primary hover:scale-110 transition"
                    aria-label={`Edit action item "${item.text}"`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="text-destructive hover:scale-110 transition"
                    aria-label={`Delete action item "${item.text}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
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
