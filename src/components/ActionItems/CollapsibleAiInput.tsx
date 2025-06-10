import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useAiTaskGenerator } from '@/hooks/ai/useAiTaskGenerator';
import AiThinkingPanel from '../ui/loaders/AiThinkingPanel';
import { ConfirmAiTasksModal } from './index';

export default function CollapsibleAiInput() {
  const [isExpanded, setIsExpanded] = useState(false);
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

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Collapsed State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 bg-surface border border-accent rounded-lg shadow-sm hover:bg-accent/5 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-accent" />
            <span className="text-text font-medium">Create Tasks with AI</span>
          </div>
          <ChevronDown className="w-5 h-5 text-accent" />
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="w-full bg-surface border border-accent rounded-lg shadow-sm">
          <div className="p-4 border-b border-accent flex justify-between items-center">
            <h2 className="text-lg font-medium text-text">Create Tasks with AI</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {isAiLoading ? (
              <AiThinkingPanel />
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="aiInput" className="block text-sm font-medium text-text mb-1">
                    Paste your meeting notes, transcript, or any text to extract tasks
                  </label>
                  <textarea
                    id="aiInput"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Paste your text here..."
                    className="w-full rounded border border-accent bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setAiInput('');
                      setIsExpanded(false);
                    }}
                    className="px-4 py-2 text-sm text-text hover:text-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAiCreate}
                    className="px-4 py-2 text-sm bg-accent text-surface rounded hover:bg-accent/90 transition-colors"
                  >
                    Generate Tasks
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmAiTasksModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        tasks={reviewActionItems}
        summary={reviewSummary}
        onConfirm={(tasks) => {
          handleConfirmSave(tasks);
          setIsExpanded(false);
        }}
      />
    </div>
  );
}
