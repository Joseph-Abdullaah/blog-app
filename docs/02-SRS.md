# Byline — Software Requirements Specification (SRS)

| | |
|---|---|
| Version | 1.0 |
| Based on | [PRD](01-PRD.md) v1.0 |
| Conventions | "shall" = mandatory. IDs are referenced by the [API spec](08-API-SPEC.md) and tests. |

---

## 1. Introduction

### 1.1 Purpose
Defines the functional and non-functional requirements of Byline v1 precisely enough to build and test against.

### 1.2 Scope
A web application (responsive, desktop + mobile browsers) built with Next.js (App Router) providing both the UI and the backend API (Route Handlers), Better Auth for authentication, Prisma + PostgreSQL (Neon) for persistence and Editor.js for blog content. See [Tech Stack](09-TECH-STACK.md).

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Blog | A piece of content with banner, title, description, topics and Editor.js content; status `DRAFT` or `PUBLISHED`. |
| Draft | Blog with status `DRAFT`; visible only to its Author. |
| Visitor ID | Random UUID stored in an httpOnly cookie `bl_vid` (1 year) identifying a browser for read de-duplication. |
| Block | One Editor.js block (`{ id, type, data }`). |
| Slug | URL identifier of a published blog: `kebab-case(title)` (max 80 chars) + `-` + 6 random lowercase alphanumerics. |

### 1.4 Roles
Guest, Member, Author — see [README](00-README.md#roles).

## 2. Overall description

### 2.1 System context
```
Browser ──HTTPS──> Next.js on Vercel ──> Neon PostgreSQL (Prisma)
                         │   ├──> Vercel Blob (images)
                         │   ├──> Upstash Redis (rate limits)
                         │   └──> Resend (password reset email)
                         └── Better Auth (sessions in PostgreSQL, Google OAuth)
```

### 2.2 Constraints
- C-01 Tech stack fixed as in [Tech Stack](09-TECH-STACK.md).
- C-02 All API input validated with shared Zod schemas; same schemas validate forms client-side.
- C-03 Ids are strings (cuid for app tables, Better Auth-generated for auth tables).
- C-04 All timestamps stored in UTC; displayed in the viewer's local time zone.

## 3. Functional requirements

### 3.1 Authentication (F-01)
| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall allow sign up with name (1–50), email (unique, valid) and password (8–128). |
| FR-AUTH-02 | On sign up the system shall generate a unique username from the email local part (lowercased, invalid chars removed, padded/truncated to 3–30, numeric suffix on collision). |
| FR-AUTH-03 | The system shall allow sign in with email + password and with Google OAuth. A Google sign-in with an existing email links to that account. |
| FR-AUTH-04 | Failed sign in shall return a generic error ("Email or password is incorrect"). |
| FR-AUTH-05 | Sessions shall last 30 days, refreshed when used after 1 day, stored in the `session` table, cookie httpOnly + Secure + SameSite=Lax. |
| FR-AUTH-06 | The system shall send a password-reset link valid for 1 hour; using it sets a new password and revokes all sessions. |
| FR-AUTH-07 | Sign out shall revoke the current session. |
| FR-AUTH-08 | Guest-only routes (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`) shall redirect signed-in users to `/`. Member routes shall redirect Guests to `/sign-in?callbackUrl=<route>`. |

### 3.2 Profile & settings (F-02, F-14)
| ID | Requirement |
|---|---|
| FR-PROF-01 | A Member shall be able to update name, username, bio and social links (`youtube`, `instagram`, `facebook`, `twitter`, `github`, `website`). |
| FR-PROF-02 | Username shall match `^[a-z0-9_]{3,30}$`, be unique, and not be reserved (`me`, `admin`, `api`, `blog`, `u`, `editor`, `dashboard`, `settings`, `search`, `sign-in`, `sign-up`, `byline`). |
| FR-PROF-03 | The system shall expose a username availability check (debounced 400 ms in the UI). |
| FR-PROF-04 | A Member shall be able to upload an avatar (JPG/PNG/WebP ≤ 2 MB); the client crops to a square and uploads at 400×400. |
| FR-PROF-05 | Change password shall require the current password, enforce 8–128 chars, and revoke all other sessions. Members without a password (Google-only) shall see "Your account uses Google sign-in" and a "Set password" link to `/forgot-password`. |
| FR-PROF-06 | The public profile shall show avatar, name, @username, bio, social icons (only filled ones), joined date, stats (published blogs, total reads, subscribers) and published blogs (newest first, paginated). |

### 3.3 Editor & drafts (F-03)
| ID | Requirement |
|---|---|
| FR-EDIT-01 | `/editor` shall show an empty editor; the blog row is created on first **Save Draft** (or autosave) via create-draft, after which the URL is replaced with `/editor/[blogId]`. |
| FR-EDIT-02 | The editor shall provide the tools: Header (levels 2–4), Paragraph, List (ordered/unordered/checklist), Image, Code, Quote, Delimiter, Table, Embed (YouTube, X, CodePen), InlineCode, Marker, plus built-in bold/italic/link. |
| FR-EDIT-03 | The Image tool shall upload via the editor upload endpoints and accept JPG/PNG/WebP/GIF ≤ 5 MB, or an image URL. |
| FR-EDIT-04 | The banner area shall accept JPG/PNG/WebP ≤ 5 MB (purpose `banner`), show upload progress, and allow replace/remove. |
| FR-EDIT-05 | **Save Draft** shall persist title (0–120), description (0–200), banner, topics (0–5) and content without further validation and show the toast "Draft saved". |
| FR-EDIT-06 | (Should) The editor shall autosave every 30 s when there are unsaved changes and show "Saved · hh:mm" in the editor bar. |
| FR-EDIT-07 | Leaving the editor with unsaved changes shall prompt "Discard unsaved changes?". |
| FR-EDIT-08 | Only the Author may open `/editor/[blogId]`; others receive the 404 page. |
| FR-EDIT-09 | For a published blog the editor bar shows **Preview** and **Update** (no **Save Draft**) and autosave is disabled; edits go live only through the publish panel. |

### 3.4 Preview & publish (F-04)
| ID | Requirement |
|---|---|
| FR-PUB-01 | **Preview** shall render the blog exactly as the reader page would (read-only, interaction bar disabled). |
| FR-PUB-02 | **Publish** (or **Update** for published blogs) shall open the publish panel with preview card, description field (counter /200), topics input (1–5, autocomplete) and a confirm button. |
| FR-PUB-03 | Publishing shall validate: banner present; title 3–120; description 1–200; topics 1–5, each 2–30 chars `^[A-Za-z0-9 -]+$`; ≥ 1 non-empty block; content ≤ 500 KB. Violations are shown inline per field. |
| FR-PUB-04 | Topics shall be normalized: trimmed, internal whitespace collapsed; `slug` = lowercase kebab-case; existing topic matched by slug, otherwise created. |
| FR-PUB-05 | On first publish the system shall set `status=PUBLISHED`, `publishedAt=now`, generate the slug, compute `readTimeMinutes`, and create `NEW_BLOG` notifications for all subscribers of the Author. |
| FR-PUB-06 | Updating a published blog shall keep `slug` and `publishedAt`, recompute `readTimeMinutes`, and not create `NEW_BLOG` notifications. |
| FR-PUB-07 | After publish/update the user shall be redirected to `/blog/[slug]` with the toast "Published" / "Updated". |
| FR-PUB-08 | Publish and Update send all blog fields in one request and are saved + published in a single transaction (a blog is never half-updated). |

### 3.5 Reading (F-05, F-09)
| ID | Requirement |
|---|---|
| FR-READ-01 | `/blog/[slug]` shall be server-rendered for published blogs; unknown slugs and drafts return the 404 page. |
| FR-READ-02 | Blocks shall render through a React block renderer (no raw HTML injection); inline formatting is sanitized with an allow-list (`b`, `i`, `a[href]`, `code`, `mark`, `br`). Links open in a new tab with `rel="noopener noreferrer nofollow"`. |
| FR-READ-03 | The page shall include Open Graph and Twitter card meta (title, description, banner). |
| FR-READ-04 | The client shall record a read after the page has been visible for 10 s. The server shall ignore it if the viewer is the Author or if a read exists for the same `(blogId, visitorId)` within 24 h; otherwise it creates a `Read` and increments `readsCount`. |

### 3.6 Likes (F-06)
| ID | Requirement |
|---|---|
| FR-LIKE-01 | A Member shall be able to like/unlike a published blog; like and unlike are idempotent. |
| FR-LIKE-02 | Like shall create a `Like`, increment `likesCount` and create a `LIKE` notification (unless the liker is the Author — who cannot like their own blog; returns 403). Unlike reverses all three. |
| FR-LIKE-03 | Guests pressing Like shall be sent to `/sign-in?callbackUrl=/blog/[slug]`. |

### 3.7 Comments & replies (F-07)
| ID | Requirement |
|---|---|
| FR-CMT-01 | A Member shall be able to comment (1–1000 chars) on a published blog; creates `COMMENT` notification for the Author (unless self). |
| FR-CMT-02 | A Member shall be able to reply to a top-level comment. Replying to a reply attaches the new reply to the top-level parent (one level deep). Creates a `REPLY` notification for the parent comment's author (unless self). |
| FR-CMT-03 | Top-level comments list newest first, 10 per page; replies list oldest first, 10 per page. |
| FR-CMT-04 | A comment may be deleted by its author or by the blog's Author. Deletion removes its replies and related notifications and decrements `commentsCount` by 1 + number of replies. |
| FR-CMT-05 | `commentsCount` counts top-level comments and replies. |

### 3.8 Shares (F-08)
| ID | Requirement |
|---|---|
| FR-SHR-01 | The share menu shall offer `COPY_LINK`, `X`, `FACEBOOK`, `LINKEDIN`, `WHATSAPP`, `EMAIL`, using standard share URLs with the blog URL and title. |
| FR-SHR-02 | Each share action shall create a `Share` (with `userId` if signed in, `visitorId` always) and increment `sharesCount`. |
| FR-SHR-03 | A `SHARE` notification is created only if the sharer is signed in, is not the Author, and no `SHARE` notification exists for the same actor and blog within 24 h. |

### 3.9 Search & topics (F-10)
| ID | Requirement |
|---|---|
| FR-SRCH-01 | Search `type=blogs` shall match published blogs whose title or description contains `q` (case-insensitive) or that have a topic whose name contains `q`; ordered by trigram similarity on title, then `publishedAt` desc. |
| FR-SRCH-02 | Search `type=users` shall match users whose name or username contains `q`; ordered by similarity. |
| FR-SRCH-03 | `q` shall be 1–100 chars after trim; optional `topic` (slug) filters blog results. |
| FR-SRCH-04 | The topics endpoint shall return topics matching `q` (autocomplete) or, without `q`, the 10 topics with the most published blogs. |
| FR-SRCH-05 | The home feed shall support `sort=latest` (publishedAt desc) and `sort=trending` (trending score, last 30 days) and an optional `topic` filter. |

### 3.10 Subscriptions (F-11)
| ID | Requirement |
|---|---|
| FR-SUB-01 | A Member shall be able to subscribe/unsubscribe to another user (idempotent). Subscribing to self returns 403. |
| FR-SUB-02 | Subscribing creates a `SUBSCRIBE` notification for the author; unsubscribing deletes it if still unread. |

### 3.11 Notifications (F-12)
| ID | Requirement |
|---|---|
| FR-NOTF-01 | Notifications are created per the trigger table in the PRD (§5 F-12) and never for actions on one's own content. |
| FR-NOTF-02 | The list shall be newest first, 10 per page, filterable by `all`, `like`, `comment`, `reply`, `share`, `subscription`. |
| FR-NOTF-03 | The navbar shall show the unread count (polled every 30 s and on window focus); "99+" above 99. |
| FR-NOTF-04 | A notification is marked read when clicked; "Mark all as read" marks all of the Member's notifications. |
| FR-NOTF-05 | Deleting a blog or comment deletes notifications referencing it. |

### 3.12 Dashboard & stats (F-13)
| ID | Requirement |
|---|---|
| FR-DASH-01 | `/dashboard/blogs` shall list the Member's blogs by tab (`published` sorted by publishedAt desc, `drafts` sorted by updatedAt desc) with optional title search `q`. |
| FR-DASH-02 | Each published row shows likes, comments, reads, shares and actions Edit, Stats, Delete; draft rows show Edit, Delete. |
| FR-DASH-03 | Delete shall require confirmation and permanently remove the blog and all likes, comments, reads, shares, topic links and notifications referencing it. Orphaned topics are kept. |
| FR-DASH-04 | Stats shall show totals (reads, likes, comments, shares), reads per day for the last 30 days (zero-filled), shares grouped by channel, and the 10 most recent comments with delete. |

## 4. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-PERF-01 | Performance | p75 LCP < 2.5 s and CLS < 0.1 on `/` and `/blog/[slug]` (mobile, 4G). |
| NFR-PERF-02 | Performance | p95 API latency < 400 ms for reads, < 800 ms for writes (excluding uploads). |
| NFR-PERF-03 | Performance | Images served via `next/image` in WebP/AVIF with explicit width/height. |
| NFR-SEC-01 | Security | All mutating endpoints require a valid session (except reads and shares) and check ownership server-side. |
| NFR-SEC-02 | Security | Passwords hashed by Better Auth (scrypt). No secrets in client bundles. |
| NFR-SEC-03 | Security | CSRF protection via Better Auth origin checks + SameSite cookies; mutating routes verify `Origin`. |
| NFR-SEC-04 | Security | Rate limits (per IP for Guests, per user for Members): auth 10/min, writes 30/min, comments 10/min, shares 10/min, reads 30/min, uploads 20/hour. Exceeding returns 429. |
| NFR-SEC-05 | Security | Uploads validated by MIME sniffing (magic bytes), not file extension. |
| NFR-ACC-01 | Accessibility | WCAG 2.2 AA: contrast ≥ 4.5:1 text, visible focus ring, full keyboard support, labelled controls, `prefers-reduced-motion` respected. |
| NFR-REL-01 | Reliability | Counter updates and their source rows are written in one DB transaction. |
| NFR-REL-02 | Reliability | 99.5 % monthly availability (Vercel + Neon). Daily DB backups via Neon point-in-time restore (7 days). |
| NFR-SEO-01 | SEO | Server-rendered public pages, canonical URLs, `sitemap.xml` of published blogs and profiles, `robots.txt`. |
| NFR-COMP-01 | Compatibility | Latest 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari 16+; widths 360–2560 px. |
| NFR-MAINT-01 | Maintainability | TypeScript strict mode; ESLint + Prettier; ≥ 70 % unit coverage on `lib/` services. |
| NFR-OBS-01 | Observability | Errors reported to Sentry with request id; structured server logs. |

## 5. Traceability (feature → requirements → endpoints)

| Feature | Requirements | API (see [API spec](08-API-SPEC.md)) |
|---|---|---|
| F-01 | FR-AUTH-01…08 | `/api/auth/*` |
| F-02 | FR-PROF-01…05 | E1, E2, E3, E31, `/api/auth/change-password` |
| F-03 | FR-EDIT-01…09 | E9, E10, E11, E31, E32, E33 |
| F-04 | FR-PUB-01…08 | E12, E26 |
| F-05 | FR-READ-01…03 | E14 |
| F-06 | FR-LIKE-01…03 | E17, E18 |
| F-07 | FR-CMT-01…05 | E21, E22, E23, E24 |
| F-08 | FR-SHR-01…03 | E20 |
| F-09 | FR-READ-04 | E19 |
| F-10 | FR-SRCH-01…05 | E8, E25, E26 |
| F-11 | FR-SUB-01…02 | E6, E7 |
| F-12 | FR-NOTF-01…05 | E27, E28, E29, E30 |
| F-13 | FR-DASH-01…04 | E13, E15, E16 |
| F-14 | FR-PROF-06 | E4, E5 |
