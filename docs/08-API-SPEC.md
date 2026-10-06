# Byline — API Specification

| | |
|---|---|
| Version | 1.0 |
| Base URL | `https://<domain>/api` (local: `http://localhost:3000/api`) |
| Implementation | Next.js Route Handlers in `src/app/api/**/route.ts` |
| Auth | Better Auth session cookie (`better-auth.session_token`) |
| Requirements | IDs refer to [SRS](02-SRS.md) |
| Data model | [Database Schema](06-DATABASE-SCHEMA.md) |

---

## 1. Conventions

### 1.1 Envelope
```jsonc
// success
{ "data": <payload>, "meta": { "nextCursor": "clx…" | null } }   // meta only on paginated lists
// error
{ "error": { "code": "VALIDATION_ERROR", "message": "Title must be 3–120 characters", "fields": { "title": "Must be 3–120 characters" } } }
```

### 1.2 Error codes
| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON / query |
| 401 | `UNAUTHENTICATED` | No/invalid session on a Member endpoint |
| 403 | `FORBIDDEN` | Not the owner; liking own blog; subscribing to self |
| 404 | `NOT_FOUND` | Resource missing, or a draft requested by a non-owner |
| 409 | `CONFLICT` | Username taken; PATCH on a published blog |
| 413 | `PAYLOAD_TOO_LARGE` | File or content over limit |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | File type not allowed |
| 422 | `VALIDATION_ERROR` | Zod validation failed (`fields` populated) |
| 429 | `RATE_LIMITED` | NFR-SEC-04 limits; `Retry-After` header set |
| 500 | `INTERNAL_ERROR` | Unexpected |

### 1.3 Pagination
Cursor-based: `?cursor=<id>&limit=<1–50, default 10>`. Response `meta.nextCursor` is `null` on the last page.

### 1.4 Visitor cookie
`bl_vid` (httpOnly, Secure, SameSite=Lax, 1 year, UUID v4) is set by middleware on first request; used by E19 and E20.

### 1.5 Access legend
🌐 Public · 🔐 Member · 👤 Author/owner only

## 2. Shared DTOs (`src/types/dto.ts`)

```ts
type AuthorSummary = { id: string; name: string; username: string; image: string | null };

type TopicDTO = { id: string; name: string; slug: string };

type Socials = {
  youtube: string | null; instagram: string | null; facebook: string | null;
  twitter: string | null; github: string | null; website: string | null;
};

type BlogCard = {
  id: string; slug: string; title: string; description: string; bannerUrl: string;
  topics: TopicDTO[]; readTimeMinutes: number;
  likesCount: number; commentsCount: number; readsCount: number; sharesCount: number;
  publishedAt: string; // ISO
  author: AuthorSummary;
};

type BlogDetail = BlogCard & {
  content: EditorJsData; updatedAt: string;
  viewer: { liked: boolean; isAuthor: boolean; subscribedToAuthor: boolean };
};

type EditableBlog = {            // owner view, drafts and published
  id: string; slug: string | null; status: "DRAFT" | "PUBLISHED";
  title: string; description: string; bannerUrl: string | null;
  content: EditorJsData; topics: TopicDTO[];
  publishedAt: string | null; updatedAt: string;
};

type DashboardBlog = {
  id: string; slug: string | null; status: "DRAFT" | "PUBLISHED";
  title: string; bannerUrl: string | null;
  likesCount: number; commentsCount: number; readsCount: number; sharesCount: number;
  publishedAt: string | null; updatedAt: string;
};

type EditorJsData = { time?: number; version?: string; blocks: { id?: string; type: string; data: unknown }[] };

type CommentDTO = {
  id: string; blogId: string; parentId: string | null; content: string; createdAt: string;
  author: AuthorSummary; repliesCount: number;
  canDelete: boolean; // viewer is comment author or blog Author
};

type NotificationDTO = {
  id: string;
  type: "LIKE" | "COMMENT" | "REPLY" | "SHARE" | "SUBSCRIBE" | "NEW_BLOG";
  isRead: boolean; createdAt: string;
  actor: AuthorSummary;
  blog: { id: string; slug: string; title: string } | null;
  comment: { id: string; content: string; parentId: string | null; parentContent: string | null } | null;
};

type Me = {
  id: string; name: string; email: string; username: string; image: string | null;
  bio: string | null; socials: Socials; hasPassword: boolean; createdAt: string;
};

type PublicProfile = {
  id: string; name: string; username: string; image: string | null; bio: string | null;
  socials: Socials; joinedAt: string;
  stats: { blogsCount: number; totalReads: number; subscribersCount: number };
  viewer: { isSelf: boolean; subscribed: boolean };
};

type UserSearchResult = AuthorSummary & { bio: string | null; viewer: { subscribed: boolean } };

type BlogStats = {
  totals: { reads: number; likes: number; comments: number; shares: number };
  readsByDay: { date: string /* YYYY-MM-DD */; count: number }[]; // 30 entries, zero-filled
  sharesByChannel: { channel: "COPY_LINK" | "X" | "FACEBOOK" | "LINKEDIN" | "WHATSAPP" | "EMAIL"; count: number }[]; // all 6
  recentComments: CommentDTO[]; // 10 most recent, top-level + replies
};
```

## 3. Authentication — Better Auth (`/api/auth/[...all]`)

Handled entirely by Better Auth; the UI uses `authClient` from `better-auth/react`.

| Action | Client call | Endpoint | Req |
|---|---|---|---|
| Sign up | `authClient.signUp.email({ name, email, password })` | `POST /api/auth/sign-up/email` | FR-AUTH-01/02 |
| Sign in | `authClient.signIn.email({ email, password })` | `POST /api/auth/sign-in/email` | FR-AUTH-03/04 |
| Google | `authClient.signIn.social({ provider: "google", callbackURL })` | `POST /api/auth/sign-in/social` | FR-AUTH-03 |
| Session | `authClient.useSession()` / `auth.api.getSession({ headers })` | `GET /api/auth/get-session` | FR-AUTH-05 |
| Sign out | `authClient.signOut()` | `POST /api/auth/sign-out` | FR-AUTH-07 |
| Forgot | `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })` | `POST /api/auth/request-password-reset` | FR-AUTH-06 |
| Reset | `authClient.resetPassword({ newPassword, token })` | `POST /api/auth/reset-password` | FR-AUTH-06 |
| Change password | `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })` | `POST /api/auth/change-password` | FR-PROF-05 |

> Method/endpoint names follow Better Auth 1.x; confirm against the installed version's docs.

Username generation (FR-AUTH-02) runs in a Better Auth `databaseHooks.user.create.before` hook.

## 4. Endpoint index

| # | Method | Path | Access | Req |
|---|---|---|---|---|
| E1 | GET | `/api/users/me` | 🔐 | FR-PROF-01 |
| E2 | PATCH | `/api/users/me` | 🔐 | FR-PROF-01/02/04 |
| E3 | GET | `/api/users/username-available?username=` | 🔐 | FR-PROF-03 |
| E4 | GET | `/api/users/{username}` | 🌐 | FR-PROF-06 |
| E5 | GET | `/api/users/{username}/blogs` | 🌐 | FR-PROF-06 |
| E6 | PUT | `/api/users/{username}/subscription` | 🔐 | FR-SUB-01/02 |
| E7 | DELETE | `/api/users/{username}/subscription` | 🔐 | FR-SUB-01/02 |
| E8 | GET | `/api/blogs` | 🌐 | FR-SRCH-05 |
| E9 | POST | `/api/blogs` | 🔐 | FR-EDIT-01/05 |
| E10 | GET | `/api/blogs/{blogId}` | 👤 | FR-EDIT-08 |
| E11 | PATCH | `/api/blogs/{blogId}` | 👤 | FR-EDIT-05/06/09 |
| E12 | POST | `/api/blogs/{blogId}/publish` | 👤 | FR-PUB-03…08 |
| E13 | DELETE | `/api/blogs/{blogId}` | 👤 | FR-DASH-03 |
| E14 | GET | `/api/blogs/slug/{slug}` | 🌐 | FR-READ-01 |
| E15 | GET | `/api/users/me/blogs` | 🔐 | FR-DASH-01/02 |
| E16 | GET | `/api/blogs/{blogId}/stats` | 👤 | FR-DASH-04 |
| E17 | PUT | `/api/blogs/{blogId}/like` | 🔐 | FR-LIKE-01/02 |
| E18 | DELETE | `/api/blogs/{blogId}/like` | 🔐 | FR-LIKE-01/02 |
| E19 | POST | `/api/blogs/{blogId}/reads` | 🌐 | FR-READ-04 |
| E20 | POST | `/api/blogs/{blogId}/shares` | 🌐 | FR-SHR-01…03 |
| E21 | GET | `/api/blogs/{blogId}/comments` | 🌐 | FR-CMT-03 |
| E22 | POST | `/api/blogs/{blogId}/comments` | 🔐 | FR-CMT-01/02 |
| E23 | GET | `/api/comments/{commentId}/replies` | 🌐 | FR-CMT-03 |
| E24 | DELETE | `/api/comments/{commentId}` | 🔐 | FR-CMT-04 |
| E25 | GET | `/api/search` | 🌐 | FR-SRCH-01…03 |
| E26 | GET | `/api/topics` | 🌐 | FR-SRCH-04, FR-PUB-04 |
| E27 | GET | `/api/notifications` | 🔐 | FR-NOTF-02 |
| E28 | GET | `/api/notifications/unread-count` | 🔐 | FR-NOTF-03 |
| E29 | PATCH | `/api/notifications/{notificationId}/read` | 🔐 | FR-NOTF-04 |
| E30 | PATCH | `/api/notifications/read-all` | 🔐 | FR-NOTF-04 |
| E31 | POST | `/api/uploads` | 🔐 | FR-PROF-04, FR-EDIT-04 |
| E32 | POST | `/api/uploads/editor/file` | 🔐 | FR-EDIT-03 |
| E33 | POST | `/api/uploads/editor/url` | 🔐 | FR-EDIT-03 |

Static path segments (`me`, `slug`, `read-all`, `unread-count`, `username-available`) take precedence over dynamic segments; `me` is a reserved username (FR-PROF-02).

## 5. Users & subscriptions

### E1 `GET /api/users/me` 🔐
`200 { data: Me }`

### E2 `PATCH /api/users/me` 🔐
All fields optional; send only changed ones. `image` is a URL returned by E31 (`purpose=avatar`).
```json
{ "name": "Joseph", "username": "joseph_dev", "bio": "Building things.",
  "image": "https://…blob.vercel-storage.com/avatars/…webp",
  "socials": { "github": "https://github.com/joseph", "website": null } }
```
`200 { data: Me }` · `409 CONFLICT` (username taken) · `422`.

### E3 `GET /api/users/username-available?username=joseph_dev` 🔐
`200 { data: { available: boolean, reason: null | "TAKEN" | "RESERVED" | "INVALID" } }` — the Member's current username returns `available: true`.

### E4 `GET /api/users/{username}` 🌐
`200 { data: PublicProfile }` · `404`.

### E5 `GET /api/users/{username}/blogs?cursor=&limit=` 🌐
Published blogs, `publishedAt` desc. `200 { data: BlogCard[], meta }`.

### E6 `PUT /api/users/{username}/subscription` 🔐 — idempotent
`200 { data: { subscribed: true, subscribersCount: number } }` · `403` (self) · `404`.
Side effect: `SUBSCRIBE` notification (first time only).

### E7 `DELETE /api/users/{username}/subscription` 🔐 — idempotent
`200 { data: { subscribed: false, subscribersCount: number } }`. Deletes the unread `SUBSCRIBE` notification.

## 6. Blogs

### E8 `GET /api/blogs?sort=latest|trending&topic=<slug>&cursor=&limit=` 🌐
- `latest` (default): published, `publishedAt` desc.
- `trending`: published in last 30 days, ordered by `readsCount + likesCount*3 + commentsCount*4 + sharesCount*5` desc (cursor = offset token).
`200 { data: BlogCard[], meta }`.

### E9 `POST /api/blogs` 🔐 — create draft
Body (all optional, draft rules FR-EDIT-05):
```json
{ "title": "", "description": "", "bannerUrl": null, "content": { "blocks": [] }, "topics": ["Travel"] }
```
`201 { data: EditableBlog }` (status `DRAFT`).

### E10 `GET /api/blogs/{blogId}` 🔐👤
`200 { data: EditableBlog }` · `404` if not found **or not owner** (no existence leak).

### E11 `PATCH /api/blogs/{blogId}` 🔐👤 — save draft
Same body as E9 (partial). Draft rules only.
`200 { data: EditableBlog }` · `409 CONFLICT` if the blog is `PUBLISHED` (use E12) · `404`.

### E12 `POST /api/blogs/{blogId}/publish` 🔐👤 — publish or update
Full body, publish rules (FR-PUB-03):
```json
{
  "title": "The Brightest Stars in the Darkest Sky",
  "description": "New Zealand's Dark Sky Project at Lake Tekapo",
  "bannerUrl": "https://…/banners/…webp",
  "content": { "time": 1759590000000, "version": "2.31.0", "blocks": [ { "type": "paragraph", "data": { "text": "…" } } ] },
  "topics": ["Travel", "Science"]
}
```
`200 { data: { id, slug, status: "PUBLISHED", firstPublish: boolean } }` · `422` with `fields` keys `title | description | bannerUrl | content | topics` · `404`.
Side effects per FR-PUB-04…06 (NEW_BLOG only when `firstPublish`).

### E13 `DELETE /api/blogs/{blogId}` 🔐👤
`204` · `404`. Cascades per FR-DASH-03.

### E14 `GET /api/blogs/slug/{slug}` 🌐
`200 { data: BlogDetail }` · `404` for unknown slug or draft. `viewer` is all-false for Guests.

### E15 `GET /api/users/me/blogs?status=PUBLISHED|DRAFT&q=&cursor=&limit=` 🔐
`status` required. `PUBLISHED` → `publishedAt` desc; `DRAFT` → `updatedAt` desc; `q` filters title (ILIKE).
`200 { data: DashboardBlog[], meta }`.

### E16 `GET /api/blogs/{blogId}/stats` 🔐👤
`200 { data: BlogStats }` · `404`.

## 7. Interactions

### E17 `PUT /api/blogs/{blogId}/like` 🔐 · E18 `DELETE /api/blogs/{blogId}/like` 🔐
Idempotent. `200 { data: { liked: boolean, likesCount: number } }` · `403` (own blog) · `404` (not published).

### E19 `POST /api/blogs/{blogId}/reads` 🌐
No body. Uses `bl_vid` + optional session.
`200 { data: { counted: boolean, readsCount: number } }` — `counted: false` when Author or within 24 h.

### E20 `POST /api/blogs/{blogId}/shares` 🌐
```json
{ "channel": "WHATSAPP" }
```
`201 { data: { sharesCount: number } }` · `422` invalid channel.

## 8. Comments

### E21 `GET /api/blogs/{blogId}/comments?cursor=&limit=` 🌐
Top-level only, newest first. `200 { data: CommentDTO[], meta }`.

### E22 `POST /api/blogs/{blogId}/comments` 🔐
```json
{ "content": "Great read!", "parentId": null }
```
If `parentId` is a reply, the server re-parents to its top-level comment (FR-CMT-02).
`201 { data: CommentDTO }` · `404` blog not published / parent not in blog · `422`.

### E23 `GET /api/comments/{commentId}/replies?cursor=&limit=` 🌐
Oldest first. `200 { data: CommentDTO[], meta }`.

### E24 `DELETE /api/comments/{commentId}` 🔐
Allowed for comment author or blog Author. `200 { data: { deletedCount: number, commentsCount: number } }` · `403` · `404`.

## 9. Discovery

### E25 `GET /api/search?q=&type=blogs|users&topic=<slug>&cursor=&limit=` 🌐
`q` 1–100 chars (trimmed). `type` default `blogs`.
- `blogs` → `200 { data: BlogCard[], meta }`
- `users` → `200 { data: UserSearchResult[], meta }`

### E26 `GET /api/topics?q=&limit=` 🌐
With `q`: name ILIKE / similarity (autocomplete, limit default 8). Without: top 10 by published-blog count.
`200 { data: (TopicDTO & { blogsCount: number })[] }`.

## 10. Notifications

### E27 `GET /api/notifications?type=all|like|comment|reply|share|subscription&cursor=&limit=` 🔐
`subscription` = `SUBSCRIBE` + `NEW_BLOG`. Newest first. `200 { data: NotificationDTO[], meta }`.

### E28 `GET /api/notifications/unread-count` 🔐
`200 { data: { count: number } }`.

### E29 `PATCH /api/notifications/{notificationId}/read` 🔐
`200 { data: { id, isRead: true } }` · `404` (not recipient).

### E30 `PATCH /api/notifications/read-all` 🔐
`200 { data: { updated: number } }`.

## 11. Uploads (Vercel Blob)

### E31 `POST /api/uploads` 🔐 — `multipart/form-data`
| Field | Value |
|---|---|
| `file` | image file |
| `purpose` | `banner` (JPG/PNG/WebP ≤ 5 MB) · `avatar` (JPG/PNG/WebP ≤ 2 MB, client-cropped 400×400) |
`201 { data: { url: string, width: number, height: number } }` · `413` · `415` · `422`.
Stored at `banners/{userId}/{cuid}.{ext}` or `avatars/{userId}/{cuid}.{ext}`.

### E32 `POST /api/uploads/editor/file` 🔐 — Editor.js Image tool `endpoints.byFile`
`multipart/form-data` field `image` (JPG/PNG/WebP/GIF ≤ 5 MB). **Editor.js response format (no envelope):**
```json
{ "success": 1, "file": { "url": "https://…/content/…webp", "width": 1600, "height": 900 } }
```
Failure: `{ "success": 0, "message": "Image must be 5 MB or smaller" }` with matching HTTP status.

### E33 `POST /api/uploads/editor/url` 🔐 — Editor.js Image tool `endpoints.byUrl`
```json
{ "url": "https://example.com/photo.jpg" }
```
Server fetches (≤ 5 MB, 10 s timeout, http(s) only, private IP ranges blocked), validates type, re-hosts to Blob. Same response format as E32.

## 12. Rate limits (Upstash, sliding window)
| Group | Limit | Endpoints |
|---|---|---|
| auth | 10/min/IP | `/api/auth/*` (Better Auth built-in limiter) |
| writes | 30/min/user | E2, E6, E7, E9, E11, E12, E13, E17, E18, E24, E29, E30 |
| comments | 10/min/user | E22 |
| shares | 10/min/visitor | E20 |
| reads | 30/min/visitor | E19 |
| uploads | 20/hour/user | E31, E32, E33 |
