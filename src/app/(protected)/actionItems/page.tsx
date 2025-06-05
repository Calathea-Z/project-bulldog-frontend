'use client';

import {
  useActionItems,
  useCreateActionItem,
  useToggleActionItemDone,
  useDeleteActionItem,
} from '@/hooks/useActionItemHooks';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ActionItemsPage() {
  const { data: items, isLoading, isError } = useActionItems();
  const createActionItem = useCreateActionItem();
  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();

  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;

    createActionItem.mutate(
      { text },
      {
        onSuccess: () => {
          toast.success('Action item created');
          setText('');
        },
        onError: () => toast.error('Failed to create item'),
      },
    );
  };

  const handleToggle = (id: string) => {
    toggleDone.mutate(id, {
      onError: () => toast.error('Failed to toggle status'),
    });
  };

  const handleDelete = (id: string) => {
    deleteActionItem.mutate(id, {
      onSuccess: () => toast.success('Action item deleted'),
      onError: () => toast.error('Failed to delete item'),
    });
  };

  if (isLoading) return <p className="p-4 text-text">Loading action items...</p>;
  if (isError) return <p className="p-4 text-accent">Error loading action items</p>;

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 bg-background text-text">
      <h1 className="text-2xl font-bold text-text">Your Action Items</h1>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New action item..."
          className="flex-1 rounded border border-accent bg-surface text-text px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="rounded bg-primary px-4 py-2 text-background hover:opacity-90"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded border border-accent bg-surface p-3"
          >
            <div
              className={`flex-1 cursor-pointer ${
                item.isDone ? 'line-through text-secondary' : ''
              }`}
              onClick={() => handleToggle(item.id)}
            >
              {item.text}
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-sm text-accent hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
