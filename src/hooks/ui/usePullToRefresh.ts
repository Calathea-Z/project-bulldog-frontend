import { useEffect, useState, useRef } from 'react';

/**
 * A custom hook that implements pull-to-refresh functionality for mobile devices.
 *
 * @param callback - An async function to be called when the pull threshold is reached
 * @param enabled - Whether the hook is enabled
 * @returns Object containing pull state and progress information
 *   - isPulling: boolean - Whether the user is currently pulling
 *   - isRefreshing: boolean - Whether the refresh callback is executing
 *   - pullPercent: number - Progress of the pull (0-100)
 *   - offsetY: number - Current vertical offset for animation
 */
export function usePullToRefresh(callback: () => Promise<void>, enabled: boolean = true) {
  // State for tracking pull and refresh status
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPercent, setPullPercent] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Refs for tracking touch position and drag state
  const startY = useRef(0);
  const isDragging = useRef(false);
  const currentPullPercent = useRef(0); // Track current pull percent in ref
  const hasMoved = useRef(false); // Track if user has actually moved finger
  const threshold = 80; // Distance in pixels required to trigger refresh
  const minPullDistance = 10; // Minimum distance to start showing pull indicator

  useEffect(() => {
    if (!enabled) return;

    /**
     * Gets the current scroll position of the window
     */
    const getScrollTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    /**
     * Handles the start of a touch event
     * Only initiates pull if at the top of the page and not already refreshing
     */
    const handleTouchStart = (e: TouchEvent) => {
      if (getScrollTop() <= 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
        hasMoved.current = false;
        currentPullPercent.current = 0;
        setIsPulling(false);
        setPullPercent(0);
        setOffsetY(0);
      }
    };

    /**
     * Handles touch movement
     * Calculates pull progress and updates visual feedback
     */
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > minPullDistance) {
        hasMoved.current = true;
        e.preventDefault(); // Prevent native pull-to-refresh
        const percent = Math.min((distance / threshold) * 100, 100);
        currentPullPercent.current = percent;
        setPullPercent(percent);
        setOffsetY(Math.min(distance, 80));
        setIsPulling(true);
      }
    };

    /**
     * Handles the end of a touch event
     * Triggers refresh if threshold was reached, otherwise resets state
     */
    const handleTouchEnd = async () => {
      if (!isDragging.current) return;

      // Only trigger refresh if user actually pulled down significantly
      if (hasMoved.current && currentPullPercent.current >= 100) {
        setIsRefreshing(true);
        setIsPulling(false);
        setOffsetY(60); // lock in place

        await callback();

        // Give some feedback time
        setTimeout(() => {
          setIsRefreshing(false);
          setOffsetY(0);
          setPullPercent(0);
          currentPullPercent.current = 0;
        }, 500);
      } else {
        // Reset state if no significant pull
        setIsPulling(false);
        setOffsetY(0);
        setPullPercent(0);
        currentPullPercent.current = 0;
      }

      isDragging.current = false;
      hasMoved.current = false;
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callback, isRefreshing, enabled]);

  return { isPulling, isRefreshing, pullPercent, offsetY };
}
