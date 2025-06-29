'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Check, Pencil, Trash2, Bell, Clock, CalendarDays } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-zinc-900 border border-zinc-700 shadow-sm hover:shadow-md transition p-4"
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div key="edit" className="space-y-4">
            <TextareaAutosize
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              minRows={2}
              maxRows={6}
              autoFocus
              className="w-full resize-none rounded-md border border-accent bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              ref={textareaRef}
            />
            <BulldogDatePicker selected={editDueAt} onChange={setEditDueAt} />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={isDateOnly}
                onChange={(e) => setIsDateOnly(e.target.checked)}
                className="accent-blue-600"
              />
              All-day
            </label>
            <ReminderToggle
              shouldRemind={shouldRemind}
              onShouldRemindChange={setShouldRemind}
              reminderMinutesBeforeDue={reminderMinutesBeforeDue}
              onReminderMinutesChange={setReminderMinutesBeforeDue}
              disabled={!editDueAt}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="text-xs px-3 py-1.5 rounded bg-zinc-700 text-white hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`text-xs px-3 py-1.5 rounded text-white transition-colors ${
                  isDirty ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-600 cursor-not-allowed'
                }`}
              >
                Save
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="view" className="space-y-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(item.id)}
                className="h-5 w-5 rounded-full border border-blue-500 flex items-center justify-center"
              >
                <Check
                  className={`w-3.5 h-3.5 ${item.isDone ? 'opacity-100 text-blue-500' : 'opacity-0'}`}
                />
              </button>
              <p className="text-sm text-white leading-snug break-words font-medium">{item.text}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pl-8">
              <div className="min-w-[180px] flex items-center gap-2 tabular-nums">
                <CalendarDays className="w-4 h-4" />
                {item.dueAt
                  ? item.isDateOnly
                    ? formatDateOnly(item.dueAt)
                    : formatDate(item.dueAt)
                  : 'No due date'}
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                {item.shouldRemind && item.reminderMinutesBeforeDue && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Bell className="w-4 h-4" />
                    {formatReminderTime(item.reminderMinutesBeforeDue)}
                  </span>
                )}
                {isOverdue && (
                  <span className="flex items-center gap-1 text-red-500 font-semibold">
                    ● Overdue
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(true)} aria-label="Edit task">
                  <Pencil className="w-4 h-4 text-zinc-400 hover:text-white transition" />
                </button>
                <button onClick={() => handleDelete(item.id)} aria-label="Delete task">
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500 transition" />
                </button>
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
