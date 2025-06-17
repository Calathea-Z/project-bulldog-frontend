'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Check, Pencil, Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

import { ActionItem } from '@/types';
import { formatDueDate } from '@/utils';
import { useUpdateActionItem } from '@/hooks';

interface ActionItemRowProps {
  item: ActionItem;
  handleToggle: (id: string) => void;
  handleDelete: (id: string) => void;
  updateActionItem: ReturnType<typeof useUpdateActionItem>;
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

  // Update editDueAt when item.dueAt changes
  React.useEffect(() => {
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
  }, [item.dueAt]);

  const handleSave = () => {
    if (!editText.trim()) {
      toast.error('Text cannot be empty');
      return;
    }
    updateActionItem.mutate(
      {
        id: item.id,
        payload: {
          text: editText,
          dueAt: editDueAt ? editDueAt.toISOString() : null,
          isDateOnly: isDateOnly,
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
  };

  const handleCancel = () => {
    setEditText(item.text);
    setEditDueAt(item.dueAt ? new Date(item.dueAt) : null);
    setIsDateOnly(item.isDateOnly ?? false);
    setIsEditing(false);
  };

  const isOverdue = item.dueAt && new Date(item.dueAt) < new Date() && !item.isDone;

  return (
    <li
      className={`rounded-xl px-4 py-3 shadow-sm transition-all duration-200 ease-in-out ${
        isEditing
          ? 'bg-muted/60 border border-border ring-1 ring-primary/20'
          : 'bg-muted/60 border border-border'
      }`}
      role="listitem"
    >
      {isEditing ? (
        <div className="flex flex-col gap-4 mt-1">
          {/* Task Text */}
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

          {/* Due Date */}
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
              popperModifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                  fn: ({ x, y }) => ({ x, y }),
                },
              ]}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-accent bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Edit due date"
              timeIntervals={15}
              timeCaption="Time"
              isClearable
            />
            <div className="flex items-center gap-2 mt-1 ml-1">
              <input
                id={`all-day-${item.id}`}
                type="checkbox"
                checked={isDateOnly}
                onChange={(e) => setIsDateOnly(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor={`all-day-${item.id}`} className="text-sm text-muted">
                All-day
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-1 pt-2">
            <button
              onClick={handleCancel}
              className="text-xs rounded bg-gray-200 px-3 py-1.5 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              ❌ Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              ✅ Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between min-h-[110px] gap-2">
          {/* Top Row: Checkbox + Text */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggle(item.id)}
              className="h-5 w-5 rounded-full border border-primary flex items-center justify-center transition bg-background"
              aria-label={`Mark task "${item.text}" as ${item.isDone ? 'incomplete' : 'done'}`}
            >
              <Check
                className={`w-3.5 h-3.5 transition-opacity ${
                  item.isDone ? 'opacity-100 text-primary' : 'opacity-0'
                }`}
              />
            </button>
            <p className="text-sm font-medium leading-snug text-text break-words">{item.text}</p>
          </div>

          {/* Bottom Row: Due date + actions */}
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
                onClick={() => setIsEditing(true)}
                className="text-primary hover:scale-110 transition"
                aria-label={`Edit action item "${item.text}"`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-destructive hover:scale-110 transition"
                aria-label={`Delete action item "${item.text}"`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
