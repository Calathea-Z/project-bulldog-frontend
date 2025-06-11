'use client';

import { useState } from 'react';
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
import { Info, X } from 'lucide-react';

export default function DashboardPage() {
  const [showNotice, setShowNotice] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const router = useRouter();
  const { data: items = [], isLoading } = useActionItems();
  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();

  const handleDismissNotice = () => {
    setShowNotice(false);
  };

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

  // Calculate time-sensitive tasks (due today or overdue)
  const timeSensitiveTasks = items.filter((item) => {
    if (!item.dueAt) return false;
    const dueDate = new Date(item.dueAt);
    const today = new Date();
    return !item.isDone && dueDate <= today;
  }).length;

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

      <AiSuggestions
        lastSummary="Your tasks are well organized. Consider prioritizing the time-sensitive items."
        timeSensitiveTasks={timeSensitiveTasks}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
        <EnhancedTaskList
          items={items}
          onToggle={(id) => toggleDone.mutate(id)}
          onDelete={(id) => deleteActionItem.mutate(id)}
          onUpdate={updateActionItem}
          isLoading={isLoading}
        />
      </div>

      <TaskCreationFab
        expanded={fabExpanded}
        setExpanded={setFabExpanded}
        onTextInput={handleTextInput}
        onFileUpload={handleFileUpload}
        onVoiceCapture={handleVoiceCapture}
        onAiCreate={handleAiCreate}
      />
    </main>
  );
}
