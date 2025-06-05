'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  useActionItems,
  useCreateActionItem,
  useToggleActionItemDone,
  useDeleteActionItem,
  useUpdateActionItem,
} from '@/hooks/useActionItemHooks';
import SkeletonRow from '@/components/ui/loaders/SkeletonRow';
import ActionItemRow from '@/components/ActionItems/ActionItemRow';

export default function ActionItemsPage() {
  const { data: items = [], isLoading, isError } = useActionItems();
  const createActionItem = useCreateActionItem();
  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();

  const [newText, setNewText] = useState('');
  const [newDueAt, setNewDueAt] = useState<Date | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm) {
      inputRef.current?.focus();
    }
  }, [showAddForm]);

  useEffect(() => {
    if (items.length === 0) {
      setShowAddForm(false);
    }
  }, [items.length]);

  const handleAdd = () => {
    if (!newText.trim()) return;

    createActionItem.mutate(
      { text: newText, dueAt: newDueAt ? newDueAt.toISOString() : null },
      {
        onSuccess: () => {
          toast.success('Action item created');
          setNewText('');
          setNewDueAt(null);
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

  if (isLoading) {
    return (
      <div className="p-4 max-w-xl mx-auto" role="status" aria-label="Loading action items">
        <h1 className="text-2xl font-bold mb-6">Your Action Items</h1>
        <SkeletonRow />
        <div className="h-4" />
        <SkeletonRow />
        <div className="h-4" />
        <SkeletonRow />
      </div>
    );
  }

  if (isError) {
    return (
      <p
        className="p-4 text-red-400 text-center"
        role="alert"
        aria-label="Error loading action items"
      >
        Error loading action items.
      </p>
    );
  }

  if (items.length === 0 && !showAddForm) {
    return (
      <div className="p-4 max-w-md mx-auto text-center" role="status" aria-label="No action items">
        <h1 className="text-2xl font-bold mb-4">Your Action Items</h1>
        <p className="text-gray-400 mb-6">You don&apos;t have any action items yet!</p>
        <div className="text-6xl opacity-30 mb-6" aria-hidden="true">
          📝
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded bg-primary px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Add your first action item"
        >
          Add Your First Item
        </button>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    if (a.dueAt && b.dueAt) return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    if (a.dueAt) return -1;
    if (b.dueAt) return 1;
    return 0;
  });

  return (
    <div className="p-4 max-w-xl mx-auto" role="main">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Action Items</h1>

      {/* ─── Sticky "Add New" Header ─── */}
      <div
        className="sticky top-0 z-10 bg-background p-4 border-b border-accent"
        role="form"
        aria-label="Add new action item"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            id="newActionItemInput"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="New action item..."
            className="flex-1 rounded border border-accent bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="New action item text"
          />

          <DatePicker
            selected={newDueAt}
            onChange={(date) => setNewDueAt(date)}
            placeholderText="Due date (optional)"
            showTimeSelect
            dateFormat="MMM d, yyyy h:mm aa"
            className="rounded border border-accent bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            minDate={new Date()}
            aria-label="Due date"
          />

          <button
            onClick={handleAdd}
            className="rounded bg-primary px-4 py-2 text-background hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Add new action item"
          >
            Add
          </button>
        </div>
      </div>

      <ul className="space-y-2 mt-4" role="list" aria-label="Action items list">
        {sorted.map((item) => (
          <ActionItemRow
            key={item.id}
            item={item}
            handleToggle={handleToggle}
            handleDelete={handleDelete}
            updateActionItem={updateActionItem}
          />
        ))}
      </ul>
    </div>
  );
}
