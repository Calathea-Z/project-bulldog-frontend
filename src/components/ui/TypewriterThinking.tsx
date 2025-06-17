'use client';

import { useEffect, useState } from 'react';
import { messages } from '@/constants/aiThinkingMessages';
import { TypewriterText } from './TypewriterText';

export function TypewriterThinking() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);

  // When TypewriterText finishes, advance to the next message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
      setCycleKey((k) => k + 1); // force TypewriterText to restart
    }, 2600); // total time per message (typing+pause+deleting)
    return () => clearTimeout(timer);
  }, [cycleKey]);

  return (
    <div className="mt-2 text-xs text-blue-600 font-mono min-h-[1.5em]">
      <TypewriterText
        key={cycleKey}
        text={messages[messageIndex]}
        typingSpeed={60}
        deletingSpeed={35}
        pauseTime={900}
      />
    </div>
  );
}
