import React from 'react';
import { Search, Command, LayoutGrid, List, Plus } from 'lucide-react';

interface SearchHeaderProps {
  title: string;
  count?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenCommandPalette: () => void;
  onOpenImport: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  title,
  count,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenCommandPalette,
  onOpenImport,
}) => {
  return (
    <header className="sticky top-0 z-20 surface-header px-6 py-3 border-b border-vg-border flex items-center justify-between gap-4">
      {/* Title & Item Counter */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold tracking-tight text-text-primary capitalize">
          {title}
        </h1>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-vg-tertiary text-text-secondary text-xs font-semibold font-mono animate-scale-in">
            {count}
          </span>
        )}
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, authors, files..."
            className="w-full pl-9 pr-16 py-1.5 rounded-button bg-vg-tertiary border border-vg-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all duration-150"
          />
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2 px-1.5 py-0.5 rounded bg-vg-elevated/80 text-text-muted text-[10px] font-mono flex items-center space-x-1 hover:text-text-primary transition-colors border border-vg-border/50 backdrop-blur-sm"
            title="Open Command Palette (Ctrl+K)"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center space-x-2">
        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-button bg-vg-tertiary border border-vg-border">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-button text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-vg-elevated text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-button text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-vg-elevated text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Import Button */}
        <button
          onClick={onOpenImport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-button bg-accent-blue text-white font-medium text-xs hover:bg-accent-blue/90 hover:shadow-[0_0_16px_rgba(10,132,255,0.3)] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Comic</span>
        </button>
      </div>
    </header>
  );
};
