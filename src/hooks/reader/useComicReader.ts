import { useState, useEffect, useRef, useCallback } from 'react';
import { type ComicMetadata, getComicBlob, updateReadingPosition, getPageBlobFromDb } from '../../db';
import { parseComicArchiveLazy, type LazyComicReader } from '../../utils';
import { type ReaderConfig } from '../../components/ReaderSettings';

interface UseComicReaderProps {
  comic: ComicMetadata;
}

export function useComicReader({ comic }: UseComicReaderProps) {
  const [reader, setReader] = useState<LazyComicReader | null>(null);
  const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(comic.currentPage || 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [config, setConfig] = useState<ReaderConfig>({
    mode: 'single',
    brightness: 100,
    pageGap: 0,
    isRtl: false,
    preloadAdjacent: true,
    showPageNumbers: true,
    enableAnimations: true,
    bgColor: 'black',
  });

  const pageUrlsRef = useRef<Record<number, string>>({});
  pageUrlsRef.current = pageUrls;

  // 1. Instant Reader Init (< 10ms) via IndexedDB Page Cache + Lazy Parser Fallback
  useEffect(() => {
    let isMounted = true;

    async function initReader() {
      setIsLoading(true);
      setLoadError(null);

      try {
        if (!comic.id) throw new Error('Invalid comic ID');

        const page0InDb = await getPageBlobFromDb(comic.id, 0);
        if (page0InDb && isMounted) {
          setIsLoading(false);
        }

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
        let blob = await getPageBlobFromDb(comic.id, idx);

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

  const progressPercent =
    totalPages > 0 ? Math.min(100, Math.round(((currentIndex + 1) / totalPages) * 100)) : 0;

  return {
    reader,
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
  };
}
