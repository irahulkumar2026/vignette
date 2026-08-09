import React from 'react';
import { Star, Trash2, BookOpen, CheckCircle } from 'lucide-react';
import { type ComicMetadata } from '../../db';
import { CircularProgress } from './CircularProgress';

interface ComicCardGridProps {
  comic: ComicMetadata;
  coverUrl: string | null;
  isFavorite: boolean;
  onOpenComic: (comic: ComicMetadata) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

export const ComicCardGrid: React.FC<ComicCardGridProps> = ({
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
              onClick={onDeleteClick}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-vg-primary/80 text-text-muted hover:text-accent-red hover:bg-accent-red/20 backdrop-blur-sm transition-colors border border-vg-border opacity-0 group-hover:opacity-100 shadow-md"
              title="Delete Comic"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Top-Right Background Import Circular Progress Ring or Favorite Button */}
          {isImporting ? (
            <div
              className="absolute top-2 right-2 p-1 rounded-full bg-vg-primary/95 border border-vg-border flex items-center justify-center shadow-lg"
              title={`Importing pages: ${importPercent}%`}
            >
              <CircularProgress
                progressPercent={importPercent}
                size={24}
                strokeWidth={3.5}
                label={<span className="text-[8px] font-mono font-bold text-accent-blue">{importPercent}</span>}
              />
            </div>
          ) : (
            /* Favorite Star Overlay Button */
            <button
              onClick={onToggleFavorite}
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

      {/* Progress Footer */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>
            {comic.currentPage > 0 ? `${comic.currentPage + 1}/${comic.pageCount}` : 'Unread'}
          </span>
          {progressPercent > 0 && (
            <CircularProgress progressPercent={progressPercent} size={15} strokeWidth={4.5} />
          )}
        </div>
      </div>
    </div>
  );
};
