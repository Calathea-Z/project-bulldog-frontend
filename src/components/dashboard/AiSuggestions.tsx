'use client';

import { Brain, Clock } from 'lucide-react';

interface AiSuggestionsProps {
  lastSummary?: string;
  timeSensitiveTasks?: number;
}

export default function AiSuggestions({ lastSummary, timeSensitiveTasks = 0 }: AiSuggestionsProps) {
  const hasTimeSensitiveTasks = timeSensitiveTasks > 0;
  const taskLabel = timeSensitiveTasks === 1 ? 'task' : 'tasks';
  const verb = timeSensitiveTasks === 1 ? 'looks' : 'look';

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

      {hasTimeSensitiveTasks && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900 mb-1">Time-Sensitive Tasks</h3>
              <p className="text-sm text-yellow-800">
                You have {timeSensitiveTasks} {taskLabel} that {verb} time-sensitive
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
