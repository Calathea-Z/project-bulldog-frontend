'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAiTaskGenerator } from '@/hooks/ai/useAiTaskGenerator';
import TypewriterThinking from './TypewriterThinking';

interface AiTaskFullScreenModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AiTaskFullScreenModal({ open, onClose }: AiTaskFullScreenModalProps) {
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

  const [editableTasks, setEditableTasks] = useState(reviewActionItems);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setEditableTasks(reviewActionItems);
  }, [reviewActionItems]);

  const handleTaskEdit = (index: number, newText: string) => {
    const updated = [...editableTasks];
    updated[index].text = newText;
    setEditableTasks(updated);
  };

  const handleTaskDelete = (index: number) => {
    const updated = [...editableTasks];
    updated.splice(index, 1);
    setEditableTasks(updated);
  };

  const handleConfirm = async () => {
    await handleConfirmSave(editableTasks);
    onClose();
    setAiInput('');
    setShowReview(false);
    setShowSummary(false);
  };

  const handleCancel = () => {
    setAiInput('');
    setShowReview(false);
    setShowSummary(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full h-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-t-2xl shadow-lg flex flex-col animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            Create Tasks With AI
          </span>
          <button
            onClick={handleCancel}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!showReview ? (
            <>
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
              {isAiLoading && <TypewriterThinking />}
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="font-medium mb-2">Review & Edit Tasks</div>
                <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                  {editableTasks.length === 0 && (
                    <li className="text-sm text-muted text-center italic">No tasks remaining</li>
                  )}
                  {editableTasks.map((task, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <textarea
                        value={task.text}
                        onChange={(e) => handleTaskEdit(index, e.target.value)}
                        className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[160px] overflow-y-auto"
                        rows={2}
                        maxLength={1000}
                        aria-label={`Edit action item ${index + 1}`}
                      />
                      <button
                        onClick={() => handleTaskDelete(index)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="text-blue-600 text-xs underline mb-2"
                >
                  {showSummary ? 'Hide Summary' : 'View Summary'}
                </button>
                {showSummary && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm max-h-40 overflow-y-auto whitespace-pre-wrap text-blue-900">
                    {reviewSummary}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded px-4 py-2 text-xs border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="rounded px-4 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={editableTasks.length === 0}
                >
                  Confirm & Save
                </button>
              </div>
            </>
          )}
        </div>
        <style jsx global>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </div>
  );
}
