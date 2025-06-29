'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Confetti from 'react-confetti';

export function ConfettiOverlay() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={150}
      gravity={0.4}
      recycle={false}
      run={true}
    />,
    document.body,
  );
}
