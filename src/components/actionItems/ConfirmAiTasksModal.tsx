'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

interface ConfirmAiTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: { text: string }[];
  summary: string;
  onConfirm: (approvedTasks: { text: string }[]) => void;
}

export default function ConfirmAiTasksModal({
  isOpen,
  onClose,
  tasks,
  summary,
  onConfirm,
}: ConfirmAiTasksModalProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [editableTasks, setEditableTasks] = useState(tasks);

  useEffect(() => {
    console.log('Modal isOpen state:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    setEditableTasks(tasks);
  }, [tasks]);

  const handleTaskEdit = (index: number, newText: string) => {
    const updated = [...editableTasks];
    updated[index].text = newText;
    setEditableTasks(updated);
  };

  const handleTaskDelete = (index: number) => {
    const updated = [...editableTasks];
    updated.splice(index, 1);
    setEditableTasks(updated);
  };

  const handleConfirm = () => {
    onConfirm(editableTasks);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl rounded-2xl bg-background p-6 shadow-xl border border-muted focus:outline-none">
          <div className="flex justify-between items-start mb-4">
            <DialogTitle className="text-xl font-semibold">Confirm AI-Generated Tasks</DialogTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted mb-4">
            These tasks were extracted from your input. You can edit or remove them before saving.
          </p>

          <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
            {editableTasks.length === 0 && (
              <li className="text-sm text-muted text-center italic">No tasks remaining</li>
            )}
            {editableTasks.map((task, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => handleTaskEdit(index, e.target.value)}
                  className="flex-1 border border-accent rounded px-3 py-1 text-sm"
                />
                <button
                  onClick={() => handleTaskDelete(index)}
                  className="text-destructive hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-primary text-sm underline"
            >
              {showSummary ? 'Hide Summary' : 'View Summary'}
            </button>
            {showSummary && (
              <div className="mt-2 p-3 bg-muted rounded border text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="rounded px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded px-4 py-2 text-sm bg-primary text-white hover:opacity-90"
              disabled={editableTasks.length === 0}
            >
              Confirm & Save Tasks
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
