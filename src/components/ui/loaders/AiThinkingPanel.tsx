'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TypewriterText } from '../TypewriterText';
import { messages } from '@/constants/aiThinkingMessages';

export default function AiThinkingPanel() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[200px] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-background border border-accent rounded-lg shadow-sm flex flex-col items-center space-y-4">
        <div className="relative w-12 h-12">
          <Image
            src="/icon-512.png"
            alt="AI Avatar"
            fill
            className="rounded-full animate-bounce-slow"
            priority
          />
        </div>
        <p className="text-base font-medium text-center text-foreground">
          <TypewriterText text={messages[messageIndex]} />
        </p>
        <div className="w-full space-y-2">
          <div className="h-3 bg-accent/20 rounded w-3/4" />
          <div className="h-3 bg-accent/20 rounded w-5/6" />
          <div className="h-3 bg-accent/20 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
