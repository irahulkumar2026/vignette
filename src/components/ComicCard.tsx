import React, { useState, useEffect } from 'react';
import { type ComicMetadata, toggleFavorite } from '../db';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useComicCover } from '../hooks/comic/useComicCover';
import { ComicCardGrid } from './comic/ComicCardGrid';
import { ComicCardList } from './comic/ComicCardList';

interface ComicCardProps {
  comic: ComicMetadata;
  onOpenComic: (comic: ComicMetadata) => void;
  viewMode?: 'grid' | 'list';
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onOpenComic, viewMode = 'grid' }) => {
  const coverUrl = useComicCover(comic.coverImage);
  const [isFavorite, setIsFavorite] = useState(comic.isFavorite ?? false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setIsFavorite(comic.isFavorite ?? false);
  }, [comic.isFavorite]);

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

  return (
    <>
      {viewMode === 'list' ? (
        <ComicCardList
          comic={comic}
          coverUrl={coverUrl}
          isFavorite={isFavorite}
          onOpenComic={onOpenComic}
          onToggleFavorite={handleToggleFavorite}
          onDeleteClick={handleDeleteClick}
        />
      ) : (
        <ComicCardGrid
          comic={comic}
          coverUrl={coverUrl}
          isFavorite={isFavorite}
          onOpenComic={onOpenComic}
          onToggleFavorite={handleToggleFavorite}
          onDeleteClick={handleDeleteClick}
        />
      )}

      <DeleteConfirmModal
        comic={comic}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
