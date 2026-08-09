import React, { useState, useEffect, useRef } from 'react';
import { useAllComics, type ComicMetadata } from '../db';
import { useTheme } from '../context/ThemeContext';
import { Search, BookOpen, Star, Clock, Plus, Sun, Moon, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComic: (comic: ComicMetadata) => void;
  onSelectView: (view: string) => void;
  onOpenImport: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectComic,
  onSelectView,
  onOpenImport,
}) => {
  const comics = useAllComics();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter comics by query
  const filteredComics = (comics || []).filter((comic) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      comic.title.toLowerCase().includes(q) ||
      (comic.author && comic.author.toLowerCase().includes(q)) ||
      (comic.publisher && comic.publisher.toLowerCase().includes(q))
    );
  }).slice(0, 5);

  // System actions list
  const actions = [
    {
      id: 'import',
      label: 'Import New Comic Archive',
      icon: Plus,
      run: () => {
        onClose();
        onOpenImport();
      },
    },
    {
      id: 'view_all',
      label: 'Go to Full Library',
      icon: BookOpen,
      run: () => {
        onClose();
        onSelectView('all');
      },
    },
    {
      id: 'view_favorites',
      label: 'Go to Favorites',
      icon: Star,
      run: () => {
        onClose();
        onSelectView('favorites');
      },
    },
    {
      id: 'view_continue',
      label: 'Go to Continue Reading',
      icon: Clock,
      run: () => {
        onClose();
        onSelectView('continue');
      },
    },
    {
      id: 'toggle_theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? Sun : Moon,
      run: () => {
        onClose();
        toggleTheme();
      },
    },
  ].filter((act) => !query || act.label.toLowerCase().includes(query.toLowerCase()));

  const totalItems = filteredComics.length + actions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredComics.length) {
        const comic = filteredComics[selectedIndex];
        if (comic) {
          onClose();
          onSelectComic(comic);
        }
      } else {
        const actionIndex = selectedIndex - filteredComics.length;
        const action = actions[actionIndex];
        if (action) {
          action.run();
        }
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 surface-overlay backdrop-blur-sm animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-elevated max-w-xl w-full rounded-modal border border-vg-border-strong overflow-hidden shadow-2xl animate-fade-in"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-vg-border flex items-center space-x-3">
          <Search className="w-5 h-5 text-accent-blue flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search comics, actions, tags... (Esc to close)"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Comics Section */}
          {filteredComics.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Comics
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredComics.map((comic, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={comic.id}
                      onClick={() => {
                        onClose();
                        onSelectComic(comic);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-button text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-vg-active text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-vg-tertiary'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <BookOpen className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-accent-blue' : 'text-text-muted'}`} />
                        <span className="truncate">{comic.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-text-muted text-[11px] font-mono">
                        <span>{comic.pageCount}p</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Section */}
          {actions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                Actions
              </div>
              <div className="space-y-0.5 mt-1">
                {actions.map((act, idx) => {
                  const globalIdx = filteredComics.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      onClick={act.run}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-button text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-vg-active text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-vg-tertiary'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-accent-blue' : 'text-text-muted'}`} />
                        <span className="truncate">{act.label}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-text-muted" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="p-8 text-center text-text-muted text-xs">
              No matching comics or actions found for "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-vg-secondary border-t border-vg-border flex items-center justify-between text-[11px] text-text-muted font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1 py-0.5 rounded bg-vg-tertiary">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-vg-tertiary">↵</kbd> select</span>
          </div>
          <span><kbd className="px-1 py-0.5 rounded bg-vg-tertiary">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};
