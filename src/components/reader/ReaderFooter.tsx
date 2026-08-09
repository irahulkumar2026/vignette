import React from 'react';
import { ChevronLeft, ChevronRight, Square, Columns, Rows } from 'lucide-react';
import { type ReaderConfig, type ReadingMode } from '../ReaderSettings';

interface ReaderFooterProps {
  showControls: boolean;
  currentIndex: number;
  totalPages: number;
  progressPercent: number;
  config: ReaderConfig;
  onPrevPage: () => void;
  onNextPage: () => void;
  onIndexChange: (idx: number) => void;
  onModeChange: (mode: ReadingMode) => void;
}

const MODE_OPTIONS: { id: ReadingMode; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'single', label: 'Single', Icon: Square },
  { id: 'spread', label: 'Spread', Icon: Columns },
  { id: 'webtoon', label: 'Webtoon', Icon: Rows },
];

export const ReaderFooter: React.FC<ReaderFooterProps> = ({
  showControls,
  currentIndex,
  totalPages,
  progressPercent,
  config,
  onPrevPage,
  onNextPage,
  onIndexChange,
  onModeChange,
}) => {
  return (
    <footer
      className={`surface-toolbar px-6 py-3 border-t border-vg-border flex flex-col gap-2 z-40 transition-all duration-200 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Top Row: Navigation Controls & Scrubber */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onPrevPage}
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
            onChange={(e) => onIndexChange(parseInt(e.target.value, 10))}
            className="w-full vg-range-slider cursor-pointer"
          />
        </div>

        <button
          onClick={onNextPage}
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
          {MODE_OPTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-button text-xs font-semibold capitalize transition-colors ${
                config.mode === id
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
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
  );
};
