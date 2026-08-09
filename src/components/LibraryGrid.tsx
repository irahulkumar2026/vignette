import React from 'react';
import { useAllComics, useFavoriteComics, useRecentComics, type ComicMetadata } from '../db';
import { ComicCard } from './ComicCard';
import { BookOpen, Search, Upload } from 'lucide-react';
import { type NavView } from './Sidebar';

interface LibraryGridProps {
  currentView: NavView;
  searchQuery: string;
  selectedTag: string | null;
  viewMode: 'grid' | 'list';
  onOpenComic: (comic: ComicMetadata) => void;
  onOpenImport?: () => void;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  currentView,
  searchQuery,
  selectedTag,
  viewMode,
  onOpenComic,
  onOpenImport,
}) => {
  const allComics = useAllComics();
  const favoriteComics = useFavoriteComics();
  const recentComics = useRecentComics(20);

  // Filter comics based on current sidebar view
  const getComicsForView = (): ComicMetadata[] => {
    if (!allComics) return [];

    let list: ComicMetadata[] = [];
    switch (currentView) {
      case 'continue':
        list = allComics.filter((c) => c.currentPage > 0 && !c.isCompleted);
        break;
      case 'favorites':
        list = favoriteComics || [];
        break;
      case 'recent':
        list = recentComics || [];
        break;
      default:
        list = allComics;
        break;
    }

    // Filter by selected collection tag if active
    if (selectedTag) {
      list = list.filter((c) => c.tags?.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.author && c.author.toLowerCase().includes(q)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  };

  const filteredComics = getComicsForView();

  // Shimmer Loading Skeleton State
  if (allComics === undefined) {
    return (
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="surface-card p-3 rounded-card animate-pulse space-y-3">
            <div className="aspect-[2/3] w-full bg-vg-elevated rounded-button" />
            <div className="h-4 bg-vg-elevated rounded w-3/4" />
            <div className="h-3 bg-vg-elevated rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty library state
  if (allComics && allComics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center select-none">
        <div className="w-20 h-20 rounded-full bg-vg-tertiary border border-vg-border flex items-center justify-center text-text-muted mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
          Your library is empty
        </h2>
        <p className="text-sm text-text-secondary max-w-md mb-6">
          Drop <code>.cbz</code> or <code>.cbr</code> comic files anywhere on the screen to begin building your collection.
        </p>
        <button
          onClick={onOpenImport}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-button bg-accent-blue text-white font-medium text-sm hover:bg-accent-blue/90 transition-colors shadow-lg"
        >
          <Upload className="w-4 h-4" />
          <span>Import Comic Files</span>
        </button>
      </div>
    );
  }

  // Filter returned no results state
  if (filteredComics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-vg-tertiary border border-vg-border flex items-center justify-center text-text-muted mb-4">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">No comics found</h3>
        <p className="text-xs text-text-secondary max-w-sm">
          {searchQuery
            ? `No comics in your collection match "${searchQuery}"`
            : selectedTag
            ? `No comics found in tag "${selectedTag}"`
            : 'No comics available in this section.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredComics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onOpenComic={onOpenComic}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-w-5xl mx-auto">
          {filteredComics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onOpenComic={onOpenComic}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
};
