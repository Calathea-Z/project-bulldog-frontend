'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useActionItems,
  useCreateActionItem,
  useToggleActionItemDone,
  useDeleteActionItem,
  useUpdateActionItem,
} from '@/hooks';
import { useAiTaskGenerator } from '@/hooks/ai/useAiTaskGenerator';
import { ConfirmAiTasksModal, AiInputPanel, NewActionItemForm, SkeletonRow } from '@/components';
import { sortActionItems } from '@/utils/sortActionItems';
import ActionItemList from '@/components/ActionItems/ActionItemList';

export default function ActionItemsPage() {
  const { data: items = [], isLoading, isError } = useActionItems();
  const createActionItem = useCreateActionItem();
  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();
  const sortedItems = sortActionItems(items);

  const {
    aiInput,
    setAiInput,
    isAiLoading,
    reviewActionItems,
    reviewSummary,
    showReview,
    setShowReview,
    handleAiCreate,
    handleConfirmSave,
  } = useAiTaskGenerator();

  const [newText, setNewText] = useState('');
  const [newDueAt, setNewDueAt] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items.length === 0) inputRef.current?.blur();
  }, [items.length]);

  const handleAdd = () => {
    if (!newText.trim()) return;
    createActionItem.mutate(
      { text: newText, dueAt: newDueAt ? newDueAt.toISOString() : null },
      {
        onSuccess: () => {
          setNewText('');
          setNewDueAt(null);
        },
      },
    );
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

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Action Items</h1>

      <AiInputPanel
        aiInput={aiInput}
        setAiInput={setAiInput}
        handleAiCreate={handleAiCreate}
        isLoading={isAiLoading}
      />

      <NewActionItemForm
        inputRef={inputRef}
        newText={newText}
        setNewText={setNewText}
        newDueAt={newDueAt}
        setNewDueAt={setNewDueAt}
        handleAdd={handleAdd}
      />

      <ActionItemList
        items={sortedItems}
        onToggle={(id) => toggleDone.mutate(id)}
        onDelete={(id) => deleteActionItem.mutate(id)}
        onUpdate={updateActionItem}
      />

      <ConfirmAiTasksModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        tasks={reviewActionItems}
        summary={reviewSummary}
        onConfirm={handleConfirmSave}
      />
    </main>
  );
}
