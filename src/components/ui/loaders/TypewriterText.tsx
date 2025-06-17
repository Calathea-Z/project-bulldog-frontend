import { useEffect, useState } from 'react';
import { TypewriterTextProps } from '@/types';

export const TypewriterText = ({
  text,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1000,
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting && currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else if (!isDeleting && currentIndex === text.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && currentIndex > 0) {
          setDisplayText(text.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentIndex(0);
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, text, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="shimmer-text">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
