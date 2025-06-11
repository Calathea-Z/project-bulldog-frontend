'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrivacyNotice = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const lastVisit = localStorage.getItem('lastPrivacyNoticeVisit');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
      setShowNotice(true);
      localStorage.setItem('lastPrivacyNoticeVisit', today);
    }

    setChecked(true);
  }, []);

  const handleDismissNotice = () => {
    setShowNotice(false);
  };

  return (
    <AnimatePresence>
      {checked && showNotice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-blue-50/70 border border-blue-200/50 rounded-md px-3 py-2 mb-4 flex items-center justify-between gap-2 text-xs text-blue-800"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p>
              Tasks are generated from your input.{' '}
              <strong className="font-medium">Nothing is saved unless you confirm.</strong>
            </p>
          </div>
          <button
            onClick={handleDismissNotice}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
