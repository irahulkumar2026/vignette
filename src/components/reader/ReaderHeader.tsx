import React from 'react';
import { ArrowLeft, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { type ComicMetadata } from '../../db';

interface ReaderHeaderProps {
  comic: ComicMetadata;
  showControls: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  comic,
  showControls,
  isFullscreen,
  onClose,
  onOpenSettings,
  onToggleFullscreen,
}) => {
  return (
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
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
          }}
          className="p-2 rounded-button bg-vg-tertiary border border-vg-border text-text-secondary hover:text-text-primary transition-colors"
          title="Reading Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-button bg-vg-tertiary border border-vg-border text-text-secondary hover:text-text-primary transition-colors"
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
