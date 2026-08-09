import Dexie, { type Table } from 'dexie';

/**
 * Metadata record for a comic book in the user's library.
 */
export interface ComicMetadata {
  id?: number;
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  description?: string;
  coverImage?: Blob | null; // Thumbnail image blob for instant library grid rendering
  fileSize: number; // File size in bytes
  fileName: string; // Original filename (e.g., "batman_year_one.cbz")
  fileType: 'cbz' | 'cbr' | 'zip' | 'rar' | 'pdf' | 'other';
  pageCount: number;
  currentPage: number; // Currently read page index (0-indexed)
  lastReadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
  isCompleted?: boolean;
  tags?: string[];
  importStatus?: 'importing' | 'complete' | 'error';
  importedPages?: number;
}

/**
 * Individual pre-extracted page blob stored in IndexedDB for instant 0ms reader open.
 */
export interface PageRecord {
  id?: number;
  comicId: number; // Foreign key referencing ComicMetadata.id
  pageIndex: number; // 0-indexed page number
  blob: Blob; // Pre-extracted image blob
}

/**
 * Storage table for heavy binary archive files (.cbz / .cbr / .zip).
 */
export interface ComicBlob {
  id?: number;
  comicId: number; // Foreign key referencing ComicMetadata.id
  blob: Blob; // The full raw archive binary file
  createdAt: Date;
}

/**
 * Bookmarks saved for specific pages within a comic.
 */
export interface Bookmark {
  id?: number;
  comicId: number; // Foreign key referencing ComicMetadata.id
  pageIndex: number;
  note?: string;
  createdAt: Date;
}

/**
 * Application preference key-value pair.
 */
export interface AppSetting {
  key: string;
  value: unknown;
}

/**
 * Vignette IndexedDB instance managing local persistence.
 */
export class VignetteDatabase extends Dexie {
  comics!: Table<ComicMetadata, number>;
  comicBlobs!: Table<ComicBlob, number>;
  pages!: Table<PageRecord, number>;
  bookmarks!: Table<Bookmark, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('VignetteDatabase');
    this.version(1).stores({
      comics: '++id, title, author, fileType, lastReadAt, createdAt, isFavorite, *tags',
      comicBlobs: '++id, comicId',
      bookmarks: '++id, comicId, pageIndex, createdAt',
      settings: '&key',
    });
    this.version(2).stores({
      comics: '++id, title, author, fileType, lastReadAt, createdAt, isFavorite, importStatus, *tags',
      comicBlobs: '++id, comicId',
      pages: '++id, [comicId+pageIndex], comicId, pageIndex',
      bookmarks: '++id, comicId, pageIndex, createdAt',
      settings: '&key',
    });
  }
}

export const db = new VignetteDatabase();
