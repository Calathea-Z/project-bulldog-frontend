'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ActionItem } from '@/types/api';
import { formatDueDate } from '@/utils/formatDate';

interface ActionItemRowProps {
  item: ActionItem;
  handleToggle: (id: string) => void;
  handleDelete: (id: string) => void;
  updateActionItem: {
    mutate: (
      args: { id: string; payload: Partial<ActionItem> },
      options: { onSuccess: () => void; onError: () => void },
    ) => void;
  };
}

export default function ActionItemRow({
  item,
  handleToggle,
  handleDelete,
  updateActionItem,
}: ActionItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editDueAt, setEditDueAt] = useState<Date | null>(item.dueAt ? new Date(item.dueAt) : null);

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
    setIsEditing(false);
  };

  return (
    <li
      className="flex flex-col sm:flex-row sm:items-center justify-between rounded border border-accent bg-surface p-4 space-y-2 sm:space-y-0"
      role="listitem"
      aria-label={`Action item: ${item.text}`}
    >
      {isEditing ? (
        <div
          className="flex flex-col sm:flex-row sm:items-center flex-1 space-y-2 sm:space-y-0 sm:space-x-3"
          role="form"
          aria-label="Edit action item form"
        >
          {/* Text Input */}
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 rounded border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Edit action item text"
          />

          {/* DatePicker for due date */}
          <DatePicker
            selected={editDueAt}
            onChange={(date) => setEditDueAt(date)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            showTimeSelect
            dateFormat="MMM d, yyyy h:mm aa"
            placeholderText="Set due date"
            className="rounded border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            minDate={new Date()}
            aria-label="Edit due date"
          />
        </div>
      ) : (
        <div className="flex items-center flex-1">
          <input
            type="checkbox"
            checked={item.isDone}
            onChange={() => handleToggle(item.id)}
            className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            aria-label={`Mark "${item.text}" as ${item.isDone ? 'incomplete' : 'done'}`}
          />
          <div>
            <span
              className={`${item.isDone ? 'line-through text-secondary' : ''}`}
              aria-label={item.isDone ? `Completed: ${item.text}` : item.text}
            >
              {item.text}
            </span>
            {item.dueAt && (
              <div
                className="mt-1 text-xs text-gray-400"
                aria-label={`Due date: ${formatDueDate(item.dueAt)}`}
              >
                Due: {formatDueDate(item.dueAt)}
                {new Date(item.dueAt) < new Date() && !item.isDone && (
                  <span className="ml-2 text-red-400 font-medium">(Overdue)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200 px-2 py-1 rounded"
              aria-label={`Edit action item "${item.text}"`}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-sm text-red-500 hover:underline focus:outline-none focus:ring-2 focus:ring-red-200 px-2 py-1 rounded"
              aria-label={`Delete action item "${item.text}"`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}
