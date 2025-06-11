'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function FullScreenModal({ open, onClose, children, title }: FullScreenModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className="relative w-full h-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-t-2xl shadow-lg flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <span
                id="modal-title"
                className="font-semibold text-lg text-zinc-900 dark:text-zinc-100"
              >
                {title}
              </span>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
