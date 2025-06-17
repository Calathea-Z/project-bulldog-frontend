'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
import { AnimatePresence, motion } from 'framer-motion';

export default function DashboardPage() {
  const [showAiInput, setShowAiInput] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);

  const { data: items = [], isLoading, refetch } = useActionItems();

  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();

  const handleRefresh = async () => {
    await refetch();
    toast.success('Refreshed!');
  };

  const { isPulling, isRefreshing, pullPercent, offsetY } = usePullToRefresh(handleRefresh);

  useEffect(() => {
    const timeoutRef = { current: null as NodeJS.Timeout | null };

    const onFocus = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => refetch(), 100);
    };

    window.addEventListener('focus', onFocus);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [refetch]);

  const closeFab = () => setFabExpanded(false);

  const handleVoiceCapture = async () => {
    closeFab();
    toast.success('Voice capture coming soon!');
  };

  const timeSensitiveTasks = items.filter((item) => {
    if (!item.dueAt) return false;
    const dueDate = new Date(item.dueAt);
    const today = new Date();
    return !item.isDone && dueDate <= today;
  }).length;

  //TODO: Implement this, right now is just a placeholder
  const lastSummary =
    'Your tasks are well organized. Consider prioritizing the time-sensitive items.';

  return (
    <main className="p-4 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>

      <PrivacyNotice />

      <AiTaskModal open={showAiInput} onClose={() => setShowAiInput(false)} mode="manual" />

      {/* ✅ Animate full content shift while pulling */}
      <motion.div
        className="space-y-8"
        animate={{ y: offsetY }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      >
        {(isPulling || isRefreshing) && (
          <PullIndicator isRefreshing={isRefreshing} percent={pullPercent} />
        )}

        <AnimatePresence mode="wait">
          {(timeSensitiveTasks > 0 || !!lastSummary) && (
            <motion.div
              key="ai-suggestions-wrapper"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <AiSuggestions lastSummary={lastSummary} timeSensitiveTasks={timeSensitiveTasks} />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          <EnhancedTaskList
            items={items}
            onToggle={(id) => toggleDone.mutate(id)}
            onDelete={(id) => deleteActionItem.mutate(id)}
            onUpdate={updateActionItem}
            isLoading={isLoading}
          />
        </div>
      </motion.div>

      <TaskCreationFab
        expanded={fabExpanded}
        setExpanded={setFabExpanded}
        onVoiceCapture={handleVoiceCapture}
      />
    </main>
  );
}
