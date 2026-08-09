import React, { useState } from 'react';
import { Sidebar, type NavView } from './Sidebar';
import { SearchHeader } from './SearchHeader';
import { DropZone } from './DropZone';
import { CommandPalette } from './CommandPalette';
import { Toast, type ToastMessage } from './Toast';
import { ReaderSettings, type ReaderConfig } from './ReaderSettings';
import { type ComicMetadata } from '../db';

interface BaseLayoutProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenComic: (comic: ComicMetadata) => void;
  children: React.ReactNode;
  itemCount?: number;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  currentView,
  onSelectView,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  viewMode,
  onViewModeChange,
  onOpenComic,
  children,
  itemCount,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<ReaderConfig>({
    mode: 'single',
    brightness: 100,
    pageGap: 0,
    isRtl: false,
    preloadAdjacent: true,
    showPageNumbers: true,
    enableAnimations: true,
    bgColor: 'black',
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (toastInput: Omit<ToastMessage, 'id'>) => {
    setToast({
      id: Date.now().toString(),
      ...toastInput,
    });
  };

  const handleOpenImport = () => {
    setIsImportOpen(true);
  };

  const getHeaderTitle = () => {
    if (selectedTag) return `Collection: ${selectedTag}`;
    switch (currentView) {
      case 'continue':
        return 'Continue Reading';
      case 'favorites':
        return 'Favorites';
      case 'recent':
        return 'Recently Added';
      default:
        return 'Library';
    }
  };

  return (
    <div className="min-h-screen bg-vg-primary text-text-primary flex flex-row relative">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenImport={handleOpenImport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedTag={selectedTag}
        onSelectTag={onSelectTag}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Search & Controls Header */}
        <SearchHeader
          title={getHeaderTitle()}
          count={itemCount}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenImport={handleOpenImport}
        />

        {/* View Grid Body (Passes onOpenImport to child components like LibraryGrid) */}
        <main className="flex-1 overflow-y-auto">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<{ onOpenImport?: () => void }>, {
                onOpenImport: handleOpenImport,
              })
            : children}
        </main>
      </div>

      {/* Import Dropzone Modal */}
      <DropZone
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onShowToast={showToast}
      />

      {/* Arc-Style Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectComic={onOpenComic}
        onSelectView={onSelectView}
        onOpenImport={handleOpenImport}
      />

      {/* Settings Modal */}
      <ReaderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={globalConfig}
        onChangeConfig={(updates) => setGlobalConfig((prev) => ({ ...prev, ...updates }))}
      />

      {/* Android/Apple-Style Floating Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
