# Splash — UI/UX Design Specification

> Simple, fast, elegant. Apple-inspired flat dark UI for a comic book reader PWA.  
> Desktop and iPad are the primary platforms.

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|---|---|
| **Content First** | The comic art is the hero. UI is invisible infrastructure — flat, quiet surfaces that never compete with artwork. |
| **Apple Flat Dark** | Solid opaque surfaces with tonal separation. No blur effects, no transparency, no gradients on chrome. Hierarchy comes from background shade steps, not visual noise. |
| **Effortless Speed** | No GPU-heavy effects. Solid backgrounds render instantly. Animations are short, purposeful, and only where they communicate state change. |
| **Dual-Input Design** | Desktop gets full keyboard/mouse power (shortcuts, hover states, right-click menus, drag handles). iPad gets precision touch and gesture mapping (swipe, pinch, long-press, Apple Pencil pressure). Both are first-class citizens. |
| **Zero-Chrome Reading** | In reader mode, the UI target is 0% chrome — all controls auto-hide, leaving only the art and a thin progress indicator. |

### Design Inspirations
- **macOS System Settings** — Flat sidebar, clean content panels, zero ornamentation
- **Apple Music (dark mode)** — Solid card surfaces, tonal hierarchy, cover art as the only visual richness
- **iPad Files app** — Functional flat panels, clear navigation, fast rendering
- **Arc Browser** — Command palette, minimal chrome, keyboard-first
- **Procreate** — Clean floating tool panels for the coloring suite

---

## 2. Color System & Theming

Splash ships with **two themes** — Dark and Light. The user can switch between them at any time via a toggle in the header or settings. The system also respects `prefers-color-scheme` for the initial default.

### 2.1 Dark Mode (Default)

| Token | Hex | Role |
|---|---|---|
| `bg-primary` | `#000000` | App background, reader canvas |
| `bg-secondary` | `#0e0e10` | Sidebar, panels |
| `bg-tertiary` | `#1c1c1e` | Cards, list items, inputs |
| `bg-elevated` | `#2c2c2e` | Hover, active, dropdowns |
| `bg-active` | `#3a3a3c` | Pressed states |
| `border-subtle` | `#2c2c2e` | Dividers, card borders |
| `border-strong` | `#48484a` | Focus rings, active borders |
| `text-primary` | `#f5f5f7` | Headings, body text |
| `text-secondary` | `#8e8e93` | Captions, metadata |
| `text-muted` | `#636366` | Placeholders, disabled |

### 2.2 Light Mode

| Token | Hex | Role |
|---|---|---|
| `bg-primary` | `#ffffff` | App background |
| `bg-secondary` | `#f2f2f7` | Sidebar, panels |
| `bg-tertiary` | `#e5e5ea` | Cards, list items, inputs |
| `bg-elevated` | `#d1d1d6` | Hover, active, dropdowns |
| `bg-active` | `#c7c7cc` | Pressed states |
| `border-subtle` | `#d1d1d6` | Dividers, card borders |
| `border-strong` | `#aeaeb2` | Focus rings, active borders |
| `text-primary` | `#1c1c1e` | Headings, body text |
| `text-secondary` | `#636366` | Captions, metadata |
| `text-muted` | `#aeaeb2` | Placeholders, disabled |

> Light mode reader canvas stays **black** by default (comics look best on black). User can override via reader settings.

### 2.3 Accent Colors (Shared)

Accents are the same in both themes — Apple's adaptive accent philosophy:

| Token | Hex | Role |
|---|---|---|
| `accent-blue` | `#0a84ff` | Primary actions, links, active nav, progress |
| `accent-purple` | `#5e5ce6` | Editor mode, coloring tools |
| `accent-teal` | `#64d2ff` | Informational badges |
| `accent-red` | `#ff453a` | Destructive actions, alerts |
| `accent-green` | `#30d158` | Success, completion |
| `accent-orange` | `#ff9f0a` | Warnings, partial progress |

### 2.4 Theme Switching Strategy

**Implementation:**
- Theme is stored in `localStorage` as `"dark"` or `"light"`
- On first load: check `localStorage` → fallback to `prefers-color-scheme` → default to `dark`
- Toggle applies instantly — no page reload
- A `data-theme="dark|light"` attribute on `<html>` drives CSS custom property values
- React context (`ThemeContext`) provides `theme` and `toggleTheme` to all components

**Toggle Location:**
- Header bar: Sun/Moon icon button (always visible)
- Settings panel: "Appearance" section with explicit Dark / Light / System options

### 2.5 CSS Custom Properties

```css
/* Dark theme (default) */
:root,
[data-theme="dark"] {
  color-scheme: dark;
  --sp-bg-primary:     #000000;
  --sp-bg-secondary:   #0e0e10;
  --sp-bg-tertiary:    #1c1c1e;
  --sp-bg-elevated:    #2c2c2e;
  --sp-bg-active:      #3a3a3c;
  --sp-border-subtle:  #2c2c2e;
  --sp-border-strong:  #48484a;
  --sp-text-primary:   #f5f5f7;
  --sp-text-secondary: #8e8e93;
  --sp-text-muted:     #636366;
  --sp-accent:         #0a84ff;
}

/* Light theme */
[data-theme="light"] {
  color-scheme: light;
  --sp-bg-primary:     #ffffff;
  --sp-bg-secondary:   #f2f2f7;
  --sp-bg-tertiary:    #e5e5ea;
  --sp-bg-elevated:    #d1d1d6;
  --sp-bg-active:      #c7c7cc;
  --sp-border-subtle:  #d1d1d6;
  --sp-border-strong:  #aeaeb2;
  --sp-text-primary:   #1c1c1e;
  --sp-text-secondary: #636366;
  --sp-text-muted:     #aeaeb2;
  --sp-accent:         #007aff;
}
```

> All components use `var(--sp-*)` tokens — theme switch is a single attribute change, no component re-renders needed for color changes.

## 3. Typography System

### Font Stack
```
Primary:   'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif
Monospace: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace
```

### Type Scale

| Token | Size | Weight | Letter-Spacing | Usage |
|---|---|---|---|---|
| `display` | 34px | 700 | -0.02em | Section titles, hero text |
| `title` | 22px | 600 | -0.01em | Card headings, modal titles |
| `headline` | 17px | 600 | -0.01em | Sidebar sections, panel labels |
| `body` | 15px | 400 | 0 | General text, descriptions |
| `callout` | 14px | 400 | 0 | List secondary text |
| `caption` | 13px | 500 | 0.01em | Metadata, timestamps, badges |
| `micro` | 11px | 600 | 0.04em | Pill labels, keyboard shortcuts |

---

## 4. Surface System

Instead of glassmorphism tiers, Splash uses **flat surface classes** — solid backgrounds with clean 1px borders. Fast to render, easy to read, no GPU overhead.

### 4.1 Surface Classes

| Class | Background | Border | Use Case |
|---|---|---|---|
| `.surface-base` | `#000000` | none | Root app background, reader canvas |
| `.surface-sidebar` | `#0e0e10` | right: `1px solid #2c2c2e` | Sidebar panel |
| `.surface-card` | `#1c1c1e` | `1px solid #2c2c2e` | Library cards, settings groups, panels |
| `.surface-elevated` | `#2c2c2e` | `1px solid #3a3a3c` | Dropdowns, popovers, tooltips |
| `.surface-header` | `#0e0e10` | bottom: `1px solid #2c2c2e` | Sticky top bar |
| `.surface-toolbar` | `#1c1c1e` | top: `1px solid #2c2c2e` | Bottom toolbars, reader controls |
| `.surface-overlay` | `rgba(0,0,0,0.6)` | none | Modal backdrop (the ONLY transparency in the system) |

### 4.2 Separation Rules
- **No drop shadows** on flat surfaces — hierarchy comes from background tone differences
- **1px borders** in `border-subtle` for adjacent-panel separation
- **8px gap** between cards in grid layouts
- **16px padding** inside cards, **24px padding** inside panels
- **Border-radius:** `12px` for cards, `8px` for buttons/inputs, `20px` for modals, `full` for pills

---

## 5. Iconography

| Library | Usage |
|---|---|
| **Lucide React** | All icons — navigation, actions, status indicators |

### Icon Rules

| Context | Size | Color |
|---|---|---|
| Navigation items | 20px | `text-secondary` (active: `accent-blue`) |
| Action buttons | 18px | `text-secondary` |
| Inline labels | 16px | `text-muted` |
| Empty state | 48px | `text-muted` |

---

## 6. Platform Strategy & Responsive Layout

> **Primary Platforms:** Desktop (1024px+) and iPad (768px – 1366px).  
> **Secondary:** Mobile phones supported as graceful fallback.

### 6.1 Breakpoints

| Name | Width | Target | Priority |
|---|---|---|---|
| `tablet-portrait` | 768px – 1024px | iPad portrait | **Primary** |
| `tablet-landscape` | 1024px – 1366px | iPad landscape, iPad Pro | **Primary** |
| `desktop` | 1024px – 1440px | Laptop, desktop browser | **Primary** |
| `ultra` | > 1440px | Wide monitors | **Primary** |
| `mobile` | < 768px | Phones (fallback) | Secondary |

### 6.2 Desktop Layout (1024px+)

| View | Layout |
|---|---|
| **Library** | Persistent 240px sidebar (flat, `bg-secondary`) + 4–6 column cover grid. Sidebar collapses to 64px icon rail via toggle. |
| **Reader** | Full-viewport. Controls appear on mouse-move, auto-hide after 3s. Keyboard-driven. |
| **Editor** | Three-column: 200px filmstrip / flexible canvas / 260px properties panel. |
| **Coloring** | Full canvas + 260px docked tool panel on right. |

**Desktop Pointer Behaviors:**
- Hover: cards show `bg-elevated` background shift (no lift/shadow)
- Right-click context menus on library cards
- Drag-and-drop for file import and page reorder
- Mouse wheel zoom in reader
- Resizable panels via drag handles

### 6.3 iPad Layout (768px – 1366px)

| View | Portrait | Landscape |
|---|---|---|
| **Library** | Hidden sidebar (swipe-in sheet) + 3 col grid | Persistent narrow sidebar (200px) + 4 col grid |
| **Reader** | Single-page, tap-to-turn | **Double-page spread**, swipe to turn |
| **Editor** | Horizontal filmstrip at bottom + canvas | Vertical filmstrip (160px) + canvas + slide-over properties |
| **Coloring** | Bottom-sheet tool palette | Canvas + 220px docked side palette |

**iPad Gesture Mapping:**

| Gesture | Context | Action |
|---|---|---|
| Swipe left/right | Reader | Turn page |
| Swipe from left edge | Library | Open sidebar |
| Pinch-to-zoom | Reader | Zoom into panel |
| Long-press | Library card | Context menu |
| Tap center | Reader | Toggle toolbar |
| Tap left/right third | Reader | Prev / Next page |
| Drag | Editor filmstrip | Reorder pages |

**iPad PWA:**
- `viewport-fit=cover` + `env(safe-area-inset-*)` padding
- `standalone` display mode
- iPad Split View / Slide Over support (min 320px width)
- Apple Pencil pressure in coloring mode (Pointer Events API)
- 44px minimum touch targets

### 6.4 Mobile Fallback (< 768px)
- Bottom nav bar replaces sidebar
- 2-column cover grid
- Vertical webtoon scroll as default reader mode
- Stacked editor layout
- Bottom-sheet tool palettes

### 6.5 Mockup References

Stored in [.agents/design/](file:///d:/Project/Antigravity/Splash/.agents/design).

---

## 7. Component Specifications

### 7.1 Sidebar (Stage 4)

```
┌──────────────────────┐
│                      │
│  SPLASH              │  ← Brand text, title weight, text-primary
│                      │
│ ▌ Library            │  ← Active: 3px left bar (accent-blue),
│   Continue Reading   │     blue icon, bg-tertiary background
│   Favorites          │  ← Inactive: text-secondary, no bg
│   Recent             │
│                      │
│─────────────────────-│  ← 1px border-subtle divider
│  COLLECTIONS         │  ← micro type, text-muted, uppercase
│  ● Superhero         │  ← Colored dot + label
│  ● Manga             │
│  ● Indie             │
│                      │
│──────────────────────│
│   Settings           │
│   v0.1.0             │  ← micro, text-muted
└──────────────────────┘
Width: 240px (desktop), slide-in sheet (iPad portrait)
Background: bg-secondary (solid #0e0e10)
Border: right 1px solid border-subtle
Active item: bg-tertiary + 3px left accent-blue bar
Collapse: 64px icon-only rail
Transition: width 200ms ease-out
```

### 7.2 Library Grid Card (Stage 4)

```
┌─────────────────────────┐
│                         │
│     ┌───────────┐       │
│     │           │       │
│     │  COVER    │       │  ← Cover image, 8px radius, overflow hidden
│     │  IMAGE    │       │
│     │           │       │
│     └───────────┘       │
│                         │
│  Batman: Year One       │  ← title weight, text-primary, 1-line truncate
│  Frank Miller · 1987    │  ← caption, text-secondary
│                         │
│  ████████░░░░  67%      │  ← 4px tall bar: accent-blue fill,
│                         │     bg-elevated track, caption % label
│  CBZ  ·  42 pages       │  ← micro, text-muted
└─────────────────────────┘
Background: bg-tertiary (solid #1c1c1e)
Border: 1px solid border-subtle
Border-radius: 12px (card), 8px (cover image)
Hover: background shifts to bg-elevated, no transform/shadow
Transition: background-color 150ms ease
```

### 7.3 File Import Drop Zone (Stage 4)

```
┌─────────────────────────────────────────┐
│                                         │
│       ↓  Drop .cbz or .cbr files        │  ← 48px Lucide icon, text-muted
│                                         │
│       or  [ Browse Files ]              │  ← Solid accent-blue button
│                                         │
└─────────────────────────────────────────┘
Default: 2px dashed border (border-subtle), bg-primary
Active (file hovering): dashed border turns accent-blue,
  bg shifts to bg-secondary
Processing: Inline progress bar replaces text
```

### 7.4 Universal Reader — Controls Overlay (Stage 5)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back     Batman: Year One    Ch.3      Settings  ⛶  │  ← surface-header, auto-hides
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                    [COMIC PAGE]                          │  ← Full bleed, pure black bg
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ◀  12 / 42                   ████████░░░░░░░░░░░  ▶   │  ← surface-toolbar
│                                                         │
│   Single  ·  Spread  ·  Webtoon            Coloring     │  ← Segmented control
└─────────────────────────────────────────────────────────┘

Auto-hide: show on tap/mouse-move, hide after 3s
Transition: opacity 200ms ease
When hidden: only a 2px accent-blue progress line at bottom edge
Header/toolbar bg: solid bg-secondary (opaque, not transparent)
```

### 7.5 Reader Mode Switcher (Stage 5)

```
┌───────────────────────────────────────────┐
│   Single   │  Spread  │   Webtoon        │
└───────────────────────────────────────────┘
Style: Apple-style segmented control
Background: bg-tertiary
Active segment: bg-elevated + text-primary
Inactive segment: transparent + text-secondary
Transition: background 150ms ease
Border-radius: 8px (outer), 6px (segments)
```

### 7.6 Quick Settings Panel (Stage 5)

```
┌──────────────────────────────┐
│  Reading Settings            │
│──────────────────────────────│
│                              │
│  Brightness                  │
│  ═══════════●══════          │  ← Flat slider: accent-blue thumb,
│                              │     bg-elevated track
│  Page Gap       [ 0px  ▾ ]  │
│                              │
│  Right-to-Left    [  ●━━ ]  │  ← iOS-style toggle
│  Preload Pages    [ ━━● ]   │
│  Page Numbers     [  ●━━ ]  │
│                              │
│  Background                  │
│  ● Black  ○ Dark  ○ Sepia   │
└──────────────────────────────┘
Background: surface-elevated (solid #2c2c2e)
Border: 1px solid border-strong
Border-radius: 12px
Position: popover from settings icon
Entrance: opacity 0 → 1 + translateY(4px) → 0, 150ms
```

### 7.7 Page Editor Filmstrip (Stage 6)

```
Desktop (3-column):
┌──────────┬───────────────────────────┬────────────┐
│ FILMSTRIP│                           │ PROPERTIES │
│          │      ACTIVE PAGE          │            │
│  [p.01]  │      (large preview)      │ Page: 12   │
│  [p.02]  │                           │ 1920x2560  │
│ >[p.03]< │                           │ 2.4 MB     │
│  [p.04]  │                           │            │
│   ...    │                           │ [Delete]   │
│  [p.42]  │                           │ [Insert]   │
│──────────│                           │ [Export]   │
│  + Add   │                           │            │
└──────────┴───────────────────────────┴────────────┘

Filmstrip thumbnails:
  - Size: 72x108px
  - Background: bg-tertiary
  - Active: 2px accent-blue border
  - Dragging: opacity 0.5, no shadow, no scale
  - Drop target: 2px dashed accent-blue line between thumbnails
  - Reorder: items slide apart, 150ms ease
```

### 7.8 Pigments Tool Palette (Stage 8)

```
Docked side palette (desktop):

┌────────────────────┐
│  TOOLS             │  ← headline, text-primary
│────────────────────│
│                    │
│  [P] [B] [F] [E] [I]  ← Icon buttons: Pencil, Brush,
│                    │     Fill, Eraser, Eyedropper
│────────────────────│     Active: accent-purple bg
│  Size   ═══●═════  │
│  Opacity ═══════●  │
│────────────────────│
│  COLORS            │
│  ⬛⬜🟥🟦🟩🟨🟪🟧 │  ← 8-swatch row, active has
│  ⬛⬛🟫🟤⬜⬜⬛⬛ │     2px white border
│────────────────────│
│  [Custom Color]    │  ← Opens color picker popover
│────────────────────│
│  LAYERS            │
│  ▣ Coloring        │  ← Checkbox visible, active layer
│  🔒 Line Art       │  ← Lock icon, protected
│────────────────────│
│  [Undo]  [Redo]    │
└────────────────────┘

Background: surface-sidebar (solid bg-secondary)
Border: left 1px solid border-subtle
Width: 260px (desktop), bottom sheet (iPad portrait)
Active tool: accent-purple background, white icon
Buttons: bg-tertiary, 8px radius
```

---

## 8. Animation & Transition System

Splash uses **minimal, fast animations**. No decorative motion — every animation communicates a state change.

### 8.1 Easing

| Token | Curve | Usage |
|---|---|---|
| `ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Most transitions |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations, reveals |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations, dismissals |

### 8.2 Animations

| Animation | Duration | Details |
|---|---|---|
| **Card hover** | 150ms | Background color shift only (no transform) |
| **Page turn** | 250ms | Crossfade with 20px directional slide |
| **Toolbar show/hide** | 200ms | Opacity + 4px translateY |
| **Modal enter** | 200ms | Opacity fade in, overlay dims |
| **Modal exit** | 150ms | Opacity fade out |
| **Filmstrip reorder** | 150ms | Items slide apart |
| **Progress fill** | 400ms | Width transition |
| **Skeleton shimmer** | 1.5s loop | Background-position sweep |

### 8.3 Rules
- **No transforms on hover** — background-color change only (fast, no repaint)
- **No bounce/spring easing** — clean ease-out curves only
- **No ambient glow pulses** — static surfaces
- **Respect `prefers-reduced-motion`** — kill all transitions

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 9. Micro-Interactions

### Loading States

| State | Visual |
|---|---|
| **Library Loading** | Skeleton cards: bg-tertiary rectangles with shimmer gradient sweep |
| **Archive Parsing** | Inline progress bar (accent-blue fill, bg-elevated track) + filename |
| **Page Loading** | Spinner icon centered on bg-primary |
| **Export** | Progress bar inside toast notification |

### Empty States

```
           (Book icon, 48px, text-muted)

       Your library is empty

  Drop .cbz or .cbr files here to begin.

       [ Import Comics ]  ← accent-blue solid button
```

Clean, centered, no decorative animations.

---

## 10. Keyboard Shortcut System

| Context | Key | Action |
|---|---|---|
| **Global** | `Ctrl/Cmd + K` | Command palette |
| **Global** | `Ctrl/Cmd + ,` | Settings |
| **Library** | `G then L` | Go to Library |
| **Reader** | `Right / Left` | Next / Previous page |
| **Reader** | `Space` | Next page |
| **Reader** | `F` | Fullscreen |
| **Reader** | `1 / 2 / 3` | Single / Spread / Webtoon |
| **Reader** | `Esc` | Exit reader |
| **Editor** | `Delete` | Delete selected page |
| **Editor** | `Ctrl/Cmd + Z` | Undo |
| **Coloring** | `B / E / G / I` | Brush / Eraser / Fill / Eyedropper |
| **Coloring** | `[ / ]` | Brush size down / up |

---

## 11. Command Palette

```
┌──────────────────────────────────────────────────┐
│  Search comics, actions...                        │
│──────────────────────────────────────────────────│
│                                                   │
│  RECENT                                           │
│  Batman: Year One — Page 23                       │
│  Saga Vol. 1 — Page 67                            │
│                                                   │
│  ACTIONS                                          │
│  Import Comics                                    │
│  Export Current Comic                             │
│  Settings                                         │
│  Toggle Fullscreen                                │
│                                                   │
└──────────────────────────────────────────────────┘

Background: surface-elevated (solid #2c2c2e)
Border: 1px solid border-strong
Width: min(560px, 90vw), centered
Overlay: surface-overlay (rgba(0,0,0,0.6)) — the only transparency
Entrance: opacity fade, 150ms
```

---

## 12. CSS Architecture

### 12.1 File Structure

```
src/
├── index.css                  ← Tailwind imports + CSS custom properties + base styles
├── styles/
│   ├── surfaces.css           ← Flat surface utility classes
│   ├── animations.css         ← Keyframes (shimmer, slide, fade)
│   ├── reader.css             ← Page transitions, scroll-snap, fullscreen
│   ├── editor.css             ← Filmstrip layout, drag states, split panes
│   └── coloring.css           ← Canvas overlay, tool palette
```

### 12.2 Tailwind Config Extensions

```js
extend: {
  colors: {
    sp: {
      primary:    '#000000',
      secondary:  '#0e0e10',
      tertiary:   '#1c1c1e',
      elevated:   '#2c2c2e',
      active:     '#3a3a3c',
      border:     '#2c2c2e',
      'border-strong': '#48484a',
    }
  },
  transitionTimingFunction: {
    'default': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    'smooth':  'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  animation: {
    'shimmer': 'shimmer 1.5s ease-in-out infinite',
    'fade-in': 'fadeIn 0.15s ease-out forwards',
  },
  borderRadius: {
    'card': '12px',
    'button': '8px',
    'modal': '20px',
  },
}
```

---

## 13. Accessibility

| Area | Requirement |
|---|---|
| **Focus Rings** | `2px` accent-blue outline on `:focus-visible` |
| **Contrast** | Primary text: >= 7:1, Secondary: >= 4.5:1 |
| **Reduced Motion** | All animations disabled via `prefers-reduced-motion` |
| **Touch Targets** | 44x44px minimum on iPad |
| **Keyboard** | Full tab-order, visible focus indicators |

---

## 14. Stage-to-UI Mapping

| Stage | UI Components | CSS Additions |
|---|---|---|
| **1** (done) | Base layout, header, tokens | `surfaces.css`, base styles |
| **2** | *(Data layer, no visual)* | — |
| **3** | Import progress indicators | `animations.css` (shimmer) |
| **4** | Sidebar, Library Grid, Search, Drop Zone, Empty States, Command Palette | Grid layout, card styles |
| **5** | Reader, Mode Switcher, Quick Settings, Auto-hide Toolbar | `reader.css` |
| **6** | Filmstrip, Properties Panel, Drag Reorder | `editor.css` |
| **7** | Install prompt, Offline badge | Toast styles |
| **8** | Coloring Canvas, Tool Palette, Color Wheel, Layers | `coloring.css` |
