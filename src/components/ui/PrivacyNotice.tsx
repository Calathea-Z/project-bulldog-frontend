import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export const PrivacyNotice = () => {
  const [showNotice, setShowNotice] = useState(false);

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

  if (!showNotice) return null;

  return (
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
  );
};
