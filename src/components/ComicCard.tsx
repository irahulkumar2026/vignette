import React, { useEffect, useState } from 'react';
import { type ComicMetadata, toggleFavorite } from '../db';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Star, Trash2, BookOpen, CheckCircle } from 'lucide-react';

interface ComicCardProps {
  comic: ComicMetadata;
  onOpenComic: (comic: ComicMetadata) => void;
  viewMode?: 'grid' | 'list';
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onOpenComic, viewMode = 'grid' }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(comic.isFavorite ?? false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setIsFavorite(comic.isFavorite ?? false);
  }, [comic.isFavorite]);

  // Convert cover image Blob to Object URL safely
  useEffect(() => {
    if (comic.coverImage) {
      const url = URL.createObjectURL(comic.coverImage);
      setCoverUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setCoverUrl(null);
    }
  }, [comic.coverImage]);

  const progressPercent =
    comic.pageCount > 0
      ? Math.min(100, Math.round(((comic.currentPage + 1) / comic.pageCount) * 100))
      : 0;

  const isImporting = comic.importStatus === 'importing';
  const importPercent =
    comic.pageCount > 0
      ? Math.min(100, Math.round(((comic.importedPages || 1) / comic.pageCount) * 100))
      : 0;

  const hasAuthor = comic.author && comic.author.trim() !== '' && comic.author !== 'Unknown Author';

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!comic.id) return;
    try {
      const updated = await toggleFavorite(comic.id);
      setIsFavorite(updated);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div
          onClick={() => onOpenComic(comic)}
          className="surface-card p-3 flex items-center justify-between gap-4 surface-card-hover cursor-pointer border border-vg-border rounded-card select-none group card-shadow-hover"
        >
          <div className="flex items-center space-x-3 min-w-0">
            {/* Cover Thumbnail */}
            <div className="w-10 h-14 bg-vg-secondary rounded flex-shrink-0 overflow-hidden border border-vg-border flex items-center justify-center">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={comic.title}
                  className="w-full h-full object-cover gpu-image-render"
                  decoding="async"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-text-muted" />
              )}
            </div>

            {/* Details */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-blue transition-colors">
                  {comic.title}
                </h3>
                {isImporting && (
                  <span className="px-1.5 py-0.2 rounded bg-accent-blue/20 text-accent-blue text-[10px] font-mono font-bold">
                    Importing {importPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {hasAuthor ? `${comic.author} • ` : ''}{comic.pageCount} pages
              </p>
            </div>
          </div>

          {/* Progress & Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="hidden sm:flex flex-col items-end w-28">
              <span className="text-[11px] font-mono text-text-muted">
                {comic.currentPage > 0 ? `p. ${comic.currentPage + 1}/${comic.pageCount}` : 'Unread'}
              </span>
              <div className="w-full h-1 bg-vg-elevated rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-button transition-colors ${
                isFavorite ? 'text-accent-orange' : 'text-text-muted hover:text-text-primary'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-accent-orange' : ''}`} />
            </button>

            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-button text-text-muted hover:text-accent-red hover:bg-vg-elevated transition-colors"
              title="Delete Comic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <DeleteConfirmModal
          comic={comic}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        onClick={() => onOpenComic(comic)}
        className="surface-card p-3 flex flex-col justify-between surface-card-hover cursor-pointer border border-vg-border rounded-card select-none group relative card-shadow-hover"
      >
        {/* Top Media Cover Area */}
        <div>
          <div className="relative aspect-[2/3] w-full bg-vg-secondary rounded-button overflow-hidden border border-vg-border mb-3 flex items-center justify-center">
            {coverUrl ? (
              <>
                <img
                  src={coverUrl}
                  alt={comic.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] gpu-image-render"
                  loading="lazy"
                  decoding="async"
                />
                {/* Bottom gradient overlay for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-b-button" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="w-8 h-8 text-text-muted mb-2" />
                <span className="text-xs text-text-muted line-clamp-2">{comic.title}</span>
              </div>
            )}

            {/* Top-Left Delete Button Overlay on hover */}
            {!isImporting && (
              <button
                onClick={handleDeleteClick}
                className="absolute top-2 left-2 p-1.5 rounded-full bg-vg-primary/80 text-text-muted hover:text-accent-red hover:bg-accent-red/20 backdrop-blur-sm transition-colors border border-vg-border opacity-0 group-hover:opacity-100 shadow-md"
                title="Delete Comic"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Top-Right Background Import Circular SVG Progress Ring or Favorite Button */}
            {isImporting ? (
              <div
                className="absolute top-2 right-2 p-1 rounded-full bg-vg-primary/95 border border-vg-border flex items-center justify-center shadow-lg"
                title={`Importing pages: ${importPercent}%`}
              >
                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-vg-elevated"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-accent-blue transition-all duration-300"
                    strokeDasharray={`${importPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[8px] font-mono font-bold text-accent-blue">
                  {importPercent}
                </span>
              </div>
            ) : (
              /* Favorite Star Overlay Button */
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite
                    ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/40'
                    : 'bg-vg-primary/60 text-white/70 hover:text-white border border-vg-border'
                }`}
                title={isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-accent-orange' : ''}`} />
              </button>
            )}

            {/* Bottom-Right Completed Checkmark Badge */}
            {comic.isCompleted && !isImporting && (
              <div className="absolute bottom-2 right-2 p-1 rounded-full bg-accent-green text-white shadow-md">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Comic Info */}
          <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-blue transition-colors">
            {comic.title}
          </h3>
          {hasAuthor && (
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {comic.author}
            </p>
          )}
        </div>

        {/* Progress Bar & Footer */}
        <div className="mt-3 pt-2 border-t border-vg-border/50">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mb-1">
            <span>
              {comic.currentPage > 0 ? `Page ${comic.currentPage + 1}/${comic.pageCount}` : 'Unread'}
            </span>
            {progressPercent > 0 && (
              <span className="text-accent-blue font-semibold">{progressPercent}%</span>
            )}
          </div>

          {/* 4px Progress Track */}
          <div className="w-full h-1 bg-vg-elevated rounded-full overflow-hidden">
            <div
              className={`h-full bg-accent-blue rounded-full transition-all duration-300 ${progressPercent > 0 ? 'shadow-[0_0_6px_rgba(10,132,255,0.4)]' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        comic={comic}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
