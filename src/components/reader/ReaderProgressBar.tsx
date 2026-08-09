import React from 'react';

interface ReaderProgressBarProps {
  showControls: boolean;
  progressPercent: number;
}

export const ReaderProgressBar: React.FC<ReaderProgressBarProps> = ({
  showControls,
  progressPercent,
}) => {
  if (showControls) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-vg-elevated z-50 pointer-events-none">
      <div
        className="h-full bg-accent-blue transition-all duration-200"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};
