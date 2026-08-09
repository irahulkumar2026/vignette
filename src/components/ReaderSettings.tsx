import React, { useEffect } from 'react';
import { Sun, Layers, ArrowLeftRight, Hash, Eye, Sparkles, X, Square, Columns, Rows } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ReadingMode = 'single' | 'spread' | 'webtoon';
export type ReaderBgColor = 'black' | 'dark' | 'sepia';

const MODE_OPTIONS: { id: ReadingMode; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'single', label: 'Single', Icon: Square },
  { id: 'spread', label: 'Spread', Icon: Columns },
  { id: 'webtoon', label: 'Webtoon', Icon: Rows },
];

export interface ReaderConfig {
  mode: ReadingMode;
  brightness: number; // 20 to 100
  pageGap: number; // 0, 8, 16, 24
  isRtl: boolean; // Right-to-Left manga mode
  preloadAdjacent: boolean;
  showPageNumbers: boolean;
  enableAnimations: boolean;
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
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const animationsState = config.enableAnimations !== false ? 'enabled' : 'disabled';
    document.documentElement.setAttribute('data-animations', animationsState);
  }, [config.enableAnimations]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 surface-overlay backdrop-blur-sm animate-fade-in select-none"
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
              {MODE_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onChangeConfig({ mode: id })}
                  className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-button text-[11px] font-semibold capitalize transition-colors ${
                    config.mode === id
                      ? 'bg-vg-elevated text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
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
            {/* Enable UI Animations Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
                <span>Enable UI Animations</span>
              </span>
              <button
                onClick={() => onChangeConfig({ enableAnimations: !config.enableAnimations })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${
                  config.enableAnimations ? 'bg-accent-blue' : 'bg-vg-tertiary'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.enableAnimations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

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

          {/* Unified Theme & Canvas Background Selector */}
          <div className="pt-2 border-t border-vg-border">
            <span className="block font-semibold text-text-primary mb-2">Theme & Canvas Background</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dark', label: 'Dark Mode', bg: '#000000' },
                { id: 'light', label: 'Light Mode', bg: '#ffffff' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    onChangeConfig({ bgColor: t.id as ReaderBgColor });
                  }}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-button text-xs font-semibold transition-all border ${
                    theme === t.id
                      ? 'border-accent-blue bg-vg-elevated text-text-primary shadow-xs'
                      : 'border-vg-border text-text-secondary hover:text-text-primary hover:bg-vg-tertiary'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0"
                    style={{ backgroundColor: t.bg }}
                  />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
