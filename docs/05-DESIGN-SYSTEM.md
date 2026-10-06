# Byline — Design System

| | |
|---|---|
| Version | 1.0 |
| Implemented in | Claude Design (Design System artifact) · Tailwind CSS v4 + shadcn/ui |
| Used by | [UI & UX Spec](04-UI-UX-SPEC.md) — every component named there is defined here |
| Inspiration | Linear (dark surface ladder, single accent, tight display tracking) · Initium blog (editorial cards, inverse pill CTAs) · reference blog app (light dashboard, serif reading text) |

---

## 1. Principles

1. **Monochrome first, one accent.** Ink on canvas does the work. `brand` (lavender-blue) is reserved for focus rings, links, active indicators, unread dots and chart lines — never fills large areas.
2. **Hierarchy by surface, not shadow.** A ladder `canvas → surface-1 → surface-2 → surface-3` with 1 px hairlines. Shadows only on floating layers in light theme.
3. **Two voices.** Inter for interface; Source Serif 4 for reading. JetBrains Mono for code only.
4. **Pill for actions, soft rectangles for containers.** Buttons, chips and tabs-as-filters are pills; cards, inputs and images use 8–16 px radii.
5. **Light & dark are equals.** Every token has both values. Default = system.

## 2. Color

### 2.1 Core tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#FFFFFF` | `#08090A` | Page background |
| `surface-1` | `#F7F7F8` | `#0F1011` | Cards, inputs, active side-nav item, quote boxes |
| `surface-2` | `#EFEFF1` | `#161718` | Hovered cards, chips, popovers, selected tab pill |
| `surface-3` | `#E6E6E9` | `#1D1E20` | Pressed states, nested panels, code block header |
| `hairline` | `#ECECEE` | `#23252A` | Dividers, card borders |
| `hairline-strong` | `#D9D9DE` | `#34343A` | Input borders on hover, dashed banner upload, timeline rule |
| `ink` | `#0B0B0C` | `#F7F8F8` | Headlines, primary text, primary button fill |
| `ink-muted` | `#3A3B40` | `#D0D6E0` | Body text in UI |
| `ink-subtle` | `#6B6F76` | `#8A8F98` | Meta (dates, counts, helper text, placeholders) |
| `ink-tertiary` | `#9A9EA6` | `#62666D` | Disabled text, footnotes |
| `on-ink` | `#FFFFFF` | `#08090A` | Text on `ink` fills (primary button) |

### 2.2 Brand & semantic
| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` | `#5E6AD2` | `#7C86E8` | Focus ring, links, active tab underline, unread dot, chart line |
| `brand-hover` | `#4C57C4` | `#959EF0` | Link hover |
| `brand-subtle` | `#EEF0FB` | `#1A1C2E` | Selected text highlight, drag-over banner tint |
| `success` | `#1F8A3B` | `#3DBE5E` | Toast success icon, "Available" username |
| `warning` | `#B26B00` | `#F5A524` | Unsaved changes indicator |
| `danger` | `#D93036` | `#F2555A` | Errors, Delete links, destructive button |
| `like` | `#E5484D` | `#F2555A` | Filled heart (LikeButton active) |
| `overlay` | `rgba(0,0,0,.40)` | `rgba(0,0,0,.60)` | Dialog scrim |

### 2.3 shadcn/ui variable mapping
Byline tokens are the source; shadcn variables are aliases (in `app/globals.css`).
| shadcn var | Byline token |
|---|---|
| `--background` / `--foreground` | `canvas` / `ink` |
| `--card` / `--card-foreground` | `surface-1` / `ink` |
| `--popover` / `--popover-foreground` | `canvas` (light) · `surface-2` (dark) / `ink` |
| `--primary` / `--primary-foreground` | `ink` / `on-ink` |
| `--secondary` / `--secondary-foreground` | `surface-1` / `ink` |
| `--muted` / `--muted-foreground` | `surface-1` / `ink-subtle` |
| `--accent` / `--accent-foreground` | `surface-2` / `ink` *(shadcn "accent" = hover fill, not the brand color)* |
| `--destructive` | `danger` |
| `--border` / `--input` | `hairline` / `hairline` |
| `--ring` | `brand` |
| `--chart-1` | `brand` |

### 2.4 Contrast (WCAG AA)
| Pair | Light | Dark |
|---|---|---|
| `ink` on `canvas` | 19.7 : 1 | 18.7 : 1 |
| `ink-muted` on `canvas` | 11.2 : 1 | 13.6 : 1 |
| `ink-subtle` on `canvas` | 5.0 : 1 | 6.1 : 1 |
| `ink-subtle` on `surface-1` | 4.7 : 1 | 5.9 : 1 |
| `brand` on `canvas` (links) | 4.7 : 1 | 6.1 : 1 |
| `danger` on `canvas` | 4.7 : 1 | 5.9 : 1 |
`ink-tertiary` is for disabled/decorative text only (exempt).

## 3. Typography

### 3.1 Families
| Role | Family | Fallback | Weights |
|---|---|---|---|
| `sans` (UI, headings) | **Inter** (variable) | `system-ui, -apple-system, Segoe UI, Roboto, sans-serif` | 400, 500, 600 |
| `serif` (reading) | **Source Serif 4** (variable, optical sizing) | `Georgia, serif` | 400, 600, italic 400 |
| `mono` (code) | **JetBrains Mono** | `ui-monospace, SFMono-Regular, Menlo, monospace` | 400, 500 |
Loaded with `next/font/google`, `display: swap`.

### 3.2 Scale
| Token | Family | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-lg` | sans | 48 / 1.08 | 600 | -1.6px | Blog title (reader, editor title input) |
| `display-md` | sans | 36 / 1.12 | 600 | -1.0px | Section heads, 404 |
| `display-sm` | sans | 28 / 1.2 | 600 | -0.6px | Search query heading |
| `headline` | sans | 24 / 1.25 | 600 | -0.4px | Auth card titles, dialog titles |
| `title-lg` | sans | 20 / 1.3 | 600 | -0.3px | BlogListItem title, ProfileCard username |
| `title` | sans | 17 / 1.35 | 600 | -0.2px | Dashboard row title, stat numbers |
| `title-sm` | sans | 15 / 1.4 | 500 | -0.1px | Page titles in dashboard, side-nav section labels |
| `body` | sans | 15 / 1.55 | 400 | 0 | Default UI text |
| `body-sm` | sans | 14 / 1.5 | 400 | 0 | Meta lines, nav items, table cells |
| `caption` | sans | 12 / 1.4 | 400 | 0 | Helper/error text, counters, stat labels |
| `label` | sans | 14 / 1.2 | 500 | 0 | Buttons, chips, tabs |
| `eyebrow` | sans | 12 / 1.3 | 500 | +0.4px, uppercase | Section eyebrows ("Related reading") |
| `reading-body` | serif | 20 / 1.75 (mobile 18 / 1.7) | 400 | 0 | Blog paragraphs, lists, quotes |
| `reading-lead` | serif | 22 / 1.5 (mobile 19) | 400 | 0 | Blog description under title |
| `reading-sm` | serif | 17 / 1.55 | 400 | 0 | Feed descriptions, comment bodies |
| `reading-h2` | sans | 30 / 1.25 | 600 | -0.6px | Header block level 2 |
| `reading-h3` | sans | 24 / 1.3 | 600 | -0.4px | Header block level 3 |
| `reading-h4` | sans | 20 / 1.35 | 600 | -0.2px | Header block level 4 |
| `code` | mono | 14 / 1.6 | 400 | 0 | Code blocks, inline code (0.9em) |

Mobile (< 768 px): `display-lg` → 34/1.12, `display-md` → 28, `display-sm` → 24.

## 4. Spacing, layout, radius

**Spacing** (4 px base): `0.5`=2 · `1`=4 · `2`=8 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 · `16`=64 · `24`=96.
- Card padding 20–24 · list item vertical padding 24 · section gap 64 (mobile 48) · form field gap 16.

**Layout**: `container-wide` 1200 · `container-read` 720 · side gutters 16/24/32 · navbar 64 · editor bar 64 · side-nav 240 · right rail 320.

**Radius**
| Token | Value | Use |
|---|---|---|
| `radius-xs` | 4 px | Inline code, badges |
| `radius-sm` | 6 px | Quote boxes, tooltips |
| `radius-md` | 8 px | Inputs, textareas, thumbnails, menus |
| `radius-lg` | 12 px | Cards, banners, dialogs, code blocks |
| `radius-xl` | 16 px | Featured cards, publish-panel preview |
| `radius-pill` | 9999 px | Buttons, chips, search input, tabs-as-filters |
| `radius-full` | 50 % | Avatars, icon buttons |

## 5. Elevation & motion

| Level | Light | Dark | Use |
|---|---|---|---|
| 0 | none | none | Page content |
| 1 | `surface-1` + 1 px `hairline` | same | Cards, inputs |
| 2 | `canvas` + 1 px `hairline` + `0 8px 24px -8px rgba(0,0,0,.12)` | `surface-2` + 1 px `hairline-strong`, no shadow | Popovers, menus, toasts |
| 3 | `canvas` + `0 24px 64px -16px rgba(0,0,0,.24)` | `surface-1` + 1 px `hairline-strong` | Dialogs |
| Focus | 2 px `brand` ring, 2 px offset (`canvas`) | same | All focusable elements |

**Motion**: `fast` 120 ms (hover, press) · `base` 180 ms (menus, tabs) · `slow` 240 ms (dialogs, sheets). Easing `cubic-bezier(.2,.8,.2,1)`. All reduced to opacity-only under `prefers-reduced-motion`.

## 6. Iconography & imagery
- **Icons:** Lucide, 18 px in UI (16 in dense rows, 20 in interaction bar), stroke 1.75, color `ink-subtle` → `ink` on hover. Social brand icons from `simple-icons` rendered monochrome.
- **Logo:** the "b" mark (single-color, `ink`) + lowercase wordmark "byline" in Inter 600, -0.5px. Mark alone at ≤ 32 px. Min clear space = ½ mark height.
- **Banners:** 16:9, `object-fit: cover`, `radius-lg`, 1 px `hairline` inset border so white images keep an edge.
- **Avatars:** circle; sizes `xs` 20 · `sm` 24 · `md` 32 · `lg` 40 · `xl` 48 · `2xl` 96 · `3xl` 160. Fallback = initials on `surface-2`, `ink-subtle`.

## 7. Components

> Names match [UI & UX Spec](04-UI-UX-SPEC.md). shadcn base noted in brackets.

### 7.1 Button [shadcn `button`]
| Variant | Fill | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `ink` | `on-ink` | — | opacity 88 % |
| `secondary` | `surface-1` | `ink` | 1 px `hairline` | `surface-2` |
| `ghost` | transparent | `ink-muted` | — | `surface-1`, text `ink` |
| `outline` | transparent | `ink` | 1 px `hairline-strong` | `surface-1` |
| `destructive` | `danger` | `#FFFFFF` | — | opacity 90 % |
| `link` | — | `brand` | — | underline |
Sizes: `sm` h32 px-12 · `md` h40 px-16 (default) · `lg` h48 px-24. All `radius-pill`, `label` type, icon gap 8. Disabled: 40 % opacity. Loading: spinner replaces leading icon.

### 7.2 IconButton
Circle, `sm` 32 · `md` 40; ghost style; `surface-1` fill variant (navbar bell). Requires `aria-label`.

### 7.3 Input / Textarea / SearchInput [shadcn `input`, `textarea`]
- `Input`: h44, `surface-1` fill, no border at rest, `radius-md`, padding 0 14, optional leading icon (18, `ink-subtle`) + trailing action (show/hide). Hover border `hairline-strong`. Focus: focus ring. Error: 1 px `danger` border + `caption` message below. Read-only: `ink-subtle` text.
- `Textarea`: same, min-height 120, counter `caption` "N characters left" below-left.
- `SearchInput`: h40, `radius-pill`, `surface-1`, leading search icon, `/` shortcut hint chip on desktop.

### 7.4 Chips
- `TopicChip`: h32 px-14, `surface-2`, `ink`, `label`; link to topic. Removable variant with × (publish panel, search filter).
- `FilterChip`: h40 px-20 pill; default `surface-1`/`ink`; selected `ink`/`on-ink`.
- `Badge`: h20 px-8, `radius-xs`, `caption` 500; variants `neutral` (`surface-2`/`ink-subtle`), `brand` (`brand-subtle`/`brand`).

### 7.5 Tabs [shadcn `tabs`]
Underline style: `label`, `ink-subtle` → active `ink` with 2 px `ink` underline; row has 1 px `hairline` bottom. Used: Home (Latest/Trending), Search, Manage Blogs, Profile.

### 7.6 Avatar, AvatarMenu, UnreadDot
- `Avatar` sizes §6. `DropdownMenu` [shadcn `dropdown-menu`]: elevation 2, items h36 `body-sm`, icon 16 + label, destructive item in `danger`. `AvatarMenu` = `DropdownMenu` elevation 2, width 240, items h36 `body-sm`.
- `UnreadDot`: 8 px `brand` circle, 2 px `canvas` ring when on an icon.

### 7.7 Navigation
- `Navbar`, `SideNav`, `DashboardShell`, `EditorBar` — layout in UI spec §2. SideNav item: h44, px-24, icon 16 + `body-sm`; active `surface-1` + 2 px right border `ink`.

### 7.8 Cards & lists
- `Card`: `surface-1`, 1 px `hairline`, `radius-lg`, padding 24.
- `BlogListItem`: no card; vertical padding 24; bottom `hairline`. Meta row (`Avatar sm`, `body-sm` name, `ink-subtle` @username · date) → title `title-lg` → description `reading-sm` `ink-subtle` 2-line clamp → footer (`TopicChip`, ♡ count, read time). Thumbnail 120×120 (mobile 80×80) `radius-md`, right. Hover: title underline.
- `BlogGridCard` (featured/related): `surface-1` card `radius-xl`, padding 12, image 16:9 `radius-lg`, meta `caption` "Jun 18, 2026 · Planning · 6 min read", title `title`, description `body-sm` `ink-subtle`.
- `UserListItem`: avatar `xl`, name `title`, @username `body-sm` `ink-subtle`, bio 1 line, `Button/secondary sm` Subscribe.
- `DashboardBlogRow`, `StatGroup` (number `title`, label `caption`, separated by `hairline` verticals), `StatCard` (`Card` with `caption` label + `display-sm` number).
- `ProfileCard`, `SocialLinks` (IconButton ghost row), `AuthorRow`, `AuthCard` (`Card`, padding 32, width 400).

### 7.9 Blog interactions
- `InteractionBar`: hairlines top & bottom, h56, items gap 24: `LikeButton`, comment count (anchor to comments), `ShareMenu` trigger right-aligned.
- `LikeButton`: heart 20; inactive `ink-subtle`; active filled `like`; count `body-sm`.
- `ShareMenu` [shadcn `dropdown-menu`]: items Copy link · X · Facebook · LinkedIn · WhatsApp · Email with icons.
- `CommentComposer`, `CommentItem` — UI spec S-03. Reply indent 44 px with 1 px `hairline` left rule.
- `NotificationItem` — UI spec S-13; quote box `surface-1` `radius-sm` padding 12–16.

### 7.10 Overlays
- `Dialog` [shadcn `dialog`]: elevation 3, `radius-lg`, width 440, padding 24, title `headline`.
- `PublishPanel`: full-screen `Dialog` variant, `canvas`, close IconButton top-right.
- `AvatarCropDialog`: 1:1 crop area 320, zoom slider, Cancel / Save.
- `Toast` [sonner]: elevation 2, `radius-lg`, `body-sm`, leading status icon.
- `Tooltip`: `ink` fill, `on-ink` text, `caption`, `radius-sm`.

### 7.11 Feedback
- `Skeleton`: `surface-2` with 1.2 s shimmer (`surface-3`), radii match target.
- `EmptyState`: centered icon 32 in `surface-1` circle 64, `title`, `body-sm` `ink-subtle`, optional button.
- `ProgressBar`: h4 `surface-2` track, `ink` fill (`brand` while uploading banner).

### 7.12 Editor & BlockRenderer
Editor and reader share these styles (`.prose-byline`), so the preview is exact.
| Block | Style |
|---|---|
| paragraph | `reading-body`, `ink-muted`, margin-bottom 24 |
| header 2/3/4 | `reading-h2/h3/h4`, `ink`, margin-top 48/40/32, bottom 16 |
| list (ordered/unordered) | `reading-body`, padding-left 28, item gap 8, markers `ink-subtle` |
| list (checklist) | 20 px checkbox, `radius-xs`, checked = `ink` fill + `on-ink` check, label `reading-body` |
| image | full column width, `radius-lg`; caption `caption` `ink-subtle` centered, margin-top 8 |
| code | `surface-1`, 1 px `hairline`, `radius-lg`, padding 20, `code` type, horizontal scroll; header row with Copy `IconButton sm` |
| inline code | `surface-2`, `radius-xs`, padding 2 6, `code` 0.9em |
| quote | 3 px left border `ink`, padding-left 20, `reading-body` italic; caption `body-sm` `ink-subtle` "— author" |
| delimiter | three 4 px dots `ink-tertiary`, centered, margin 48 |
| table | `body-sm`, header row `title-sm` with bottom `hairline-strong`, rows bottom `hairline`, cell padding 12 |
| embed | 16:9 iframe `radius-lg`, caption as image |
| marker | `brand-subtle` background |
| link | `brand`, underline offset 3 |
Editor-only: toolbox / inline toolbar / conversion popovers use elevation 2; block-settings button `ink-subtle`; placeholder `ink-tertiary`; selected block `brand-subtle` background.

### 7.13 Charts (stats page)
Single series line: `brand` 2 px, area fill `brand` at 8 %, grid `hairline`, axis labels `caption` `ink-subtle`. Bar list: track `surface-2`, bar `ink`, value `body-sm`.

## 8. Tailwind v4 theme (excerpt)
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-serif: var(--font-source-serif), Georgia, serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
  --color-canvas: var(--canvas);      --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2); --color-surface-3: var(--surface-3);
  --color-hairline: var(--hairline);  --color-hairline-strong: var(--hairline-strong);
  --color-ink: var(--ink);            --color-ink-muted: var(--ink-muted);
  --color-ink-subtle: var(--ink-subtle); --color-ink-tertiary: var(--ink-tertiary);
  --color-on-ink: var(--on-ink);      --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover); --color-brand-subtle: var(--brand-subtle);
  --color-success: var(--success);    --color-warning: var(--warning);
  --color-danger: var(--danger);      --color-like: var(--like);
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
}

:root {
  --canvas:#FFFFFF; --surface-1:#F7F7F8; --surface-2:#EFEFF1; --surface-3:#E6E6E9;
  --hairline:#ECECEE; --hairline-strong:#D9D9DE;
  --ink:#0B0B0C; --ink-muted:#3A3B40; --ink-subtle:#6B6F76; --ink-tertiary:#9A9EA6; --on-ink:#FFFFFF;
  --brand:#5E6AD2; --brand-hover:#4C57C4; --brand-subtle:#EEF0FB;
  --success:#1F8A3B; --warning:#B26B00; --danger:#D93036; --like:#E5484D;
}
.dark {
  --canvas:#08090A; --surface-1:#0F1011; --surface-2:#161718; --surface-3:#1D1E20;
  --hairline:#23252A; --hairline-strong:#34343A;
  --ink:#F7F8F8; --ink-muted:#D0D6E0; --ink-subtle:#8A8F98; --ink-tertiary:#62666D; --on-ink:#08090A;
  --brand:#7C86E8; --brand-hover:#959EF0; --brand-subtle:#1A1C2E;
  --success:#3DBE5E; --warning:#F5A524; --danger:#F2555A; --like:#F2555A;
}
```
Theme switching: `next-themes` with `attribute="class"`, `defaultTheme="system"`.

## 9. Do & don't
| Do | Don't |
|---|---|
| Use `ink` pill buttons for the single primary action | Use `brand` as a button or section fill |
| Separate sections with surface lift or hairlines | Add drop shadows to cards |
| Use serif only for reading content | Set UI labels, buttons or nav in serif |
| Keep thumbnails square in lists, 16:9 in cards | Crop banners to other ratios |
| Show counts with compact format (1.2k) | Use a second accent color for categories/topics |
