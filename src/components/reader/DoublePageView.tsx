import React from 'react';
import { Loader2 } from 'lucide-react';

interface DoublePageViewProps {
  currentIndex: number;
  currentPageUrl?: string;
  nextSpreadUrl?: string;
  isRtl: boolean;
  pageGap: number;
}

export const DoublePageView: React.FC<DoublePageViewProps> = ({
  currentIndex,
  currentPageUrl,
  nextSpreadUrl,
  isRtl,
  pageGap,
}) => {
  return (
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
          style={{ gap: `${pageGap}px` }}
        >
          {/* Left Page (Right Page in RTL) */}
          {(isRtl ? nextSpreadUrl : currentPageUrl) && (
            <img
              src={isRtl ? nextSpreadUrl : currentPageUrl}
              alt="Left Page"
              className="max-w-[50%] max-h-full object-contain shadow-2xl border-r border-white/5 gpu-image-render"
              decoding="async"
            />
          )}
          {/* Right Page (Left Page in RTL) */}
          {(isRtl ? currentPageUrl : nextSpreadUrl) && (
            <img
              src={isRtl ? currentPageUrl : nextSpreadUrl}
              alt="Right Page"
              className="max-w-[50%] max-h-full object-contain shadow-2xl gpu-image-render"
              decoding="async"
            />
          )}
        </div>
      )}
    </div>
  );
};
