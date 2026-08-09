import React from 'react';
import { Sun, Layers, ArrowLeftRight, Hash, Eye, X } from 'lucide-react';

export type ReadingMode = 'single' | 'spread' | 'webtoon';
export type ReaderBgColor = 'black' | 'dark' | 'sepia';

export interface ReaderConfig {
  mode: ReadingMode;
  brightness: number; // 20 to 100
  pageGap: number; // 0, 8, 16, 24
  isRtl: boolean; // Right-to-Left manga mode
  preloadAdjacent: boolean;
  showPageNumbers: boolean;
  bgColor: ReaderBgColor;
}

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReaderConfig;
  onChangeConfig: (newConfig: Partial<ReaderConfig>) => void;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 surface-overlay backdrop-blur-sm animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-elevated max-w-sm w-full p-5 rounded-modal border border-vg-border-strong shadow-2xl relative animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-vg-border">
          <h3 className="text-base font-bold text-text-primary flex items-center space-x-2">
            <Layers className="w-4 h-4 text-accent-blue" />
            <span>Reading Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Brightness Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-accent-orange" />
                <span>Brightness</span>
              </span>
              <span className="font-mono text-text-muted">{config.brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={config.brightness}
              onChange={(e) => onChangeConfig({ brightness: parseInt(e.target.value, 10) })}
              className="w-full vg-range-slider cursor-pointer"
            />
          </div>

          {/* Reading Mode Segmented Control */}
          <div>
            <span className="block font-semibold text-text-primary mb-2">Reading Mode</span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-button bg-vg-tertiary border border-vg-border">
              {(['single', 'spread', 'webtoon'] as ReadingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChangeConfig({ mode })}
                  className={`py-1.5 px-2 rounded-button text-[11px] font-semibold capitalize transition-colors ${
                    config.mode === mode
                      ? 'bg-vg-elevated text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Page Gap Selection */}
          <div>
            <span className="block font-semibold text-text-primary mb-2">Page Gap</span>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-button bg-vg-tertiary border border-vg-border">
              {[0, 8, 16, 24].map((gap) => (
                <button
                  key={gap}
                  onClick={() => onChangeConfig({ pageGap: gap })}
                  className={`py-1 rounded-button text-[11px] font-mono transition-colors ${
                    config.pageGap === gap
                      ? 'bg-vg-elevated text-accent-blue font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {gap}px
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-vg-border">
            {/* RTL Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary flex items-center space-x-2">
                <ArrowLeftRight className="w-3.5 h-3.5 text-accent-purple" />
                <span>Right-to-Left (Manga)</span>
              </span>
              <button
                onClick={() => onChangeConfig({ isRtl: !config.isRtl })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${
                  config.isRtl ? 'bg-accent-blue' : 'bg-vg-tertiary'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.isRtl ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Page Numbers Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary flex items-center space-x-2">
                <Hash className="w-3.5 h-3.5 text-text-muted" />
                <span>Show Page Numbers</span>
              </span>
              <button
                onClick={() => onChangeConfig({ showPageNumbers: !config.showPageNumbers })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${
                  config.showPageNumbers ? 'bg-accent-blue' : 'bg-vg-tertiary'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.showPageNumbers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Preload Adjacent Pages Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary flex items-center space-x-2">
                <Eye className="w-3.5 h-3.5 text-accent-green" />
                <span>Preload Adjacent Pages</span>
              </span>
              <button
                onClick={() => onChangeConfig({ preloadAdjacent: !config.preloadAdjacent })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${
                  config.preloadAdjacent ? 'bg-accent-blue' : 'bg-vg-tertiary'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.preloadAdjacent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Background Color Selector */}
          <div className="pt-2 border-t border-vg-border">
            <span className="block font-semibold text-text-primary mb-2">Canvas Background</span>
            <div className="flex items-center space-x-3">
              {[
                { id: 'black', label: 'Black', color: '#000000' },
                { id: 'dark', label: 'Dark Gray', color: '#1c1c1e' },
                { id: 'sepia', label: 'Sepia', color: '#2b261f' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onChangeConfig({ bgColor: bg.id as ReaderBgColor })}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-button text-xs transition-colors border ${
                    config.bgColor === bg.id
                      ? 'border-accent-blue text-text-primary'
                      : 'border-vg-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: bg.color }}
                  />
                  <span>{bg.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
