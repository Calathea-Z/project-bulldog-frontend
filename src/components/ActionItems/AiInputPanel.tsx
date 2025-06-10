'use client';

import AiThinkingPanel from '../ui/loaders/AiThinkingPanel';
import { X } from 'lucide-react';

interface AiInputPanelProps {
  aiInput: string;
  setAiInput: (val: string) => void;
  handleAiCreate: () => void;
  isLoading: boolean;
}

export default function AiInputPanel({
  aiInput,
  setAiInput,
  handleAiCreate,
  isLoading,
}: AiInputPanelProps) {
  return (
    <div className="sticky top-0 z-20 bg-background p-4 border-b border-accent mb-4 transition-all duration-300">
      <div className="h-[200px] flex items-center justify-center">
        {isLoading ? (
          <AiThinkingPanel />
        ) : (
          <div className="w-full h-full flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="aiInput" className="block text-sm font-medium text-gray-700">
                AI‐Assisted Task Creation (paste meeting notes, transcript, etc.)
              </label>
              {aiInput && (
                <button
                  onClick={() => setAiInput('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              id="aiInput"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="“Generate tasks from my 10-minute Zoom call…”"
              className="w-full rounded border border-accent bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAiCreate}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Add AI Tasks
              </button>
              {aiInput && (
                <button
                  onClick={() => setAiInput('')}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
