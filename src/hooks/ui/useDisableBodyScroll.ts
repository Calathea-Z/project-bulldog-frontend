import { useEffect } from 'react';

export function useDisableBodyScroll(shouldDisable: boolean = true) {
  useEffect(() => {
    if (!shouldDisable) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [shouldDisable]);
}
