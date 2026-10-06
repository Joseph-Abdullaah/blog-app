# Byline — UI & UX Specification

| | |
|---|---|
| Version | 1.0 |
| Based on | [PRD](01-PRD.md) · [SRS](02-SRS.md) · [User Flow](03-USER-FLOW.md) |
| Visual language | [Design System](05-DESIGN-SYSTEM.md) — component names below are design-system components |
| Data | DTO names from [API Spec](08-API-SPEC.md) |

---

## 1. UX principles

1. **Reading first.** Content column ≤ 720 px, serif body, no sidebars on the reader page.
2. **Quiet chrome.** Monochrome UI; the brand accent (`brand`) only marks focus, links, active state and unread dots.
3. **One primary action per screen.** It is the `Button/primary` (inverse pill).
4. **Optimistic & forgiving.** Likes, subscribes and read-marks update instantly; destructive actions always confirm.
5. **Same in both themes.** Every screen ships light and dark (system default; toggle in avatar menu).

## 2. Global layout

### 2.1 Navbar (`Navbar`) — all screens except S-09, S-10
| Zone | Guest | Member |
|---|---|---|
| Left | Logo mark + "byline" wordmark → `/` · `SearchInput` (pill, 320 px) | same |
| Right | `Button/ghost` "Write" (→ sign in) · `Button/primary` "Sign in" | `Button/ghost` "Write" (pen icon) · `IconButton` bell with `UnreadDot` · `Avatar` 36 px → `AvatarMenu` |

Height 64 px, bottom `hairline` border, sticky, `canvas` background at 85 % + backdrop blur 12 px.

**AvatarMenu** (`DropdownMenu`): header (name, @username) · Profile · Dashboard · Write · Settings · Theme (System / Light / Dark radio) · separator · Sign out.

**Mobile (< 768 px):** Search collapses to an `IconButton` that opens a full-width search sheet; "Write" becomes an icon.

### 2.2 Dashboard shell (`DashboardShell`) — S-11, S-12, S-13, S-14, S-15
Left `SideNav` 240 px (reference: user's dashboard screenshots):
```
Dashboard
  Blogs            → /dashboard/blogs
  Notifications    → /dashboard/notifications   (UnreadDot when unread)
  Write            → /editor
Settings
  Edit Profile     → /settings/profile
  Change Password  → /settings/password
```
Active item: `surface-1` background + 2 px right border `ink`. Section labels use `title-sm` in `ink`; group divider `hairline`.
**Mobile:** SideNav becomes a horizontal scrollable `Tabs` row under the navbar.

### 2.3 Containers
| Container | Max width | Used by |
|---|---|---|
| `container-wide` | 1200 px | Home, Search, Profile, Dashboard |
| `container-read` | 720 px | Reader, Editor, Preview |
| Side gutter | 16 px mobile · 24 px tablet · 32 px desktop | all |

### 2.4 Feedback
- **Toasts** (`Toast`, sonner): top-center, 3 s, success icon in `success`. Messages used: "Draft saved", "Published", "Updated", "Blog deleted", "Link copied", "Profile updated", "Password changed", "Welcome to Byline", "Something went wrong. Try again."
- **Loading:** `Skeleton` matching final layout (never spinners for page loads). Buttons show inline spinner + disabled during submit.
- **Errors:** inline under fields (`danger`, `caption`); page-level errors show `EmptyState` with "Try again".

## 3. Screens

### S-01 Home `/`
```
┌ Navbar ───────────────────────────────────────────────────────────┐
│ [Latest] [Trending]                          (Tabs, underline)    │
│ ( All )( Travel )( Food )( Tech )…           TopicChip row, scroll│
├──────────────────────────────────────────────┬────────────────────┤
│ BlogListItem                                 │ Trending           │
│  avatar · name @username · 27 Sep            │ 01 title           │
│  Title (title-lg)                    [thumb] │    author · date   │
│  description (reading-sm, 2 lines)   120×120 │ 02 …  (5 items)    │
│  (Travel)  ♡ 12  · 4 min read                │────────────────────│
│ ──────────────────────────────────────────── │ Popular topics     │
│ BlogListItem …                               │ (chips, 10)        │
└──────────────────────────────────────────────┴────────────────────┘
```
- Data: `E8` (feed), `E8 sort=trending limit=5` (sidebar), `E26` (topics).
- Right column 320 px; hidden < 1024 px (topics move to the chip row only).
- States: loading = 5 `BlogListItem` skeletons · empty (topic has no blogs) = `EmptyState` "No blogs in {topic} yet".
- Infinite scroll; "Back to top" `IconButton` after 2 pages.

### S-02 Search `/search?q=&tab=&topic=`
- Heading: `eyebrow` "Search results" + `display-sm` "“{q}”".
- `Tabs`: Blogs · Users.
- Blogs tab: `BlogListItem` list; active topic filter shows as removable `TopicChip` (×).
- Users tab: `UserListItem` (avatar 48, name, @username, bio 1 line, `Subscribe` button).
- Empty: "No results for “{q}”" + popular topics.

### S-03 Blog reader `/blog/[slug]`
```
container-read
  BlogBanner (16:9, radius lg)
  Title (display-lg)
  Description (reading-lead, ink-subtle)
  AuthorRow: Avatar 40 · name / @username · date · N min read · [Subscribe] | Author: [Edit]
  ─ InteractionBar (♡ n · 💬 n · ↗ Share) ─
  BlockRenderer (reading-body)
  TopicChips
  ─ InteractionBar ─
  CommentsSection
```
- `BlockRenderer` styles per block — see Design System §7.12.
- `InteractionBar` is sticky at bottom on mobile (56 px, `surface-1`).
- Comments: `CommentComposer` (textarea, counter /1000, `Button/primary` "Comment"), list of `CommentItem` (avatar 32, name @username · relative time, body in `reading-sm`, actions Reply · Delete); replies indented 44 px with left `hairline` rule; "View N replies" link; "Load more comments".
- Metadata: OG + Twitter tags (FR-READ-03).

### S-04 Profile `/u/[username]` (reference: user's profile screenshot)
- Two columns: left = `Tabs` "Blogs Published" + `BlogListItem` list; right = 320 px `ProfileCard` (avatar 96, @username `title-lg`, name, "N Blogs · N Reads · N Subscribers", bio, `SocialLinks` icons, "Joined on 27 Sep 2023", `Subscribe` / `Edit profile` if self).
- Mobile: ProfileCard first, centered.
- 404 if username not found.

### S-05 Sign in `/sign-in` · S-06 Sign up `/sign-up`
- Centered `AuthCard` 400 px on `canvas`; logo mark 40 px on top; title `headline` "Welcome back" / "Join Byline".
- Fields (`Input` with leading icon): [Name] · Email · Password (with show/hide `IconButton`).
- `Button/primary` full width; divider "or"; `Button/secondary` "Continue with Google".
- Footer link: "Don't have an account? Sign up" / "Already have an account? Sign in". Sign in also shows "Forgot password?".

### S-07 Forgot password · S-08 Reset password
Same `AuthCard`. S-07: email → "Send reset link" → success state message. S-08: new + confirm password → "Reset password"; expired state per flow 1.3.

### S-09 Editor `/editor`, `/editor/[blogId]` (reference: user's editor screenshot)
```
EditorBar (64px):  [logo] "New Blog"/title (truncated) · Saved · 14:02 ·  [Preview] [Save Draft] [Publish]
container-read:
  BannerUpload (16:9, dashed hairline-strong, "Blog Banner" + "Click or drop an image")
  TitleInput  (display-lg, placeholder "Blog Title", auto-grow, 120 max)
  hairline
  Editor.js canvas (placeholder "Let's write an awesome story!")
```
- Buttons: `Preview` = `Button/ghost`, `Save Draft` = `Button/secondary`, `Publish` = `Button/primary`. Published blog: `Preview` + `Update` only.
- BannerUpload states: empty · dragging (border `brand`) · uploading (progress bar) · filled (image + hover overlay with "Replace" / "Remove") · error (`danger` caption).
- Editor.js toolbox and inline toolbar themed via CSS (`surface-2` popovers, `hairline-strong` border, radius md).
- Preview mode: same container renders S-03 layout read-only; EditorBar shows `Back to editing` + `Publish`/`Update`.

### S-10 Publish panel (overlay on S-09)
```
┌──────────────────────────────────────────────────────────────── ✕ ┐
│ Preview                          │ Short description             │
│ ┌──────────────┐                 │ [textarea…]           142/200 │
│ │ banner 16:9  │                 │ Topics  (used for search)     │
│ └──────────────┘                 │ [ input, Enter to add ]       │
│ Title (title-lg)                 │ (Travel ×)(Food ×)   3/5      │
│ description (reading-sm)         │ [ Publish ]                   │
└──────────────────────────────────────────────────────────────────┘
```
- Full-screen `Dialog`, `canvas` background, two equal columns ≥ 1024 px, stacked below.
- Topic input: autocomplete popover of `E26` results; creating a new topic shows "Create “{name}”".

### S-11 Manage blogs `/dashboard/blogs` (reference: user's dashboard screenshot)
- Title `title-sm` "Manage Blogs"; `SearchInput` full width "Search blogs".
- `Tabs`: Published Blogs · Drafts.
- `DashboardBlogRow`: thumbnail 112×112 radius md · title `title` · "Published on 29 Sep, Friday" (`body-sm`, `ink-subtle`) · links Edit · Stats · Delete(`danger`) · `StatGroup` (Likes, Comments, Reads, Shares; numbers `title`, labels `caption`) separated by `hairline` verticals.
- Draft row: no StatGroup; label `Badge` "Draft"; "Last edited 2 h ago".
- Mobile: StatGroup wraps under content as 4-up grid.
- Empty: Published — "You haven't published anything yet" + `Write your first blog`; Drafts — "No drafts".

### S-12 Blog stats `/dashboard/blogs/[blogId]/stats`
- Breadcrumb "Blogs / {title}" + `View blog` link.
- 4 `StatCard`s (Reads, Likes, Comments, Shares).
- `Card` "Reads — last 30 days": line chart (single series, `brand` line, `hairline` grid).
- `Card` "Shares by channel": horizontal bar list per `ShareChannel` with icon + count.
- `Card` "Recent comments": `CommentItem` ×10 with Delete.

### S-13 Notifications `/dashboard/notifications` (reference: user's notifications screenshot)
- Title "Recent Notifications" + `Button/ghost` "Mark all as read".
- `FilterChip` row: All · Like · Comment · Reply · Share · Subscription (selected = inverse pill).
- Timeline: left 2 px `hairline-strong` rule; `NotificationItem`: avatar 44 · "**Name** @username {verb}" · target ("{blog title}" underlined) · comment text in quote box (`surface-1`, radius sm) · date · actions (Reply / Delete for comments on your blog). Unread: `brand` dot left of avatar + `surface-1` row background.
- Verbs: LIKE "liked your blog" · COMMENT "commented on" · REPLY "replied to your comment on" · SHARE "shared your blog" · SUBSCRIBE "subscribed to you" · NEW_BLOG "published".

### S-14 Edit profile `/settings/profile` (reference: user's edit profile screenshot)
- Left: avatar 160 + `Button/secondary` "Upload" (opens `AvatarCropDialog`).
- Right grid (2 cols ≥ 1024 px): Name (person icon) · Email (read-only, mail icon) · Username (@ icon, full width) + helper "Username is used to find you and appears on your profile" + availability state · Bio `Textarea` + "N characters left" · "Social links" label · 6 `Input`s with brand icons (YouTube, Instagram, Facebook, X, GitHub, Website) placeholder `https://`.
- `Button/primary` "Update".

### S-15 Change password `/settings/password` (reference: user's change password screenshot)
- Current password · New password (lock icon, show/hide) · `Button/primary` "Change Password"; width 460 px.

### S-16 Not found
Centered logo mark, `display-md` "Page not found", body "The page you’re looking for doesn’t exist or was moved.", `Button/primary` "Go home".

## 4. Interaction details
| Element | Behavior |
|---|---|
| LikeButton | 150 ms scale 1 → 1.2 → 1 on like (disabled with reduced motion); filled `like` color |
| Subscribe | `Button/primary` "Subscribe" → `Button/secondary` "Subscribed"; hover shows "Unsubscribe" |
| Counters | Compact format: 1.2k, 3.4M |
| Dates | < 7 days: relative ("2h", "3d"); else "27 Sep" (same year) / "27 Sep 2025" |
| Confirm dialogs | Title, one sentence, `Cancel` (secondary) + destructive `Button/destructive` |
| Keyboard | `/` focuses search · `Ctrl/⌘+S` Save Draft in editor · `Esc` closes dialogs/panel |

## 5. Responsive breakpoints
| Name | Min width | Changes |
|---|---|---|
| base | 0 | single column, mobile nav, sticky interaction bar |
| `md` | 768 px | navbar search visible, dashboard SideNav visible |
| `lg` | 1024 px | home & profile right column, publish panel 2-col |
| `xl` | 1280 px | max container widths reached |

## 6. Accessibility checklist
All icon buttons have `aria-label` · focus ring 2 px `brand` + 2 px offset · tabs/menus via Radix (shadcn) semantics · images require alt (Editor.js caption → alt, banner alt = title) · color never the only signal (unread = dot + bold) · contrast verified in both themes (Design System §2.4).
