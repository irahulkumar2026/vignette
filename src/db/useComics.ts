import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ComicMetadata, type Bookmark } from './db';
import { getRecentComics } from './comics';

/**
 * Reactive hook to observe all comics in the library, sorted by title.
 */
export function useAllComics(): ComicMetadata[] | undefined {
  return useLiveQuery(() => db.comics.orderBy('title').toArray(), []);
}

/**
 * Reactive hook to observe a single comic by ID.
 */
export function useComic(id?: number): ComicMetadata | undefined {
  return useLiveQuery(() => (id !== undefined ? db.comics.get(id) : undefined), [id]);
}

/**
 * Reactive hook to observe favorite comics.
 */
export function useFavoriteComics(): ComicMetadata[] | undefined {
  return useLiveQuery(
    () => db.comics.filter((comic) => comic.isFavorite === true).toArray(),
    []
  );
}

/**
 * Reactive hook to observe recently read or added comics.
 */
export function useRecentComics(limit = 10): ComicMetadata[] | undefined {
  return useLiveQuery(() => getRecentComics(limit), [limit]);
}

/**
 * Reactive hook to observe bookmarks for a specific comic.
 */
export function useBookmarks(comicId?: number): Bookmark[] | undefined {
  return useLiveQuery(
    () =>
      comicId !== undefined
        ? db.bookmarks.where('comicId').equals(comicId).sortBy('pageIndex')
        : [],
    [comicId]
  );
}
