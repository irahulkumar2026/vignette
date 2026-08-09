import { useEffect } from 'react';
import { type ReadingMode } from '../../components/ReaderSettings';

interface UseKeyboardNavOptions {
  isRtl: boolean;
  isSettingsOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onToggleFullscreen: () => void;
  onSetMode: (mode: ReadingMode) => void;
  onClose: () => void;
  onResetHideTimer: () => void;
}

export function useKeyboardNav({
  isRtl,
  isSettingsOpen,
  onNext,
  onPrev,
  onToggleFullscreen,
  onSetMode,
  onClose,
  onResetHideTimer,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen) return;

      const key = e.key;

      if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') {
        e.preventDefault();
        isRtl ? onPrev() : onNext();
        onResetHideTimer();
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        e.preventDefault();
        isRtl ? onNext() : onPrev();
        onResetHideTimer();
      } else if (key === 'f' || key === 'F') {
        e.preventDefault();
        onToggleFullscreen();
      } else if (key === '1') {
        onSetMode('single');
      } else if (key === '2') {
        onSetMode('spread');
      } else if (key === '3') {
        onSetMode('webtoon');
      } else if (key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRtl, isSettingsOpen, onNext, onPrev, onToggleFullscreen, onSetMode, onClose, onResetHideTimer]);
}
