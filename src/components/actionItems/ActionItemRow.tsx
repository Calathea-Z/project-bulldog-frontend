'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Check, Pencil, Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { ActionItem } from '@/types';
import { convertToUtcDate, formatDueDate } from '@/utils';
import { useUpdateActionItem } from '@/hooks';

interface ActionItemRowProps {
  item: ActionItem;
  handleToggle: (id: string) => void;
  handleDelete: (id: string) => void;
  updateActionItem: ReturnType<typeof useUpdateActionItem>;
}

function _ActionItemRow({
  item,
  handleToggle,
  handleDelete,
  updateActionItem,
}: ActionItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editDueAt, setEditDueAt] = useState<Date | null>(item.dueAt ? new Date(item.dueAt) : null);
  const [isDateOnly, setIsDateOnly] = useState(item.isDateOnly ?? false);

  useEffect(() => {
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
  }, [item.dueAt]);

  const handleEditClick = () => setIsEditing(true);
  const handleDeleteClick = () => handleDelete(item.id);
  const handleToggleClick = () => handleToggle(item.id);

  const handleSave = useCallback(() => {
    if (!editText.trim()) {
      toast.error('Text cannot be empty');
      return;
    }

    updateActionItem.mutate(
      {
        id: item.id,
        payload: {
          text: editText,
          dueAt: editDueAt
            ? isDateOnly
              ? convertToUtcDate(editDueAt).toISOString()
              : editDueAt.toISOString()
            : null,
          isDateOnly,
        },
      },
      {
        onSuccess: () => {
          toast.success('Updated successfully');
          setIsEditing(false);
        },
        onError: () => toast.error('Failed to update'),
      },
    );
  }, [editText, editDueAt, isDateOnly, updateActionItem, item.id]);

  const handleCancel = useCallback(() => {
    setEditText(item.text);
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
    setIsDateOnly(item.isDateOnly ?? false);
    setIsEditing(false);
  }, [item]);

  const isOverdue = item.dueAt && new Date(item.dueAt) < new Date() && !item.isDone;

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
            className="px-4 py-3"
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
                />
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

              <div className="flex justify-end gap-2 mt-1 pt-2">
                <button
                  onClick={handleCancel}
                  className="text-xs rounded bg-gray-200 px-3 py-1.5 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateActionItem.isPending}
                  className="text-xs rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateActionItem.isPending ? 'Saving...' : '✅ Save'}
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
            className="px-4 py-3"
          >
            <div className="flex flex-col justify-between min-h-[110px] gap-2">
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
                        ? formatDueDate(item.dueAt, { dateOnly: true })
                        : formatDueDate(item.dueAt)
                      : 'No due date'}
                  </span>
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

export const ActionItemRow = React.memo(_ActionItemRow, (prev, next) => {
  const a = prev.item;
  const b = next.item;
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.dueAt === b.dueAt &&
    a.isDone === b.isDone &&
    a.isDateOnly === b.isDateOnly
  );
});
