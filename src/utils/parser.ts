import JSZip from 'jszip';
import { createExtractorFromData } from 'node-unrar-js';
import unrarWasmUrl from 'node-unrar-js/esm/js/unrar.wasm?url';

/**
 * Cached WebAssembly binary for unrar extraction.
 */
let wasmBinaryCache: ArrayBuffer | null = null;

async function getUnrarWasmBinary(): Promise<ArrayBuffer> {
  if (!wasmBinaryCache) {
    const response = await fetch(unrarWasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch unrar.wasm binary from ${unrarWasmUrl}`);
    }
    wasmBinaryCache = await response.arrayBuffer();
  }
  return wasmBinaryCache;
}

/**
 * Represents a single extracted page image from a comic archive.
 */
export interface ParsedComicPage {
  pageIndex: number;
  fileName: string;
  blob: Blob;
}

/**
 * Parsed metadata from comic archive & optional ComicInfo.xml.
 */
export interface ParsedComicMetadata {
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  description?: string;
  pageCount: number;
  coverImage?: Blob | null;
  fileSize: number;
  fileName: string;
  fileType: 'cbz' | 'cbr' | 'zip' | 'rar' | 'other';
  tags?: string[];
}

/**
 * Complete result of parsing a comic archive file.
 */
export interface ParsedComicResult {
  metadata: ParsedComicMetadata;
  pages: ParsedComicPage[];
}

/**
 * High-performance lazy reader interface that loads pages on demand.
 */
export interface LazyComicReader {
  metadata: ParsedComicMetadata;
  pageNames: string[];
  getPageBlob: (index: number) => Promise<Blob>;
}

/**
 * Valid image file extensions in comic archives.
 */
const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'bmp',
  'tiff',
  'tif',
  'heic',
  'heif',
  'jxl',
]);

/**
 * Determine if a file path is a supported image format.
 */
export function isImageFile(fileName: string): boolean {
  if (!fileName) return false;
  const normalized = fileName.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const baseName = parts[parts.length - 1];

  if (!baseName) return false;
  if (baseName.startsWith('.') || parts.includes('__MACOSX')) return false;

  const ext = baseName.split('.').pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSIONS.has(ext) : false;
}

/**
 * Natural sort string comparator (e.g. "page2.jpg" comes before "page10.jpg").
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Infer MIME type from file extension.
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'bmp':
      return 'image/bmp';
    default:
      return 'image/jpeg';
  }
}

/**
 * Format a raw filename into a human-readable title fallback.
 */
export function cleanTitleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, '');
  return base.replace(/[_]/g, ' ').trim();
}

/**
 * Parse an embedded ComicInfo.xml string.
 */
export function parseComicInfoXml(xmlText: string): Partial<ParsedComicMetadata> {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const getText = (tagName: string): string | undefined => {
      const el = xmlDoc.getElementsByTagName(tagName)[0];
      return el && el.textContent ? el.textContent.trim() : undefined;
    };

    const getNumber = (tagName: string): number | undefined => {
      const val = getText(tagName);
      if (!val) return undefined;
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    };

    const title = getText('Title');
    const series = getText('Series');
    const number = getText('Number');
    const writer = getText('Writer');
    const publisher = getText('Publisher');
    const year = getNumber('Year');
    const summary = getText('Summary');
    const genre = getText('Genre');

    let fullTitle = title;
    if (!fullTitle && series) {
      fullTitle = number ? `${series} #${number}` : series;
    }

    const tags = genre ? genre.split(',').map((t) => t.trim()) : undefined;

    return {
      title: fullTitle,
      author: writer,
      publisher,
      year,
      description: summary,
      tags,
    };
  } catch (err) {
    console.warn('Failed to parse ComicInfo.xml:', err);
    return {};
  }
}

/**
 * Parse a CBZ or ZIP archive file.
 */
export async function parseCbzArchive(file: File): Promise<ParsedComicResult> {
  const zip = await JSZip.loadAsync(file);
  let comicInfoXmlText: string | undefined;

  const imageEntries: { name: string; entry: JSZip.JSZipObject }[] = [];

  for (const [name, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;

    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('comicinfo.xml')) {
      comicInfoXmlText = await zipEntry.async('text');
    } else if (isImageFile(name)) {
      imageEntries.push({ name, entry: zipEntry });
    }
  }

  imageEntries.sort((a, b) => naturalCompare(a.name, b.name));

  if (imageEntries.length === 0) {
    throw new Error('No valid image pages found in the CBZ archive.');
  }

  const pages: ParsedComicPage[] = [];
  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const mimeType = getMimeType(entry.name);
    const arrayBuffer = await entry.entry.async('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: mimeType });

    pages.push({
      pageIndex: i,
      fileName: entry.name,
      blob,
    });
  }

  const parsedXml = comicInfoXmlText ? parseComicInfoXml(comicInfoXmlText) : {};

  const metadata: ParsedComicMetadata = {
    title: parsedXml.title || cleanTitleFromFileName(file.name),
    author: parsedXml.author,
    publisher: parsedXml.publisher,
    year: parsedXml.year,
    description: parsedXml.description,
    pageCount: pages.length,
    coverImage: pages[0]?.blob || null,
    fileSize: file.size,
    fileName: file.name,
    fileType: file.name.toLowerCase().endsWith('.zip') ? 'zip' : 'cbz',
    tags: parsedXml.tags,
  };

  return { metadata, pages };
}

/**
 * Parse a CBR or RAR archive file using node-unrar-js WASM.
 */
export async function parseCbrArchive(file: File): Promise<ParsedComicResult> {
  const arrayBuffer = await file.arrayBuffer();
  const wasmBinary = await getUnrarWasmBinary();
  const extractor = await createExtractorFromData({
    data: arrayBuffer,
    wasmBinary,
  });
  const extracted = extractor.extract();

  let comicInfoXmlText: string | undefined;
  const imageEntries: { name: string; bytes: Uint8Array }[] = [];

  for (const item of extracted.files) {
    if (item.fileHeader.flags.directory || !item.extraction) continue;

    const name = item.fileHeader.name;
    const lowerName = name.toLowerCase();

    if (lowerName.endsWith('comicinfo.xml')) {
      const decoder = new TextDecoder('utf-8');
      comicInfoXmlText = decoder.decode(item.extraction);
    } else if (isImageFile(name)) {
      imageEntries.push({ name, bytes: item.extraction });
    }
  }

  imageEntries.sort((a, b) => naturalCompare(a.name, b.name));

  if (imageEntries.length === 0) {
    throw new Error('No valid image pages found in the CBR archive.');
  }

  const pages: ParsedComicPage[] = [];
  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const mimeType = getMimeType(entry.name);
    const pageBytes = Uint8Array.from(entry.bytes);
    const blob = new Blob([pageBytes.buffer], { type: mimeType });

    pages.push({
      pageIndex: i,
      fileName: entry.name,
      blob,
    });
  }

  const parsedXml = comicInfoXmlText ? parseComicInfoXml(comicInfoXmlText) : {};

  const metadata: ParsedComicMetadata = {
    title: parsedXml.title || cleanTitleFromFileName(file.name),
    author: parsedXml.author,
    publisher: parsedXml.publisher,
    year: parsedXml.year,
    description: parsedXml.description,
    pageCount: pages.length,
    coverImage: pages[0]?.blob || null,
    fileSize: file.size,
    fileName: file.name,
    fileType: file.name.toLowerCase().endsWith('.rar') ? 'rar' : 'cbr',
    tags: parsedXml.tags,
  };

  return { metadata, pages };
}

/**
 * Universal archive parser supporting .cbz, .cbr, .zip, and .rar files.
 */
export async function parseComicArchive(file: File): Promise<ParsedComicResult> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.cbr') || lowerName.endsWith('.rar')) {
    try {
      return await parseCbrArchive(file);
    } catch {
      return await parseCbzArchive(file);
    }
  } else if (lowerName.endsWith('.cbz') || lowerName.endsWith('.zip')) {
    try {
      return await parseCbzArchive(file);
    } catch {
      return await parseCbrArchive(file);
    }
  } else {
    try {
      return await parseCbzArchive(file);
    } catch {
      return await parseCbrArchive(file);
    }
  }
}

/**
 * Lazy CBZ parser for instant reader loading & background page extraction.
 */
export async function parseCbzArchiveLazy(file: File): Promise<LazyComicReader> {
  const zip = await JSZip.loadAsync(file);
  let comicInfoXmlText: string | undefined;
  const imageEntries: { name: string; entry: JSZip.JSZipObject }[] = [];

  for (const [name, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('comicinfo.xml')) {
      comicInfoXmlText = await zipEntry.async('text');
    } else if (isImageFile(name)) {
      imageEntries.push({ name, entry: zipEntry });
    }
  }

  imageEntries.sort((a, b) => naturalCompare(a.name, b.name));

  if (imageEntries.length === 0) {
    throw new Error('No valid image pages found in the CBZ archive.');
  }

  const blobCache = new Map<number, Blob>();

  const getPageBlob = async (index: number): Promise<Blob> => {
    if (blobCache.has(index)) {
      return blobCache.get(index)!;
    }
    const entry = imageEntries[index];
    if (!entry) throw new Error(`Page index ${index} out of bounds.`);
    const buffer = await entry.entry.async('arraybuffer');
    const blob = new Blob([buffer], { type: getMimeType(entry.name) });
    blobCache.set(index, blob);
    return blob;
  };

  const coverBlob = await getPageBlob(0);
  const parsedXml = comicInfoXmlText ? parseComicInfoXml(comicInfoXmlText) : {};

  const metadata: ParsedComicMetadata = {
    title: parsedXml.title || cleanTitleFromFileName(file.name),
    author: parsedXml.author,
    publisher: parsedXml.publisher,
    year: parsedXml.year,
    description: parsedXml.description,
    pageCount: imageEntries.length,
    coverImage: coverBlob,
    fileSize: file.size,
    fileName: file.name,
    fileType: file.name.toLowerCase().endsWith('.zip') ? 'zip' : 'cbz',
    tags: parsedXml.tags,
  };

  return {
    metadata,
    pageNames: imageEntries.map((e) => e.name),
    getPageBlob,
  };
}

/**
 * Lazy CBR parser for instant reader loading & background page extraction.
 */
export async function parseCbrArchiveLazy(file: File): Promise<LazyComicReader> {
  const arrayBuffer = await file.arrayBuffer();
  const wasmBinary = await getUnrarWasmBinary();
  const extractor = await createExtractorFromData({
    data: arrayBuffer,
    wasmBinary,
  });
  const extracted = extractor.extract();

  let comicInfoXmlText: string | undefined;
  const imageEntries: { name: string; bytes: Uint8Array }[] = [];

  for (const item of extracted.files) {
    if (item.fileHeader.flags.directory || !item.extraction) continue;
    const name = item.fileHeader.name;
    const lowerName = name.toLowerCase();

    if (lowerName.endsWith('comicinfo.xml')) {
      const decoder = new TextDecoder('utf-8');
      comicInfoXmlText = decoder.decode(item.extraction);
    } else if (isImageFile(name)) {
      imageEntries.push({ name, bytes: item.extraction });
    }
  }

  imageEntries.sort((a, b) => naturalCompare(a.name, b.name));

  if (imageEntries.length === 0) {
    throw new Error('No valid image pages found in the CBR archive.');
  }

  const blobCache = new Map<number, Blob>();

  const getPageBlob = async (index: number): Promise<Blob> => {
    if (blobCache.has(index)) {
      return blobCache.get(index)!;
    }
    const entry = imageEntries[index];
    if (!entry) throw new Error(`Page index ${index} out of bounds.`);
    const pageBytes = Uint8Array.from(entry.bytes);
    const blob = new Blob([pageBytes.buffer], { type: getMimeType(entry.name) });
    blobCache.set(index, blob);
    return blob;
  };

  const coverBlob = await getPageBlob(0);
  const parsedXml = comicInfoXmlText ? parseComicInfoXml(comicInfoXmlText) : {};

  const metadata: ParsedComicMetadata = {
    title: parsedXml.title || cleanTitleFromFileName(file.name),
    author: parsedXml.author,
    publisher: parsedXml.publisher,
    year: parsedXml.year,
    description: parsedXml.description,
    pageCount: imageEntries.length,
    coverImage: coverBlob,
    fileSize: file.size,
    fileName: file.name,
    fileType: file.name.toLowerCase().endsWith('.rar') ? 'rar' : 'cbr',
    tags: parsedXml.tags,
  };

  return {
    metadata,
    pageNames: imageEntries.map((e) => e.name),
    getPageBlob,
  };
}

/**
 * Universal lazy archive parser for instant reader startup.
 */
export async function parseComicArchiveLazy(file: File): Promise<LazyComicReader> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.cbr') || lowerName.endsWith('.rar')) {
    try {
      return await parseCbrArchiveLazy(file);
    } catch {
      return await parseCbzArchiveLazy(file);
    }
  } else if (lowerName.endsWith('.cbz') || lowerName.endsWith('.zip')) {
    try {
      return await parseCbzArchiveLazy(file);
    } catch {
      return await parseCbrArchiveLazy(file);
    }
  } else {
    try {
      return await parseCbzArchiveLazy(file);
    } catch {
      return await parseCbrArchiveLazy(file);
    }
  }
}
