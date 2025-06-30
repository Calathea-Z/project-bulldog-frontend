import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

interface FormErrorBoxProps {
  error: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormErrorBox({ error, children, className = '' }: FormErrorBoxProps) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`text-sm text-center space-y-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-red-950/50 border border-red-200/20 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-2">
        <span className="text-destructive flex items-center">
          <AlertCircle className="w-5 h-5" />
        </span>
        <div className="flex-1 text-left">
          <p className="text-destructive mb-2">{error}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
