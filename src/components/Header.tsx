import React from 'react';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 surface-header px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-button bg-accent-blue flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            Vignette
          </span>
        </div>

        {/* Status */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-medium text-text-secondary">
          <span>Desktop + iPad PWA</span>
          <span className="w-1 h-1 rounded-full bg-vg-border" />
          <span>Stage 1</span>
        </div>
      </div>
    </header>
  );
};
