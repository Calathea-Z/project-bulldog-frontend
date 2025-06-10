import { useAiTaskGenerator } from '@/hooks/ai/useAiTaskGenerator';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ConfirmAiTasksModal from './ConfirmAiTasksModal';

function CollapsibleAiInput() {
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

  const [input, setInput] = useState('');

  // Keep input in sync with aiInput
  // (optional: you can use aiInput directly if you want to control from the hook)

  const handleCancel = () => {
    setAiInput('');
    setInput('');
    setShowReview(false);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6">
      <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-600" />
        Create Tasks With AI
      </h2>
      <textarea
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 mb-2 text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="Describe what you need to do..."
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        disabled={isAiLoading}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
          disabled={isAiLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleAiCreate}
          className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
          disabled={isAiLoading || !aiInput.trim()}
        >
          Generate Tasks
        </button>
      </div>
      {isAiLoading && <div className="mt-2 text-xs text-blue-600">Thinking…</div>}
      <ConfirmAiTasksModal
        isOpen={showReview}
        onClose={handleCancel}
        tasks={reviewActionItems}
        summary={reviewSummary}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

export default CollapsibleAiInput;
