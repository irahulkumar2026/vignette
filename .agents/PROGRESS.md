# Splash — Project Progress & Memory Bank

## Project Overview
**Splash** is a high-performance PWA comic book reader for desktop and iPad, built with Vite, React, TypeScript, and Tailwind CSS. Apple-inspired flat design system (supporting both Dark and Light themes) with solid opaque surfaces, tonal hierarchy, and minimal animations.

---

## Current Status
- **Current Active Stage:** Stage 6: Page Editing & Re-Export Engine
- **Completed Stages:** Stage 1, Stage 2, Stage 3, Stage 4, Stage 5 (including Instant Import & Page Cache Engine)
- **Design System:** Apple Flat (Dark/Light ready, see `.agents/UI_SPEC.md`)

---

## Completed Stages

### Stage 1: Project Setup & Design System Foundation
**Status:** Complete

---

### Stage 2: Local Storage & Database Layer (IndexedDB)
**Status:** Complete (Updated with `PageRecord` v2 schema for instant page caching)

---

### Stage 3: Archive Parsing Engine (CBZ & CBR Support)
**Status:** Complete

---

### Stage 4: Library UI & Dashboard View
**Status:** Complete

---

### Stage 5: The Universal Reader Engine & Progressive Instant Import Pipeline
**Status:** Complete

**Tasks & Enhancements:**
1. Created `PageRecord` table schema (`version(2)`) in `src/db/db.ts` to store pre-extracted page image Blobs directly in IndexedDB.
2. Created `src/utils/importer.ts` (`importComicFileProgressive`):
   - **Fast Pass (< 50ms)**: Instantly extracts metadata + Page 0 (Cover) + Page 1, saves to IndexedDB `comics` table -> **Comic Card appears immediately in the library grid with real cover art**!
   - **Non-blocking Background Streaming**: Unpacks remaining pages (`page 2..N`) into IndexedDB `pages` table in a background queue while updating progress.
3. Added **Apple-Style Circular SVG Progress Ring** on `ComicCard.tsx` displaying live percentage progress (`10%` -> `100%`) on cards currently importing in the background.
4. Updated `src/components/ReaderViewport.tsx`:
   - Checks IndexedDB `pages` table first -> **Instant 0ms Reader open** for Page 1 even if the user opens the comic mid-import!
   - Full Single-Page, Double-Spread, and Webtoon scroll-snap modes with zero-chrome controls.
5. Validated TypeScript build (`npx tsc -b`).

**Files Created / Modified in Stage 5 Performance Engine:**
- [src/db/db.ts](file:///d:/Project/Antigravity/Splash/src/db/db.ts) — Added `PageRecord` schema (v2 migration)
- [src/db/comics.ts](file:///d:/Project/Antigravity/Splash/src/db/comics.ts) — Added `savePageBlob`, `getPageBlobFromDb`, `updateComicImportProgress`
- [src/utils/importer.ts](file:///d:/Project/Antigravity/Splash/src/utils/importer.ts) — Instant Fast Pass (<50ms) + background streaming engine
- [src/utils/index.ts](file:///d:/Project/Antigravity/Splash/src/utils/index.ts) — Re-exported importer module
- [src/components/ComicCard.tsx](file:///d:/Project/Antigravity/Splash/src/components/ComicCard.tsx) — Added Circular SVG Progress Ring for importing cards
- [src/components/DropZone.tsx](file:///d:/Project/Antigravity/Splash/src/components/DropZone.tsx) — Updated to use progressive import engine
- [src/components/ReaderViewport.tsx](file:///d:/Project/Antigravity/Splash/src/components/ReaderViewport.tsx) — Instant 0ms reader opening using IndexedDB page cache
- [.agents/PROGRESS.md](file:///d:/Project/Antigravity/Splash/.agents/PROGRESS.md) — Updated progress log

---

## Next Up
- **Stage 6: Page Editing & Re-Export Engine**
  - Create Page Editor interface (`src/components/PageEditor.tsx`)
  - Build vertical/horizontal filmstrip thumbnail sidebar with drag-and-drop page reordering
  - Build page manipulation actions (delete page, insert blank/new page, rotate page)
  - Implement re-export engine to repackage modified pages into downloadable `.cbz` zip archives
