import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface WebtoonViewProps {
  totalPages: number;
  pageUrls: Record<number, string>;
  isLoading: boolean;
  pageGap?: number;
  onPageVisible: (pageIdx: number) => void;
  loadPageUrl: (idx: number) => Promise<string | undefined>;
}

export const WebtoonView: React.FC<WebtoonViewProps> = ({
  totalPages,
  pageUrls,
  isLoading,
  pageGap = 8,
  onPageVisible,
  loadPageUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIdx = parseInt(entry.target.getAttribute('data-page-index') || '0', 10);
            onPageVisible(pageIdx);
            for (let i = pageIdx; i <= Math.min(totalPages - 1, pageIdx + 3); i++) {
              loadPageUrl(i);
            }
          }
        });
      },
      { root: container, threshold: 0.15 }
    );

    const pageEls = container.querySelectorAll('.webtoon-page');
    pageEls.forEach((el) => observer.observe(el));

    for (let i = 0; i < Math.min(totalPages, 5); i++) {
      loadPageUrl(i);
    }

    return () => observer.disconnect();
  }, [isLoading, loadPageUrl, onPageVisible, totalPages]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto webtoon-container flex flex-col items-center py-4"
      style={{ gap: `${pageGap}px` }}
    >
      {Array.from({ length: totalPages }).map((_, idx) => {
        const url = pageUrls[idx];
        return (
          <div
            key={idx}
            data-page-index={idx}
            className="webtoon-page w-full max-w-4xl flex flex-col items-center justify-center min-h-[100px]"
          >
            {url ? (
              <img
                src={url}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto block gpu-image-render max-w-full"
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
  );
};
