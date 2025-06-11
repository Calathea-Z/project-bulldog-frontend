'use client';

import { Plus, FileText, Mic, Type, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCreationFabProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onTextInput: () => void;
  onFileUpload: () => void;
  onVoiceCapture: () => void;
  onAiCreate: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export default function TaskCreationFab({
  expanded,
  setExpanded,
  onTextInput,
  onFileUpload,
  onVoiceCapture,
  onAiCreate,
}: TaskCreationFabProps) {
  const handleAction = (action: () => void) => {
    setExpanded(false);
    action();
  };

  const toggleExpand = () => setExpanded(!expanded);

  const actions = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Create with AI',
      onClick: onAiCreate,
      bg: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
    },
    {
      icon: <Type className="w-5 h-5" />,
      label: 'Manual Input',
      onClick: onTextInput,
      bg: 'bg-white text-gray-700',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Upload File',
      onClick: onFileUpload,
      bg: 'bg-white text-gray-700',
    },
    {
      icon: <Mic className="w-5 h-5" />,
      label: 'Voice Capture',
      onClick: onVoiceCapture,
      bg: 'bg-white text-gray-700',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/*Transparent backdrop to close menu on outside click */}
      <AnimatePresence>
        {expanded && (
          <motion.button
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setExpanded(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/*Action buttons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            role="menu"
            className="absolute bottom-16 right-0 flex flex-col gap-2 z-50"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {actions.map(({ icon, label, onClick, bg }) => (
              <motion.button
                key={label}
                role="menuitem"
                variants={itemVariants}
                onClick={() => handleAction(onClick)}
                className={`${bg} shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors flex items-center gap-2`}
              >
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/*Main FAB*/}
      <button
        onClick={toggleExpand}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        aria-label={expanded ? 'Close task creation menu' : 'Open task creation menu'}
        aria-expanded={expanded}
      >
        <Plus
          className={`w-6 h-6 transform transition-transform duration-200 ease-in-out ${
            expanded ? 'rotate-45' : ''
          }`}
        />
      </button>
    </div>
  );
}
