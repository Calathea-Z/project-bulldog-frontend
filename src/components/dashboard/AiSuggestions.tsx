'use client';

import { useEffect, useState } from 'react';
import { Brain, Clock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface AiSuggestionsProps {
  lastSummary?: string;
  timeSensitiveTasks?: number;
}

export default function AiSuggestions({ lastSummary, timeSensitiveTasks = 0 }: AiSuggestionsProps) {
  const [showSummary, setShowSummary] = useState(!!lastSummary);
  const [showTimeTasks, setShowTimeTasks] = useState(timeSensitiveTasks > 0);

  // Show summary again if a new one appears
  useEffect(() => {
    if (lastSummary) setShowSummary(true);
  }, [lastSummary]);

  // Show time-sensitive warning again if new tasks appear
  useEffect(() => {
    if (timeSensitiveTasks > 0) setShowTimeTasks(true);
  }, [timeSensitiveTasks]);

  // Fully skip rendering if nothing to show
  if (!showSummary && !showTimeTasks) return null;

  const taskLabel = timeSensitiveTasks === 1 ? 'task' : 'tasks';
  const verb = timeSensitiveTasks === 1 ? 'looks' : 'look';

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showSummary && lastSummary && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 p-4 shadow-sm relative"
          >
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss summary"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Last Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{lastSummary}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTimeTasks && timeSensitiveTasks > 0 && (
          <motion.div
            key="time-tasks"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 relative"
          >
            <button
              onClick={() => setShowTimeTasks(false)}
              className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400"
              aria-label="Dismiss time-sensitive tasks"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Time-Sensitive Tasks
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You have {timeSensitiveTasks} {taskLabel} that {verb} time-sensitive
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
