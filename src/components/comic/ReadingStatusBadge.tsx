import React from 'react';
import { CheckCircle } from 'lucide-react';
import { type ComicMetadata } from '../../db';

interface ReadingStatusBadgeProps {
  comic: ComicMetadata;
  className?: string;
}

export const ReadingStatusBadge: React.FC<ReadingStatusBadgeProps> = ({ comic, className = '' }) => {
  const isUnread = !comic.currentPage || comic.currentPage === 0;
  const progressPercent =
    comic.pageCount > 0
      ? Math.min(100, Math.round(((comic.currentPage + 1) / comic.pageCount) * 100))
      : 0;

  if (comic.isCompleted || progressPercent === 100) {
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-accent-green/15 border border-accent-green/30 text-[11px] font-mono font-semibold text-accent-green ${className}`}
        title="Completed"
      >
        <CheckCircle className="w-3 h-3" />
        <span>Finished</span>
      </span>
    );
  }

  if (isUnread) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full bg-vg-tertiary border border-vg-border text-[11px] font-mono text-text-muted ${className}`}
        title="Unread"
      >
        Unread
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-[11px] font-mono font-semibold text-accent-blue ${className}`}
      title={`${progressPercent}% completed`}
    >
      {comic.currentPage + 1}/{comic.pageCount} • {progressPercent}%
    </span>
  );
};
