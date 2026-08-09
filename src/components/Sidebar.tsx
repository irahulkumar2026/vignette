import React from 'react';
import {
  BookOpen,
  Clock,
  Star,
  History,
  Tag,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type NavView = 'all' | 'continue' | 'favorites' | 'recent' | string;

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenImport: () => void;
  tags?: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  onOpenImport,
  tags = ['Superhero', 'Manga', 'Indie', 'Sci-Fi'],
  selectedTag,
  onSelectTag,
}) => {
  const { theme, toggleTheme } = useTheme();

  const mainNavItems = [
    { id: 'all', label: 'Library', icon: BookOpen },
    { id: 'continue', label: 'Continue Reading', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently Added', icon: History },
  ];

  return (
    <aside
      className={`surface-sidebar flex flex-col h-screen sticky top-0 transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-vg-border">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-button bg-accent-blue flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold tracking-widest text-text-primary uppercase bg-gradient-to-r from-text-primary via-accent-blue to-text-primary bg-[length:200%_100%] bg-clip-text" style={{ WebkitBackgroundClip: 'text' }}>
              VIGNETTE
            </span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-button bg-accent-blue flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1 rounded-button text-text-muted hover:text-text-primary hover:bg-vg-elevated transition-colors ${
            isCollapsed ? 'hidden sm:block' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={onOpenImport}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-button bg-accent-blue text-white font-medium text-xs hover:bg-accent-blue/90 hover:shadow-[0_0_16px_rgba(10,132,255,0.3)] transition-all duration-200 ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Import Comic Archives"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>Import Comic</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id && !selectedTag;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onSelectTag) onSelectTag(null);
                  onSelectView(item.id);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-button text-xs font-medium transition-colors relative ${
                  isActive
                    ? 'bg-vg-tertiary text-accent-blue font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-vg-elevated'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* 3px Active Indicator Bar with smooth transition */}
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-accent-blue rounded-r animate-scale-in" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent-blue' : ''}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Collections / Tags */}
        {!isCollapsed && (
          <div className="pt-5 pb-2">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Collections
            </div>
            <div className="space-y-0.5">
              {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (onSelectTag) onSelectTag(isSelected ? null : tag);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-button text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-vg-tertiary text-accent-purple font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-vg-elevated'
                    }`}
                  >
                    <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-accent-purple' : 'text-text-muted'}`} />
                    <span className="truncate">{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-vg-border space-y-1">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-button text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-vg-elevated transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-accent-orange" />
          ) : (
            <Moon className="w-4 h-4 text-accent-purple" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Settings item */}
        <button
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-button text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-vg-elevated transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 text-text-muted" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Version Badge */}
        {!isCollapsed && (
          <div className="px-3 pt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-vg-tertiary border border-vg-border text-[10px] text-text-muted font-mono">
              Vignette v0.1.0 • PWA
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
