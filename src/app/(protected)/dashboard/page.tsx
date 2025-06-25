'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';
import {
  EnhancedTaskList,
  AiSuggestions,
  TaskCreationFab,
  LogoutButton,
  PrivacyNotice,
  AiTaskModal,
  PullIndicator,
} from '@/components';
import {
  useActionItems,
  useToggleActionItemDone,
  useDeleteActionItem,
  useUpdateActionItem,
  usePullToRefresh,
} from '@/hooks';
import { getMutationErrorMessage } from '@/utils';
import { DASHBOARD_STRINGS, ACCESSIBILITY_LABELS } from '@/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { PullToRefreshContainer } from '@/components/ui/PullToRefreshContainer';

export default function DashboardPage() {
  const [showAiInput, setShowAiInput] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);

  const { data: items = [], isLoading, refetch } = useActionItems();

  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();

  const handleRefresh = async () => {
    await refetch();
    toast.success(DASHBOARD_STRINGS.REFRESH_SUCCESS_MESSAGE);
  };

  const { isPulling, isRefreshing, pullPercent, offsetY } = usePullToRefresh(handleRefresh);

  // Debounced refetch to handle rapid focus events efficiently
  const debouncedRefetch = useDebouncedCallback(() => {
    refetch();
  }, 300);

  useEffect(() => {
    window.addEventListener('focus', debouncedRefetch);
    return () => {
      window.removeEventListener('focus', debouncedRefetch);
    };
  }, [debouncedRefetch]);

  const closeFab = () => setFabExpanded(false);

  const handleVoiceCapture = async () => {
    closeFab();
    toast.success(DASHBOARD_STRINGS.VOICE_CAPTURE_COMING_SOON);
  };

  const timeSensitiveTasks = useMemo(() => {
    return items.filter((item) => {
      if (!item.dueAt) return false;
      const dueDate = new Date(item.dueAt);
      const today = new Date();
      return !item.isDone && dueDate <= today;
    }).length;
  }, [items]);

  //TODO: Implement this, right now is just a placeholder
  const lastSummary =
    'Your tasks are well organized. Consider prioritizing the time-sensitive items.';

  const handleToggle = (id: string) => {
    toggleDone.mutate(id, {
      onError: (error) => {
        const errorMessage = getMutationErrorMessage(
          error,
          DASHBOARD_STRINGS.UPDATE_TASK_STATUS_ERROR,
        );
        toast.error(errorMessage);
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteActionItem.mutate(id, {
      onError: (error) => {
        const errorMessage = getMutationErrorMessage(error, DASHBOARD_STRINGS.DELETE_TASK_ERROR);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <main
      className="p-4 max-w-4xl mx-auto pb-24"
      role="main"
      aria-label={ACCESSIBILITY_LABELS.DASHBOARD_MAIN}
    >
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{DASHBOARD_STRINGS.PAGE_TITLE}</h1>
        <LogoutButton />
      </header>

      <PrivacyNotice />

      {showAiInput && (
        <AiTaskModal open={showAiInput} onClose={() => setShowAiInput(false)} mode="manual" />
      )}

      {/* ✅ Animate full content shift while pulling */}
      <PullToRefreshContainer
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullPercent={pullPercent}
        offsetY={offsetY}
      >
        <AnimatePresence mode="wait">
          {(timeSensitiveTasks > 0 || !!lastSummary) && (
            <motion.section
              key="ai-suggestions-wrapper"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              aria-labelledby="ai-suggestions-heading"
            >
              <h2 id="ai-suggestions-heading" className="sr-only">
                {DASHBOARD_STRINGS.AI_SUGGESTIONS_HEADING}
              </h2>
              <AiSuggestions lastSummary={lastSummary} timeSensitiveTasks={timeSensitiveTasks} />
            </motion.section>
          )}
        </AnimatePresence>

        <section aria-labelledby="your-tasks-heading">
          <h2 id="your-tasks-heading" className="text-xl font-semibold mb-4">
            {DASHBOARD_STRINGS.TASKS_SECTION_TITLE}
          </h2>
          <EnhancedTaskList
            items={items}
            onToggle={(id) => handleToggle(id)}
            onDelete={(id) => handleDelete(id)}
            onUpdate={updateActionItem}
            isLoading={isLoading}
          />
        </section>
      </PullToRefreshContainer>

      <TaskCreationFab
        expanded={fabExpanded}
        setExpanded={setFabExpanded}
        onVoiceCapture={handleVoiceCapture}
      />
    </main>
  );
}
