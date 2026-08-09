import React from 'react';
import { type ComicMetadata, deleteComic } from '../db';
import { AlertTriangle, Trash2, HardDrive, FileArchive, Bookmark, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  comic: ComicMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  comic,
  isOpen,
  onClose,
  onDeleted,
}) => {
  if (!isOpen || !comic) return null;

  const formattedSize =
    comic.fileSize > 0
      ? (comic.fileSize / (1024 * 1024)).toFixed(1) + ' MB'
      : 'Unknown size';

  const handleConfirmHardPurge = async () => {
    if (!comic.id) return;
    try {
      // Execute 4-tier atomic IndexedDB hard purge (comics, comicBlobs, pages, bookmarks)
      await deleteComic(comic.id);

      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to execute hard purge:', err);
      alert('Failed to delete comic from database.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 surface-overlay backdrop-blur-sm animate-fade-in select-none">
      <div className="surface-elevated max-w-md w-full p-6 rounded-modal border border-vg-border-strong relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-button text-text-muted hover:text-text-primary hover:bg-vg-active transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center mb-4 border border-accent-red/30">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-text-primary mb-1">
          Hard Purge Comic?
        </h2>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          Are you sure you want to permanently delete <strong className="text-text-primary">{comic.title}</strong>? This action cannot be undone.
        </p>

        {/* Detailed Hard Purge Itemized Breakdown */}
        <div className="p-3.5 rounded-card bg-vg-secondary border border-vg-border space-y-2.5 mb-6 text-xs">
          <div className="flex items-center space-x-2 text-text-primary">
            <FileArchive className="w-4 h-4 text-accent-red flex-shrink-0" />
            <span className="font-semibold">Raw Archive File:</span>
            <span className="text-text-secondary ml-auto font-mono">{formattedSize}</span>
          </div>

          <div className="flex items-center space-x-2 text-text-primary">
            <HardDrive className="w-4 h-4 text-accent-orange flex-shrink-0" />
            <span className="font-semibold">Extracted Page Cache:</span>
            <span className="text-text-secondary ml-auto font-mono">{comic.pageCount} pages</span>
          </div>

          <div className="flex items-center space-x-2 text-text-primary">
            <Bookmark className="w-4 h-4 text-accent-purple flex-shrink-0" />
            <span className="font-semibold">Reading Data & Bookmarks:</span>
            <span className="text-text-secondary ml-auto font-mono">Page {comic.currentPage + 1}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-button bg-vg-tertiary border border-vg-border text-text-primary text-xs font-semibold hover:bg-vg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmHardPurge}
            className="px-4 py-2 rounded-button bg-accent-red text-white text-xs font-semibold hover:bg-accent-red/90 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hard Purge & Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
