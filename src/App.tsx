import React, { useState } from 'react';
import { BaseLayout } from './components/BaseLayout';
import { LibraryGrid } from './components/LibraryGrid';
import { ReaderViewport } from './components/ReaderViewport';
import { type NavView } from './components/Sidebar';
import { useAllComics, type ComicMetadata } from './db';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeComic, setActiveComic] = useState<ComicMetadata | null>(null);

  const allComics = useAllComics();

  const handleOpenComic = (comic: ComicMetadata) => {
    setActiveComic(comic);
  };

  return (
    <>
      <BaseLayout
        currentView={currentView}
        onSelectView={(view) => {
          setSelectedTag(null);
          setCurrentView(view);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenComic={handleOpenComic}
        itemCount={allComics?.length || 0}
      >
        <LibraryGrid
          currentView={currentView}
          searchQuery={searchQuery}
          selectedTag={selectedTag}
          viewMode={viewMode}
          onOpenComic={handleOpenComic}
        />
      </BaseLayout>

      {/* Stage 5 Universal Reader Engine */}
      {activeComic && (
        <ReaderViewport
          comic={activeComic}
          onClose={() => setActiveComic(null)}
        />
      )}
    </>
  );
};

export default App;
