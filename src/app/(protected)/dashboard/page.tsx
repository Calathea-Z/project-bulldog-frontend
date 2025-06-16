'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EnhancedTaskList, AiSuggestions, TaskCreationFab } from '@/components';
import { FullScreenModal } from '@/components/ui/FullScreenModal';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { PrivacyNotice } from '@/components/ui/PrivacyNotice';
import AiTaskFullScreenModal from '@/components/ui/AiTaskFullScreenModal';
import {
  useActionItems,
  useToggleActionItemDone,
  useDeleteActionItem,
  useUpdateActionItem,
} from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullIndicator from '@/components/ui/PullIndicator';

export default function DashboardPage() {
  const [showAiInput, setShowAiInput] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const router = useRouter();

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
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  const closeFab = () => setFabExpanded(false);

  const handleTextInput = () => {
    closeFab();
    toast.success('Manual input coming soon!');
  };

  const handleFileUpload = () => {
    closeFab();
    toast.success('File upload coming soon!');
  };

  const handleVoiceCapture = () => {
    closeFab();
    toast.success('Voice capture coming soon!');
  };

  const handleAiCreate = () => {
    closeFab();
    setShowAiInput(true);
  };

  const timeSensitiveTasks = items.filter((item) => {
    if (!item.dueAt) return false;
    const dueDate = new Date(item.dueAt);
    const today = new Date();
    return !item.isDone && dueDate <= today;
  }).length;

  const lastSummary =
    'Your tasks are well organized. Consider prioritizing the time-sensitive items.';

  return (
    <main className="p-4 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>

      <PrivacyNotice />

      <FullScreenModal
        open={showAiInput}
        onClose={() => setShowAiInput(false)}
        title="Create Tasks With AI"
      >
        <AiTaskFullScreenModal open={showAiInput} onClose={() => setShowAiInput(false)} />
      </FullScreenModal>

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
        onAiCreate={handleAiCreate}
      />
    </main>
  );
}
