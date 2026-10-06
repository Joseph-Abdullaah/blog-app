# Byline — Product Requirements Document (PRD)

| | |
|---|---|
| Product | Byline — a blogging platform |
| Version | 1.0 (MVP) |
| Owner | Joseph |
| Status | Draft for build |
| Related | [SRS](02-SRS.md) · [User Flow](03-USER-FLOW.md) · [UI/UX](04-UI-UX-SPEC.md) · [API](08-API-SPEC.md) |

---

## 1. Summary

Byline is a clean, reading-first blogging platform. Members write rich blogs with a block editor (text, headings, lists, checklists, images, code, quotes, tables, embeds), add a cover banner, description and topics, preview, then publish or keep as a draft. Readers discover blogs through a feed, topics and search, and interact through likes, comments, replies and shares. Authors manage their blogs from a dashboard showing reads, likes, comments and shares (by channel), and get notified about every interaction and new subscribers.

## 2. Problem & goals

**Problem.** Writers want a distraction-free place to publish technical and personal writing that supports code and images, gives them simple, honest stats, and lets readers follow them — without the clutter of large platforms.

**Goals**
| ID | Goal |
|---|---|
| G1 | A writer can go from sign-up to a published blog in under 5 minutes. |
| G2 | Readers can find a blog by title, topic or author in one search. |
| G3 | Authors understand how each blog performs (reads, likes, comments, shares by channel). |
| G4 | Authors and readers are kept engaged through notifications and subscriptions. |

**Non-goals (v1)** — see §8.

## 3. Users & roles

| Role | Description |
|---|---|
| Guest | Unauthenticated visitor. Reads, searches, views profiles, shares. |
| Member | Signed-in user. Everything a Guest can do + write, like, comment, reply, subscribe, receive notifications, manage profile. |
| Author | A Member viewed in relation to a blog they own; can edit, delete and see stats for it. |

**Personas**
- **Amina, the tech writer** — writes tutorials with code blocks and screenshots; cares about formatting and readership stats.
- **Yusuf, the reader** — browses by topic on mobile, likes and comments, subscribes to favorite authors.

## 4. Features

Priority: **M** = Must (MVP), **S** = Should (MVP if time allows).

| ID | Feature | Priority | Summary |
|---|---|---|---|
| F-01 | Authentication | M | Email + password sign up/in, Google sign in, sign out, forgot/reset password. |
| F-02 | Profile & settings | M | Edit avatar, name, username, bio, social links; change password. |
| F-03 | Editor & drafts | M | Editor.js block editor with banner and title; Save Draft; drafts list. Autosave is **S**. |
| F-04 | Preview & publish | M | Publish panel with live preview, description, topics; Publish / Update. |
| F-05 | Reading | M | Blog reader page with banner, author, meta, rendered blocks, interaction bar. |
| F-06 | Likes | M | Toggle like on a blog; count shown. |
| F-07 | Comments & replies | M | Comment, reply (one level), delete own comment; Author can delete any comment on their blog. |
| F-08 | Shares | M | Share menu: Copy link, X, Facebook, LinkedIn, WhatsApp, Email; tracked by channel. |
| F-09 | Reads | M | Read counted per the counting rules. |
| F-10 | Search & topics | M | Search blogs by title/description/topic and users by name/username; filter by topic. |
| F-11 | Subscriptions | M | Subscribe/unsubscribe to an author; subscriber count on profile. |
| F-12 | Notifications | M | In-app notifications for likes, comments, replies, shares, new subscribers, new blogs from subscribed authors; unread badge; filters; mark read. |
| F-13 | Dashboard & stats | M | Manage published blogs and drafts (search, edit, delete); per-blog stats page. |
| F-14 | Public profile | M | Profile page with avatar, name, username, bio, socials, joined date, stats, published blogs, Subscribe button. |
| F-15 | Theming | S | Light and dark themes, following system by default, toggle in avatar menu. |

## 5. Feature details & acceptance criteria

### F-01 Authentication
- Sign up with name, email, password (8–128). Username is auto-generated from email, editable later.
- Sign in with email + password or Google.
- Forgot password sends a reset link (valid 1 hour).
- **AC:** After sign up the Member lands on `/` signed in. Wrong credentials show "Email or password is incorrect" without revealing which.

### F-02 Profile & settings
- Avatar upload (≤ 2 MB, cropped square), name, username (live availability check), bio (200 chars with counter), six social links.
- Change password requires the current password; other sessions are signed out.
- **AC:** Changes appear immediately on `/u/[username]`. Changing username changes the profile URL; old URL returns 404.

### F-03 Editor & drafts
- New blog at `/editor`: banner upload area, title field, Editor.js canvas.
- Editor tools: Header (H2–H4), Paragraph, List (ordered, unordered, checklist), Image (upload or URL, caption), Code, Quote, Delimiter, Table, Embed (YouTube, X, CodePen), Inline code, Marker, Bold, Italic, Link.
- **Save Draft** stores everything; nothing is required for a draft.
- (S) Autosave every 30 s while there are unsaved changes.
- **AC:** A saved draft appears under Dashboard → Drafts and reopens exactly as left.

### F-04 Preview & publish
- **Publish** opens the publish panel: left = preview card (banner, title, description), right = description (200 chars), topics (1–5, autocomplete existing topics, Enter to add) and the **Publish** button.
- Validation on publish: banner, title 3–120, description 1–200, 1–5 topics, ≥ 1 content block.
- **Preview** button (in the editor) renders the full reader view read-only.
- Editing a published blog shows **Update** instead of **Publish**; the URL (slug) never changes after first publish.
- **AC:** After publishing the Author is taken to `/blog/[slug]`; the blog appears in the feed, search and their profile.

### F-05 Reading
- Banner, title, description, author row (avatar, name, @username, date, read time, Subscribe), content, topics, interaction bar (like, comment, share), comments section.
- **AC:** All Editor.js blocks render with correct styling in both themes; code blocks have a Copy button.

### F-06 Likes
- Heart toggle; Guests are asked to sign in. Author cannot like own blog.
- **AC:** Count updates optimistically; double-tap does not double-count.

### F-07 Comments & replies
- Comment box at the top of the comments section; newest first; replies collapsed under "View N replies".
- Delete: own comments, or any comment on own blog (confirmation dialog). Deleting a comment deletes its replies.

### F-08 Shares
- Share menu with six channels. Each action is recorded (Guests too). Copy link shows a toast "Link copied".

### F-09 Reads
- Counted per the counting rules in the README.

### F-10 Search & topics
- Search bar in navbar; results page with **Blogs** and **Users** tabs, optional topic filter chip.
- Blogs match on title, description or topic name; users match on name or username.
- Home feed has topic chips and **Latest / Trending** sort.

### F-11 Subscriptions
- Subscribe button on profile and on blog author row. Cannot subscribe to self.

### F-12 Notifications
- Triggers:
  | Type | Recipient | When |
  |---|---|---|
  | `LIKE` | Author | A Member likes their blog (removed on unlike) |
  | `COMMENT` | Author | A Member comments on their blog |
  | `REPLY` | Parent comment author | A Member replies to their comment |
  | `SHARE` | Author | A signed-in Member shares their blog (max once per Member per blog per 24 h) |
  | `SUBSCRIBE` | Author | A Member subscribes to them |
  | `NEW_BLOG` | Every subscriber | An author they subscribe to publishes a blog for the first time |
- No notification for actions on your own content.
- Bell icon in navbar with unread dot + count (polled every 30 s). Filters: All, Like, Comment, Reply, Share, Subscription. Mark one / all as read.

### F-13 Dashboard & stats
- `/dashboard/blogs`: search, tabs **Published** / **Drafts**; row shows banner thumbnail, title, published/updated date, Edit, Delete, Stats, and counts (Likes, Comments, Reads, Shares).
- `/dashboard/blogs/[blogId]/stats`: totals, reads per day (last 30 days), shares by channel, recent comments (with delete).

### F-14 Public profile
- As listed in §4; "Blogs Published" list with infinite scroll.

## 6. Success metrics (first 90 days)
| Metric | Target |
|---|---|
| Sign-up → first published blog | ≥ 30 % of new Members |
| Median time sign-up → publish | < 5 min |
| Blogs with ≥ 1 interaction within 7 days | ≥ 50 % |
| p75 Largest Contentful Paint on `/blog/[slug]` | < 2.5 s |

## 7. Release phases
| Phase | Scope | Owner |
|---|---|---|
| 1 | Documentation (this set) | Claude |
| 2 | Design system in Claude Design | Claude |
| 3 | UI/UX screens (optional in Claude Design) | Joseph decides |
| 4 | Frontend implementation | Claude / Joseph |
| 5 | Backend implementation | Joseph |

## 8. Out of scope (v1)
Unpublishing to draft, scheduled publishing, co-authors, bookmarks/reading lists, email notifications for interactions (only password reset emails are sent), real-time websockets (polling is used), paid subscriptions, admin moderation panel, multi-language UI.

## 9. Risks & assumptions
| Risk | Mitigation |
|---|---|
| Spam comments / sign-ups | Rate limits (SRS NFR-SEC-04), email verification optional toggle |
| Large images slow pages | Size limits, `next/image` optimization, WebP |
| Editor.js content XSS | Render blocks to React components; sanitize inline HTML with an allow-list |
