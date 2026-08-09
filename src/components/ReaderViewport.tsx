import React, { useState, useRef } from 'react';
import { type ComicMetadata } from '../db';
import { ReaderSettings, type ReaderBgColor } from './ReaderSettings';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTheme, type Theme } from '../context/ThemeContext';
import { useComicReader } from '../hooks/reader/useComicReader';
import { useControlsOverlay } from '../hooks/reader/useControlsOverlay';
import { useKeyboardNav } from '../hooks/reader/useKeyboardNav';
import { useFullscreen } from '../hooks/useFullscreen';
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderFooter } from './reader/ReaderFooter';
import { SinglePageView } from './reader/SinglePageView';
import { DoublePageView } from './reader/DoublePageView';
import { WebtoonView } from './reader/WebtoonView';
import { ReaderProgressBar } from './reader/ReaderProgressBar';

interface ReaderViewportProps {
  comic: ComicMetadata;
  onClose: () => void;
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({ comic, onClose }) => {
  const { theme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  const {
    pageUrls,
    currentIndex,
    setCurrentIndex,
    isLoading,
    loadError,
    config,
    setConfig,
    totalPages,
    progressPercent,
    loadPageUrl,
    goToNextPage,
    goToPrevPage,
  } = useComicReader({ comic });

  const { showControls, setShowControls, resetHideTimer } = useControlsOverlay({
    isSettingsOpen,
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useKeyboardNav({
    isRtl: config.isRtl,
    isSettingsOpen,
    onNext: goToNextPage,
    onPrev: goToPrevPage,
    onToggleFullscreen: toggleFullscreen,
    onSetMode: (mode) => setConfig((c) => ({ ...c, mode })),
    onClose,
    onResetHideTimer: resetHideTimer,
  });

  // Touch & Click Gestures
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    resetHideTimer();

    if (config.mode === 'webtoon') {
      setShowControls((prev) => !prev);
      return;
    }

    const width = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < width * 0.3) {
      config.isRtl ? goToNextPage() : goToPrevPage();
    } else if (clickX > width * 0.7) {
      config.isRtl ? goToPrevPage() : goToNextPage();
    } else {
      setShowControls((prev) => !prev);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        config.isRtl ? goToPrevPage() : goToNextPage();
      } else {
        config.isRtl ? goToNextPage() : goToPrevPage();
      }
    }
    touchStartX.current = null;
  };

  const getCanvasBgHex = (currentTheme: Theme, bgOverride: ReaderBgColor) => {
    if (bgOverride === 'sepia') return '#fbf0d9';
    if (bgOverride === 'dark') return '#1c1c1e';
    if (currentTheme === 'light') return '#ffffff';
    return '#000000';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-vg-primary text-text-primary flex flex-col items-center justify-center p-6 select-none">
        <Loader2 className="w-12 h-12 text-accent-blue animate-spin mb-4" />
        <h2 className="text-lg font-bold tracking-tight mb-1">Opening Comic</h2>
        <p className="text-xs text-text-secondary font-mono">{comic.title}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-vg-primary text-text-primary flex flex-col items-center justify-center p-6 select-none">
        <div className="w-16 h-16 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to Open Comic</h2>
        <p className="text-xs text-text-secondary max-w-md text-center mb-6 font-mono">{loadError}</p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-button bg-vg-tertiary text-text-primary text-xs font-semibold hover:bg-vg-elevated transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const currentPageUrl = pageUrls[currentIndex];
  const nextSpreadUrl = pageUrls[currentIndex + 1];

  return (
    <div
      onMouseMove={resetHideTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor: getCanvasBgHex(theme, config.bgColor) }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-fade-in"
    >
      {/* Dynamic Brightness Filter Overlay Container */}
      <div
        style={{ filter: `brightness(${config.brightness}%)` }}
        className="w-full h-full flex flex-col flex-1 min-h-0 relative"
      >
        <ReaderHeader
          comic={comic}
          showControls={showControls}
          isFullscreen={isFullscreen}
          onClose={onClose}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Viewport Canvas */}
        <div
          onClick={handleViewportClick}
          className="flex-1 flex items-center justify-center overflow-hidden relative cursor-pointer"
        >
          {config.mode === 'single' && (
            <SinglePageView pageUrl={currentPageUrl} currentIndex={currentIndex} />
          )}

          {config.mode === 'spread' && (
            <DoublePageView
              currentIndex={currentIndex}
              currentPageUrl={currentPageUrl}
              nextSpreadUrl={nextSpreadUrl}
              isRtl={config.isRtl}
              pageGap={config.pageGap}
            />
          )}

          {config.mode === 'webtoon' && (
            <WebtoonView
              totalPages={totalPages}
              pageUrls={pageUrls}
              isLoading={isLoading}
              pageGap={config.pageGap}
              onPageVisible={setCurrentIndex}
              loadPageUrl={loadPageUrl}
            />
          )}
        </div>

        <ReaderFooter
          showControls={showControls}
          currentIndex={currentIndex}
          totalPages={totalPages}
          progressPercent={progressPercent}
          config={config}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onIndexChange={setCurrentIndex}
          onModeChange={(mode) => setConfig((c) => ({ ...c, mode }))}
        />
      </div>

      <ReaderProgressBar showControls={showControls} progressPercent={progressPercent} />

      <ReaderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
      />
    </div>
  );
};
