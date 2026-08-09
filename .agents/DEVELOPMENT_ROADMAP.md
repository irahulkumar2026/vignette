# Splash: Progressive Web App Comic Reader - Complete Development Roadmap

## Instructions for Antigravity AI Agents
- Build the application strictly following these numbered stages.
- Each stage introduces specific functional code and components. Ensure code cleanliness, clear commit/file boundaries, and adherence to the Apple-inspired flat dark design system (solid opaque surfaces, tonal hierarchy, minimal animations). See `.agents/UI_SPEC.md` for full spec.
- **Documentation Rule:** Maintain `.agents/PROGRESS.md`. At the end of every completed stage, update `.agents/PROGRESS.md` to log completed stages, the current active stage, and a summary of files created or modified to maintain project state.

---

## Stage 1: Project Setup & Design System Foundation
- **Goal:** Initialize the environment, configuration, and styling design tokens.
- **Tasks:**
  1. Scaffold Vite + React + TypeScript project.
  2. Install and configure Tailwind CSS.
  3. Define design tokens in `tailwind.config.js` (Pure black background `#000000`, card grays, custom blur classes like `backdrop-blur-xl`).
  4. Establish core folder structure (`src/components`, `src/db`, `src/hooks`, `src/editor`, `src/utils`).
  5. Create the initial `PROGRESS.md` file logging that Stage 1 is complete.
- **Code Signifiers to Produce:** `tailwind.config.js`, `src/index.css` with custom styling variables, base layout wrappers, and `PROGRESS.md`.

---

## Stage 2: Local Storage & Database Layer (IndexedDB)
- **Goal:** Implement persistent client-side storage so that user libraries and comic metadata survive browser sessions.
- **Tasks:**
  1. Install `dexie`.
  2. Create `src/db/db.ts` to define the database schema (storing comic metadata, cover images, binary archive blobs, and reading positions).
  3. Create reusable data access hooks/functions for saving, querying, and updating entries.
  4. Update `PROGRESS.md` to log Stage 2 completion.
- **Code Signifiers to Produce:** `src/db/db.ts`, Dexie table interfaces, and local data persistence wrappers.

---

## Stage 3: Archive Parsing Engine (CBZ & CBR Support)
- **Goal:** Handle local extraction of comic book archive files directly in the browser memory.
- **Tasks:**
  1. Install `jszip` for handling `.cbz` archives.
  2. Integrate WASM/JS parsing solutions for `.cbr` archives.
  3. Build parsing utilities (`src/utils/parser.ts`) to read incoming files, extract ordered page images as image `Blob` objects, and read `ComicInfo.xml` metadata if present.
  4. Update `PROGRESS.md` to log Stage 3 completion.
- **Code Signifiers to Produce:** `jszip` integration blocks, WebAssembly file loaders, and blob URL creation routines.

---

## Stage 4: Library UI & Dashboard View
- **Goal:** Build the visual interface for organizing, browsing, and searching user comics.
- **Tasks:**
  1. Create a glassmorphic sidebar (`src/components/Sidebar.tsx`) with heavy backdrop blur and clean navigation links.
  2. Build a frosted top search bar and header.
  3. Create the library grid view (`src/components/LibraryGrid.tsx`) featuring cover thumbnails, titles, and live reading progress bars.
  4. Implement drag-and-drop file upload capabilities for quick importing.
  5. Update `PROGRESS.md` to log Stage 4 completion.
- **Code Signifiers to Produce:** Sidebar component, Grid layout components, Lucide icons configuration, and file drop-zone handlers.

---

## Stage 5: The Universal Reader Engine
- **Goal:** Provide a seamless, multi-mode comic reading experience with responsive layout adaptation.
- **Tasks:**
  1. Implement **Single-Page Mode** for desktop views.
  2. Implement **Double-Page Spread Mode** for iPad/tablet viewports.
  3. Implement **Vertical Webtoon Mode** for mobile devices using CSS scroll-snap (`scroll-snap-type: y mandatory`).
  4. Build auto-hiding reader overlay controllers (brightness/page sliders, headers, and quick-settings panels).
  5. Add keyboard navigation bindings (arrow keys, spacebar, fullscreen toggles).
  6. Update `PROGRESS.md` to log Stage 5 completion.
- **Code Signifiers to Produce:** Viewport mode selectors, scroll-snap styling rules, keyboard listener hooks, and dynamic toolbar overlays.

---

## Stage 6: Advanced Editing & Re-Export Engine
- **Goal:** Allow users to modify comic structures (reorder, add, or delete pages) and re-export them.
- **Tasks:**
  1. Build a filmstrip thumbnail management interface for page visualization.
  2. Implement state manipulation functions to splice, delete, and insert image items within the page array.
  3. Add drag-and-drop page reordering mechanics.
  4. Build an export module leveraging `JSZip` to re-bundle the modified array into a fresh `.cbz` archive and initiate user download.
  5. Update `PROGRESS.md` to log Stage 6 completion.
- **Code Signifiers to Produce:** Filmstrip components, array mutation handlers, and `JSZip` archive generation logic.

---

## Stage 7: PWA Polish & Offline Readiness
- **Goal:** Convert the web application into an installable, high-performance Progressive Web App.
- **Tasks:**
  1. Install and configure `vite-plugin-pwa` in `vite.config.ts`.
  2. Write the web app manifest (`manifest.json`) specifying metadata, standalone display mode, and high-res icons.
  3. Configure Workbox service worker caching rules for full offline support.
  4. Update `PROGRESS.md` to log Stage 7 completion.
- **Code Signifiers to Produce:** `vite.config.ts` PWA plugin setup, `manifest.json`, and service worker registration configurations.

---

## Stage 8: Advanced Coloring & Artistic Feature Suite ("Pigments" Integration)
- **Goal:** Introduce an advanced in-app coloring and artistic enhancement suite inspired by digital coloring apps like Pigments, allowing users to colorize monochrome/black-and-white comic pages or touch up panels directly inside the reader.
- **Tasks:**
  1. Build a dedicated drawing/coloring canvas overlay (`src/editor/ColoringCanvas.tsx`) integrated with the reader view.
  2. Implement digital brush engines, eyedropper color sampling tools, opacity controls, and custom color swatch palettes tailored for comic art.
  3. Integrate layer management capabilities (line art protection layer vs. flat coloring layer) to ensure user coloring does not bleed over original ink lines.
  4. Add flood-fill (paint bucket) tools with edge-detection boundaries for rapid panel painting.
  5. Save colorized modifications directly back into the page state array so they can be preserved or bundled into the exported `.cbz` archive.
  6. Update `PROGRESS.md` to log Stage 8 completion.
- **Code Signifiers to Produce:** HTML5 Canvas drawing hooks, flood-fill algorithm modules, brush configuration states, and layer separation compositing utilities.