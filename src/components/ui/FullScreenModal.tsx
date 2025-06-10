'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function FullScreenModal({ open, onClose, children, title }: FullScreenModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full h-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-t-2xl shadow-lg flex flex-col animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{title}</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
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
  );
}
