'use client';

import { Brain, Clock } from 'lucide-react';

interface AiSuggestionsProps {
  lastSummary?: string;
  timeSensitiveTasks?: number;
}

export function AiSuggestions({ lastSummary, timeSensitiveTasks = 0 }: AiSuggestionsProps) {
  return (
    <div className="space-y-4 mb-6">
      {lastSummary && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Last Summary</h3>
              <p className="text-sm text-gray-600">{lastSummary}</p>
            </div>
          </div>
        </div>
      )}

      {timeSensitiveTasks > 0 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 mb-1">Time-Sensitive Tasks</h3>
              <p className="text-sm text-amber-800">
                You have {timeSensitiveTasks} {timeSensitiveTasks === 1 ? 'task' : 'tasks'} that{' '}
                {timeSensitiveTasks === 1 ? 'looks' : 'look'} time-sensitive
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
