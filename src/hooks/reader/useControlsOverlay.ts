import { useState, useRef, useCallback, useEffect } from 'react';

interface UseControlsOverlayOptions {
  autoHideMs?: number;
  isSettingsOpen?: boolean;
}

export function useControlsOverlay({
  autoHideMs = 3500,
  isSettingsOpen = false,
}: UseControlsOverlayOptions = {}) {
  const [showControls, setShowControls] = useState<boolean>(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (!isSettingsOpen) {
        setShowControls(false);
      }
    }, autoHideMs);
  }, [autoHideMs, isSettingsOpen]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [resetHideTimer]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  return {
    showControls,
    setShowControls,
    toggleControls,
    resetHideTimer,
  };
}
