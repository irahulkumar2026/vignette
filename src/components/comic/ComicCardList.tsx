import React from 'react';
import { Star, Trash2, BookOpen } from 'lucide-react';
import { type ComicMetadata } from '../../db';
import { CircularProgress } from './CircularProgress';

interface ComicCardListProps {
  comic: ComicMetadata;
  coverUrl: string | null;
  isFavorite: boolean;
  onOpenComic: (comic: ComicMetadata) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

export const ComicCardList: React.FC<ComicCardListProps> = ({
  comic,
  coverUrl,
  isFavorite,
  onOpenComic,
  onToggleFavorite,
  onDeleteClick,
}) => {
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

  return (
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
        <div className="hidden sm:flex items-center space-x-2.5">
          <span className="text-[11px] font-mono text-text-muted">
            {comic.currentPage > 0 ? `${comic.currentPage + 1}/${comic.pageCount}` : 'Unread'}
          </span>
          {progressPercent > 0 && (
            <CircularProgress progressPercent={progressPercent} size={15} strokeWidth={4.5} />
          )}
        </div>

        <button
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-button transition-colors ${
            isFavorite ? 'text-accent-orange' : 'text-text-muted hover:text-text-primary'
          }`}
          title={isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-accent-orange' : ''}`} />
        </button>

        <button
          onClick={onDeleteClick}
          className="p-1.5 rounded-button text-text-muted hover:text-accent-red hover:bg-vg-elevated transition-colors"
          title="Delete Comic"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
