// AiTaskEditor.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, Trash2 } from 'lucide-react';
import { ReminderToggle, BulldogDatePicker } from '@/components';
import { useUserTimeZoneDisplay } from '@/hooks';
import type { MinimalActionItem } from '@/types/ai';

type AiTaskEditorProps = {
  tasks: MinimalActionItem[];
  onEdit: (index: number, value: Partial<MinimalActionItem>) => void;
  onDelete: (index: number) => void;
};

export function AiTaskEditor({ tasks, onEdit, onDelete }: AiTaskEditorProps) {
  const userTimeZoneDisplay = useUserTimeZoneDisplay();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <ul className="space-y-3">
      {tasks.map((task, i) => {
        const isExpanded = expandedIndex === i;

        return (
          <motion.li
            key={i}
            layout
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <textarea
                value={task.text}
                onChange={(e) => onEdit(i, { text: e.target.value })}
                className="text-sm w-full bg-transparent resize-none focus:outline-none"
                placeholder="Action item..."
                rows={1}
              />
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => onDelete(i)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  aria-label="Toggle More Options"
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <BulldogDatePicker
                    selected={task.suggestedTime ? new Date(task.suggestedTime) : null}
                    onChange={(date) => onEdit(i, { suggestedTime: date?.toISOString() ?? null })}
                  />

                  {userTimeZoneDisplay && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Times shown in your timezone:
                      <span className="font-medium ml-1">{userTimeZoneDisplay}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <label className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={task.isDateOnly}
                        onChange={(e) => onEdit(i, { isDateOnly: e.target.checked })}
                        className="accent-blue-600"
                      />
                      All-day
                    </label>
                  </div>

                  <ReminderToggle
                    shouldRemind={task.shouldRemind ?? false}
                    onShouldRemindChange={(value) => onEdit(i, { shouldRemind: value })}
                    reminderMinutesBeforeDue={task.reminderMinutesBeforeDue ?? null}
                    onReminderMinutesChange={(value) =>
                      onEdit(i, { reminderMinutesBeforeDue: value })
                    }
                    disabled={!task.suggestedTime}
                    className="mt-4"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}
