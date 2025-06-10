'use client';

import { logoutUser } from '@/services';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EnhancedTaskList } from '@/components/ActionItems';
import { AiSuggestions } from '@/components/dashboard/AiSuggestions';
import { TaskCreationFab } from '@/components/dashboard/TaskCreationFab';
import { FullScreenModal } from '@/components/ui/FullScreenModal';
import AiTaskFullScreenModal from '@/components/ui/AiTaskFullScreenModal';
import {
  useActionItems,
  useToggleActionItemDone,
  useDeleteActionItem,
  useUpdateActionItem,
} from '@/hooks';
import { Info, X } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const router = useRouter();
  const { data: items = [], isLoading } = useActionItems();
  const toggleDone = useToggleActionItemDone();
  const deleteActionItem = useDeleteActionItem();
  const updateActionItem = useUpdateActionItem();

  useEffect(() => {
    // Check if this is the first visit of the day
    const lastVisit = localStorage.getItem('lastPrivacyNoticeVisit');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
      setShowNotice(true);
      localStorage.setItem('lastPrivacyNoticeVisit', today);
    }
  }, []);

  const handleDismissNotice = () => {
    setShowNotice(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <button
          onClick={handleLogout}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
              Logging out…
            </>
          ) : (
            'Logout'
          )}
        </button>
      </div>

      {showNotice && (
        <div className="bg-blue-50/70 border border-blue-200/50 rounded-md px-3 py-2 mb-4 flex items-center justify-between gap-2 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p>Tasks will be generated from your input. Nothing is saved unless you confirm.</p>
          </div>
          <button
            onClick={handleDismissNotice}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
