'use client';

import { logoutUser } from '@/services';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CollapsibleAiInput, EnhancedTaskList } from '@/components/ActionItems';
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

  return (
    <main className="p-4 max-w-4xl mx-auto">
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

      <CollapsibleAiInput />

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
    </main>
  );
}
