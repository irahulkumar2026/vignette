import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type ComicMetadata, getComicBlob, updateReadingPosition, getPageBlobFromDb } from '../db';
import { parseComicArchiveLazy, type LazyComicReader } from '../utils';
import { ReaderSettings, type ReaderConfig, type ReadingMode, type ReaderBgColor } from './ReaderSettings';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ReaderViewportProps {
  comic: ComicMetadata;
  onClose: () => void;
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({ comic, onClose }) => {
  const [reader, setReader] = useState<LazyComicReader | null>(null);
  const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(comic.currentPage || 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Controls Overlay State
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Reader Settings Config
  const [config, setConfig] = useState<ReaderConfig>({
    mode: 'single',
    brightness: 100,
    pageGap: 0,
    isRtl: false,
    preloadAdjacent: true,
    showPageNumbers: true,
    bgColor: 'black',
  });

  // Touch gesture refs & cache ref
  const touchStartX = useRef<number | null>(null);
  const webtoonContainerRef = useRef<HTMLDivElement>(null);
  const pageUrlsRef = useRef<Record<number, string>>({});
  pageUrlsRef.current = pageUrls;

  // 1. Instant Reader Load (< 10ms) via IndexedDB Page Cache + Lazy Fallback
  useEffect(() => {
    let isMounted = true;

    async function initReader() {
      setIsLoading(true);
      setLoadError(null);

      try {
        if (!comic.id) throw new Error('Invalid comic ID');

        // Check if page 0 is already in IndexedDB page cache
        const page0InDb = await getPageBlobFromDb(comic.id, 0);

        if (page0InDb && isMounted) {
          // Instant ready (< 5ms)!
          setIsLoading(false);
        }

        // Lazy archive reader fallback
        const blob = await getComicBlob(comic.id);
        if (blob) {
          const file = new File([blob], comic.fileName, { type: blob.type });
          const lazyReader = await parseComicArchiveLazy(file);
          if (isMounted) {
            setReader(lazyReader);
            setIsLoading(false);
          }
        } else if (!page0InDb) {
          throw new Error('Raw comic archive file missing from database.');
        }
      } catch (err) {
        console.error('Failed to initialize reader:', err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to extract comic archive.');
          setIsLoading(false);
        }
      }
    }

    initReader();

    return () => {
      isMounted = false;
      Object.values(pageUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [comic.id, comic.fileName]);

  // Helper to load & cache Object URL for a page index from IndexedDB or LazyReader
  const loadPageUrl = useCallback(
    async (idx: number): Promise<string | undefined> => {
      if (!comic.id || idx < 0) return undefined;
      if (pageUrlsRef.current[idx]) return pageUrlsRef.current[idx];

      try {
        // 1. Try reading pre-extracted page blob from IndexedDB (0ms instant!)
        let blob = await getPageBlobFromDb(comic.id, idx);

        // 2. Fallback to lazy archive parser if not in IndexedDB page cache yet
        if (!blob && reader) {
          blob = await reader.getPageBlob(idx);
        }

        if (!blob) return undefined;

        const url = URL.createObjectURL(blob);
        setPageUrls((prev) => ({ ...prev, [idx]: url }));
        return url;
      } catch (err) {
        console.error(`Failed to load page ${idx}:`, err);
        return undefined;
      }
    },
    [comic.id, reader]
  );

  // 2. Load active page + background preload adjacent pages
  useEffect(() => {
    loadPageUrl(currentIndex);

    if (config.mode === 'spread') {
      loadPageUrl(currentIndex + 1);
    }

    if (config.preloadAdjacent) {
      const timer = setTimeout(() => {
        [currentIndex - 1, currentIndex + 1, currentIndex + 2].forEach((idx) => {
          if (idx >= 0 && (!pageUrlsRef.current[idx])) {
            loadPageUrl(idx);
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [config.mode, config.preloadAdjacent, currentIndex, loadPageUrl]);

  // 3. Auto-save reading position to IndexedDB
  useEffect(() => {
    if (comic.id && !isLoading) {
      updateReadingPosition(comic.id, currentIndex).catch((err) =>
        console.error('Failed to update reading position:', err)
      );
    }
  }, [comic.id, currentIndex, isLoading]);

  // 4. Auto-hide controls overlay after 3.5s inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (!isSettingsOpen) {
        setShowControls(false);
      }
    }, 3500);
  }, [isSettingsOpen]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [resetHideTimer]);

  // 5. Navigation Handlers
  const totalPages = comic.pageCount || (reader ? reader.pageNames.length : 0);

  const goToNextPage = useCallback(() => {
    if (config.mode === 'spread') {
      setCurrentIndex((prev) => {
        if (prev === 0) return 1;
        return Math.min(totalPages - 1, prev + 2);
      });
    } else {
      setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  }, [config.mode, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (config.mode === 'spread') {
      setCurrentIndex((prev) => {
        if (prev <= 2) return 0;
        return Math.max(0, prev - 2);
      });
    } else {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [config.mode]);

  // 6. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 7. Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen) return;

      const key = e.key;

      if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') {
        e.preventDefault();
        config.isRtl ? goToPrevPage() : goToNextPage();
        resetHideTimer();
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        e.preventDefault();
        config.isRtl ? goToNextPage() : goToPrevPage();
        resetHideTimer();
      } else if (key === 'f' || key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === '1') {
        setConfig((c) => ({ ...c, mode: 'single' }));
      } else if (key === '2') {
        setConfig((c) => ({ ...c, mode: 'spread' }));
      } else if (key === '3') {
        setConfig((c) => ({ ...c, mode: 'webtoon' }));
      } else if (key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isRtl, goToNextPage, goToPrevPage, isSettingsOpen, onClose, resetHideTimer]);

  // 8. Touch & Click Gestures
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

  // 9. Webtoon Intersection Observer & Progressive Webtoon Loading
  useEffect(() => {
    if (config.mode !== 'webtoon' || isLoading || !webtoonContainerRef.current) return;

    const container = webtoonContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIdx = parseInt(entry.target.getAttribute('data-page-index') || '0', 10);
            setCurrentIndex(pageIdx);
            for (let i = pageIdx; i <= Math.min(totalPages - 1, pageIdx + 3); i++) {
              loadPageUrl(i);
            }
          }
        });
      },
      { root: container, threshold: 0.2 }
    );

    const pageEls = container.querySelectorAll('.webtoon-page');
    pageEls.forEach((el) => observer.observe(el));

    for (let i = 0; i < Math.min(totalPages, 5); i++) {
      loadPageUrl(i);
    }

    return () => observer.disconnect();
  }, [config.mode, isLoading, loadPageUrl, totalPages]);

  const getCanvasBgHex = (bg: ReaderBgColor) => {
    switch (bg) {
      case 'dark':
        return '#1c1c1e';
      case 'sepia':
        return '#2b261f';
      default:
        return '#000000';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 select-none">
        <Loader2 className="w-12 h-12 text-accent-blue animate-spin mb-4" />
        <h2 className="text-lg font-bold tracking-tight mb-1">Opening Comic</h2>
        <p className="text-xs text-text-secondary font-mono">{comic.title}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 select-none">
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

  const progressPercent =
    totalPages > 0 ? Math.min(100, Math.round(((currentIndex + 1) / totalPages) * 100)) : 0;

  const currentPageUrl = pageUrls[currentIndex];
  const nextSpreadUrl = pageUrls[currentIndex + 1];

  return (
    <div
      onMouseMove={resetHideTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor: getCanvasBgHex(config.bgColor) }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-fade-in"
    >
      {/* Dynamic Brightness Filter Overlay Container */}
      <div
        style={{ filter: `brightness(${config.brightness}%)` }}
        className="w-full h-full flex flex-col flex-1 min-h-0 relative"
      >
        {/* ================= HEADER BAR ================= */}
        <header
          className={`surface-header px-6 py-3 border-b border-vg-border flex items-center justify-between z-40 transition-all duration-200 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          {/* Left: Back Button & Title */}
          <div className="flex items-center space-x-4 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-button bg-vg-tertiary border border-vg-border transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate max-w-sm">{comic.title}</h2>
              {comic.author && (
                <p className="text-[11px] text-text-secondary truncate">{comic.author}</p>
              )}
            </div>
          </div>

          {/* Right: Quick Utility Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-button bg-vg-tertiary border border-vg-border text-text-secondary hover:text-text-primary transition-colors"
              title="Reading Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-button bg-vg-tertiary border border-vg-border text-text-secondary hover:text-text-primary transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ================= VIEWPORT CANVAS ================= */}
        <div
          onClick={handleViewportClick}
          className="flex-1 flex items-center justify-center overflow-hidden relative cursor-pointer"
        >
          {/* 1. SINGLE-PAGE MODE */}
          {config.mode === 'single' && (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              {currentPageUrl ? (
                <img
                  src={currentPageUrl}
                  alt={`Page ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-150 gpu-image-render"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-text-muted space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
                  <span className="text-xs font-mono">Loading Page {currentIndex + 1}...</span>
                </div>
              )}
            </div>
          )}

          {/* 2. DOUBLE-PAGE SPREAD MODE */}
          {config.mode === 'spread' && (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              {/* Standalone cover page 0 */}
              {currentIndex === 0 ? (
                currentPageUrl ? (
                  <img
                    src={currentPageUrl}
                    alt="Cover Page"
                    className="max-w-full max-h-full object-contain shadow-2xl gpu-image-render"
                    decoding="async"
                  />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
                )
              ) : (
                <div
                  className="flex items-center justify-center max-w-full max-h-full"
                  style={{ gap: `${config.pageGap}px` }}
                >
                  {/* Left Page (Right Page in RTL) */}
                  {(config.isRtl ? nextSpreadUrl : currentPageUrl) && (
                    <img
                      src={config.isRtl ? nextSpreadUrl : currentPageUrl}
                      alt="Left Page"
                      className="max-w-[50%] max-h-full object-contain shadow-2xl border-r border-white/5 gpu-image-render"
                      decoding="async"
                    />
                  )}
                  {/* Right Page (Left Page in RTL) */}
                  {(config.isRtl ? currentPageUrl : nextSpreadUrl) && (
                    <img
                      src={config.isRtl ? currentPageUrl : nextSpreadUrl}
                      alt="Right Page"
                      className="max-w-[50%] max-h-full object-contain shadow-2xl gpu-image-render"
                      decoding="async"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. VERTICAL WEBTOON MODE */}
          {config.mode === 'webtoon' && (
            <div
              ref={webtoonContainerRef}
              className="w-full h-full overflow-y-auto webtoon-container flex flex-col items-center py-4 space-y-4"
            >
              {Array.from({ length: totalPages }).map((_, idx) => {
                const url = pageUrls[idx];
                return (
                  <div
                    key={idx}
                    data-page-index={idx}
                    className="webtoon-page w-full max-w-3xl flex justify-center min-h-[300px] items-center"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-auto object-contain gpu-image-render"
                        loading={idx < 5 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-64 bg-vg-secondary rounded flex items-center justify-center text-text-muted text-xs font-mono">
                        <Loader2 className="w-5 h-5 animate-spin text-accent-blue mr-2" />
                        <span>Loading Page {idx + 1}...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Page Number Indicator Badge (if enabled) */}
          {config.showPageNumbers && !showControls && (
            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono border border-white/10 pointer-events-none">
              {config.mode === 'spread' && currentIndex > 0 && currentIndex + 1 < totalPages
                ? `p. ${currentIndex + 1}-${currentIndex + 2} / ${totalPages}`
                : `p. ${currentIndex + 1} / ${totalPages}`}
            </div>
          )}
        </div>

        {/* ================= BOTTOM TOOLBAR ================= */}
        <footer
          className={`surface-toolbar px-6 py-3 border-t border-vg-border flex flex-col gap-2 z-40 transition-all duration-200 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Top Row: Navigation Controls & Scrubber */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-button bg-vg-elevated text-text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-vg-active transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Scrubber Range Slider */}
            <div className="flex-1 flex items-center space-x-3">
              <span className="text-xs font-mono font-semibold text-text-secondary whitespace-nowrap">
                {config.mode === 'spread' && currentIndex > 0 && currentIndex + 1 < totalPages
                  ? `${currentIndex + 1}-${currentIndex + 2} / ${totalPages}`
                  : `${currentIndex + 1} / ${totalPages}`}
              </span>
              <input
                type="range"
                min="0"
                max={Math.max(0, totalPages - 1)}
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value, 10))}
                className="w-full vg-range-slider cursor-pointer"
              />
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentIndex >= totalPages - 1}
              className="p-1.5 rounded-button bg-vg-elevated text-text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-vg-active transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Row: Mode Switcher Segmented Pills */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1 p-0.5 rounded-button bg-vg-secondary border border-vg-border">
              {(['single', 'spread', 'webtoon'] as ReadingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setConfig((c) => ({ ...c, mode }))}
                  className={`px-3 py-1 rounded-button text-xs font-semibold capitalize transition-colors ${
                    config.mode === mode
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* RTL / Status indicator */}
            <div className="text-[11px] font-mono text-text-muted flex items-center space-x-2">
              {config.isRtl && (
                <span className="px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple font-semibold">
                  RTL Manga Mode
                </span>
              )}
              <span>{progressPercent}% read</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Zero-chrome 2px Progress Line (Visible when controls hidden) */}
      {!showControls && (
        <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-vg-elevated z-50 pointer-events-none">
          <div
            className="h-full bg-accent-blue transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Reader Quick Settings Modal */}
      <ReaderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
      />
    </div>
  );
};
