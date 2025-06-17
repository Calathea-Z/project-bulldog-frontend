'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAiTaskGenerator } from '@/hooks/ai/useAiTaskGenerator';
import TypewriterThinking from './TypewriterThinking';
import { api } from '@/services/apiService';
import type { AiSummaryWithTasksResponse, MinimalActionItem, AiTaskModalMode } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AiTaskModalProps {
  open: boolean;
  onClose: () => void;
  mode: AiTaskModalMode;
}

export default function AiTaskModal({ open, onClose, mode }: AiTaskModalProps) {
  // —— manual‐input hook ——
  const {
    aiInput,
    setAiInput,
    isAiLoading,
    reviewActionItems,
    reviewSummary,
    handleAiCreate,
    handleConfirmSave,
    setReviewSummary,
    setReviewActionItems,
  } = useAiTaskGenerator();

  // —— shared UI state ——
  const [showReview, setShowReview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // —— manual editable tasks ——
  const [editableManualTasks, setEditableManualTasks] = useState<MinimalActionItem[]>([]);

  useEffect(() => {
    setEditableManualTasks(
      reviewActionItems.map((item) => ({
        text: item.text,
        suggestedTime: item.suggestedTime,
        isDateOnly: item.isDateOnly ?? false,
      })),
    );
  }, [reviewActionItems]);

  // —— file‐upload state ——
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileSummary, setFileSummary] = useState<string>('');
  const [editableFileTasks, setEditableFileTasks] = useState<MinimalActionItem[]>([]);

  useEffect(() => {
    console.log('🔥 reviewActionItems coming in:', reviewActionItems);
    setEditableFileTasks(
      reviewActionItems.map((item) => ({
        text: item.text,
        suggestedTime: item.suggestedTime,
        isDateOnly: item.isDateOnly ?? false,
      })),
    );
  }, [reviewActionItems]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // —— common helpers ——
  const handleCancel = () => {
    onClose();
    setAiInput('');
    setSelectedFile(null);
    setShowReview(false);
    setShowSummary(false);
    setUploadError(null);
    setFileSummary('');
  };

  const handleTaskEdit = (index: number, newText: string) => {
    if (mode === 'manual') {
      const t = [...editableManualTasks];
      t[index].text = newText;
      setEditableManualTasks(t);
    } else {
      const t = [...editableFileTasks];
      t[index].text = newText;
      setEditableFileTasks(t);
    }
  };

  const handleTaskDelete = (index: number) => {
    if (mode === 'manual') {
      setEditableManualTasks((t) => t.filter((_, i) => i !== index));
    } else {
      setEditableFileTasks((t) => t.filter((_, i) => i !== index));
    }
  };

  const handleTaskTimeEdit = (index: number, date: Date | null) => {
    if (mode === 'manual') {
      const t = [...editableManualTasks];
      t[index].suggestedTime = date?.toISOString() || null;
      setEditableManualTasks(t);
    } else {
      const t = [...editableFileTasks];
      t[index].suggestedTime = date?.toISOString() || null;
      setEditableFileTasks(t);
    }
  };

  const handleTaskDateOnlyToggle = (index: number, value: boolean) => {
    if (mode === 'manual') {
      const t = [...editableManualTasks];
      t[index].isDateOnly = value;
      setEditableManualTasks(t);
    } else {
      const t = [...editableFileTasks];
      t[index].isDateOnly = value;
      setEditableFileTasks(t);
    }
  };

  // —— manual mode submission ——
  const handleManualSubmit = async () => {
    await handleAiCreate();
    setShowReview(true);
  };

  // —— file mode upload ——
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const resp = await api.post<AiSummaryWithTasksResponse>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!resp.data?.summary) {
        throw new Error('No summary in response');
      }

      // Update both summary and action items
      setFileSummary(resp.data.summary);
      setReviewSummary(resp.data.summary);
      setReviewActionItems(
        resp.data.actionItems.map((item) => ({
          text: item.text,
          suggestedTime: item.dueAt || item.suggestedTime || null,
          isDateOnly: item.isDateOnly ?? false,
        })),
      );
      setShowReview(true);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed.');
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // —— confirm & save ——
  const handleConfirm = async () => {
    const tasks = mode === 'manual' ? editableManualTasks : editableFileTasks;
    try {
      await handleConfirmSave(tasks);
      toast.success(`Added ${tasks.length} action item${tasks.length > 1 ? 's' : ''}`);
      handleCancel();
    } catch (error) {
      toast.error('Failed to save summary and action items');
    }
  };

  const summaryRef = useRef<HTMLDivElement | null>(null);

  // Handler for View Summary button that scrolls summary into view
  const handleViewSummary = () => {
    setShowSummary((prev) => {
      const next = !prev;
      if (!prev) {
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 0);
      }
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
      <div className="flex flex-col h-full w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-none md:rounded-2xl shadow-lg animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-inherit p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            {mode === 'manual' ? 'Create Tasks With AI' : 'Create Tasks With AI'}
          </span>
          <button
            onClick={handleCancel}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Task List or Input UI */}
        <div className="flex-1 overflow-y-auto p-4">
          {!showReview ? (
            // — Picking / generating —
            <>
              {mode === 'manual' ? (
                <>
                  <textarea
                    className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 mb-2 text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what you need to do..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={isAiLoading}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                      disabled={isAiLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleManualSubmit}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={isAiLoading || !aiInput.trim()}
                    >
                      Generate Tasks
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center mb-2">
                    <input
                      type="file"
                      hidden
                      id="file-upload"
                      accept=".txt,.md,.docx,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-6 h-6 text-zinc-400" />
                      <span className="text-sm">
                        {selectedFile?.name ?? 'Click to upload a file'}
                      </span>
                      <small className="text-xs text-zinc-500">Supported: TXT, MD, DOCX, PDF</small>
                    </label>
                  </div>
                  {uploadError && <p className="text-red-500 text-sm text-center">{uploadError}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFileUpload}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={isUploading || !selectedFile}
                    >
                      Upload & Generate Tasks
                    </button>
                  </div>
                </>
              )}
              {(isUploading || isAiLoading) && <TypewriterThinking />}
            </>
          ) : (
            // --- Review & Edit UI (tasks list) ---
            <div>
              <div className="font-medium mb-2">Review & Edit Tasks</div>
              <ul className="space-y-2 mb-4 pr-2">
                {(mode === 'manual' ? editableManualTasks : editableFileTasks).length === 0 && (
                  <li className="text-sm text-muted text-center italic">No tasks remaining</li>
                )}
                {(mode === 'manual' ? editableManualTasks : editableFileTasks).map((t, i) => (
                  <li key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <textarea
                        value={t.text}
                        onChange={(e) => handleTaskEdit(i, e.target.value)}
                        className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[160px] overflow-y-auto"
                        rows={2}
                        maxLength={1000}
                        aria-label={`Edit action item ${i + 1}`}
                      />
                      <button
                        onClick={() => handleTaskDelete(i)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="relative text-sm text-muted w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">📅</span>
                      <DatePicker
                        selected={t.suggestedTime ? new Date(t.suggestedTime) : null}
                        onChange={(date) => handleTaskTimeEdit(i, date)}
                        showTimeSelect={!t.isDateOnly}
                        dateFormat={t.isDateOnly ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm aa'}
                        placeholderText="Set due date"
                        minDate={new Date()}
                        className="w-full pl-9 pr-3 py-2 rounded-md border border-accent bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-1">
                      <input
                        type="checkbox"
                        id={`all-day-${i}`}
                        checked={t.isDateOnly}
                        onChange={(e) => handleTaskDateOnlyToggle(i, e.target.checked)}
                        className="accent-primary"
                      />
                      <label htmlFor={`all-day-${i}`} className="text-sm text-muted">
                        All-day
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
              {showSummary && (
                <div
                  ref={summaryRef}
                  className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm max-h-40 overflow-y-auto whitespace-pre-wrap text-blue-900"
                >
                  {mode === 'manual' ? reviewSummary : fileSummary}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {showReview && (
          <div className="sticky bottom-0 z-10 bg-inherit p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <button
              onClick={handleViewSummary}
              className="text-blue-600 text-xs underline mb-2 self-start"
            >
              {showSummary ? 'Hide Summary' : 'View Summary'}
            </button>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="rounded px-4 py-2 text-xs border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded px-4 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={
                  (mode === 'manual' ? editableManualTasks : editableFileTasks).length === 0
                }
              >
                Confirm & Save
              </button>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </div>
  );
}
