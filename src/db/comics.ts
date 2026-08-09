import { db, type ComicMetadata, type ComicBlob, type Bookmark, type PageRecord } from './db';

/**
 * Add a new comic entry and optionally its raw archive file blob to the database.
 */
export async function addComic(
  metadata: Omit<ComicMetadata, 'id' | 'createdAt' | 'updatedAt'>,
  fileBlob?: Blob
): Promise<number> {
  const now = new Date();
  const comicRecord: ComicMetadata = {
    ...metadata,
    currentPage: metadata.currentPage ?? 0,
    pageCount: metadata.pageCount ?? 0,
    isFavorite: metadata.isFavorite ?? false,
    isCompleted: metadata.isCompleted ?? false,
    importStatus: metadata.importStatus ?? 'complete',
    importedPages: metadata.importedPages ?? metadata.pageCount,
    createdAt: now,
    updatedAt: now,
  };

  return await db.transaction('rw', db.comics, db.comicBlobs, async () => {
    const comicId = await db.comics.add(comicRecord);

    if (fileBlob) {
      const blobRecord: ComicBlob = {
        comicId,
        blob: fileBlob,
        createdAt: now,
      };
      await db.comicBlobs.add(blobRecord);
    }

    return comicId;
  });
}

/**
 * Retrieve comic metadata by ID.
 */
export async function getComic(id: number): Promise<ComicMetadata | undefined> {
  return await db.comics.get(id);
}

/**
 * Retrieve all comics ordered by title.
 */
export async function getAllComics(): Promise<ComicMetadata[]> {
  return await db.comics.orderBy('title').toArray();
}

/**
 * Retrieve favorite comics.
 */
export async function getFavoriteComics(): Promise<ComicMetadata[]> {
  return await db.comics.filter((comic) => comic.isFavorite === true).toArray();
}

/**
 * Retrieve recently read or added comics, sorted by lastReadAt or createdAt descending.
 */
export async function getRecentComics(limit = 10): Promise<ComicMetadata[]> {
  const all = await db.comics.toArray();
  return all
    .sort((a, b) => {
      const timeA = (a.lastReadAt || a.createdAt).getTime();
      const timeB = (b.lastReadAt || b.createdAt).getTime();
      return timeB - timeA;
    })
    .slice(0, limit);
}

/**
 * Update partial metadata for a comic.
 */
export async function updateComic(
  id: number,
  updates: Partial<Omit<ComicMetadata, 'id' | 'createdAt'>>
): Promise<number> {
  const now = new Date();
  return await db.comics.update(id, {
    ...updates,
    updatedAt: now,
  });
}

/**
 * Update import progress status for a comic.
 */
export async function updateComicImportProgress(
  id: number,
  importedPages: number,
  isComplete = false
): Promise<number> {
  const now = new Date();
  return await db.comics.update(id, {
    importedPages,
    importStatus: isComplete ? 'complete' : 'importing',
    updatedAt: now,
  });
}

/**
 * Save a single page image blob to IndexedDB for instant 0ms reader opening.
 */
export async function savePageBlob(
  comicId: number,
  pageIndex: number,
  blob: Blob
): Promise<number> {
  const record: PageRecord = {
    comicId,
    pageIndex,
    blob,
  };
  return await db.pages.put(record);
}

/**
 * Get a single page image blob directly from IndexedDB.
 */
export async function getPageBlobFromDb(
  comicId: number,
  pageIndex: number
): Promise<Blob | undefined> {
  const record = await db.pages
    .where('[comicId+pageIndex]')
    .equals([comicId, pageIndex])
    .first();
  return record?.blob;
}

/**
 * Update the user's current reading position in a comic.
 */
export async function updateReadingPosition(
  id: number,
  pageIndex: number
): Promise<number> {
  const comic = await db.comics.get(id);
  if (!comic) throw new Error(`Comic with ID ${id} not found.`);

  const now = new Date();
  const isCompleted = comic.pageCount > 0 && pageIndex >= comic.pageCount - 1;

  return await db.comics.update(id, {
    currentPage: pageIndex,
    lastReadAt: now,
    updatedAt: now,
    isCompleted,
  });
}

/**
 * Toggle favorite status for a comic.
 */
export async function toggleFavorite(id: number): Promise<boolean> {
  const comic = await db.comics.get(id);
  if (!comic) throw new Error(`Comic with ID ${id} not found.`);

  const newFavorite = !comic.isFavorite;
  await db.comics.update(id, {
    isFavorite: newFavorite,
    updatedAt: new Date(),
  });
  return newFavorite;
}

/**
 * Delete a comic along with its binary archive blob, extracted page blobs, and associated bookmarks.
 */
export async function deleteComic(id: number): Promise<void> {
  await db.transaction('rw', db.comics, db.comicBlobs, db.pages, db.bookmarks, async () => {
    await db.comics.delete(id);
    await db.comicBlobs.where('comicId').equals(id).delete();
    await db.pages.where('comicId').equals(id).delete();
    await db.bookmarks.where('comicId').equals(id).delete();
  });
}

/**
 * Retrieve the binary archive blob for a comic.
 */
export async function getComicBlob(comicId: number): Promise<Blob | undefined> {
  const record = await db.comicBlobs.where('comicId').equals(comicId).first();
  return record?.blob;
}

/**
 * Add a page bookmark.
 */
export async function addBookmark(
  comicId: number,
  pageIndex: number,
  note?: string
): Promise<number> {
  const bookmark: Bookmark = {
    comicId,
    pageIndex,
    note,
    createdAt: new Date(),
  };
  return await db.bookmarks.add(bookmark);
}

/**
 * Retrieve all bookmarks for a comic.
 */
export async function getBookmarks(comicId: number): Promise<Bookmark[]> {
  return await db.bookmarks
    .where('comicId')
    .equals(comicId)
    .sortBy('pageIndex');
}

/**
 * Delete a specific bookmark.
 */
export async function deleteBookmark(bookmarkId: number): Promise<void> {
  await db.bookmarks.delete(bookmarkId);
}

/**
 * Setting getters and setters for app preferences.
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  return record ? (record.value as T) : defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<string> {
  return await db.settings.put({ key, value });
}
