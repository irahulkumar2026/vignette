import React from 'react';
import { Loader2 } from 'lucide-react';

interface SinglePageViewProps {
  pageUrl?: string;
  currentIndex: number;
}

export const SinglePageView: React.FC<SinglePageViewProps> = ({ pageUrl, currentIndex }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
      {pageUrl ? (
        <img
          src={pageUrl}
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
  );
};
