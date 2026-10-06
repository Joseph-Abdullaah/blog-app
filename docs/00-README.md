# Byline — Documentation Set

> **Byline** is the working product name (matching the "b" brand mark). Rename it in one pass across all files if you choose another name.

| # | Document | Purpose |
|---|---|---|
| 01 | [PRD](01-PRD.md) | What we are building and why; features, priorities, success metrics |
| 02 | [SRS](02-SRS.md) | Testable functional & non-functional requirements, business rules |
| 03 | [User Flow](03-USER-FLOW.md) | Step-by-step journeys for every feature |
| 04 | [UI & UX Spec](04-UI-UX-SPEC.md) | Every screen, its layout, states and interactions |
| 05 | [Design System](05-DESIGN-SYSTEM.md) | Tokens, typography, components (source for Claude Design) |
| 06 | [Database Schema](06-DATABASE-SCHEMA.md) | Full Prisma schema, indexes, constraints |
| 07 | [ERD](07-ERD.md) | Entity relationship diagram (Mermaid) and cardinalities |
| 08 | [API Specification](08-API-SPEC.md) | Every endpoint, request/response DTOs, errors |
| 09 | [Tech Stack](09-TECH-STACK.md) | Libraries, folder structure, env vars, deployment |

## Canonical reference (single source of truth)

Every document uses exactly these names. If one changes, it changes everywhere.

### Roles
| Role | Definition |
|---|---|
| **Guest** | Not signed in. Can read, search, share, view profiles. |
| **Member** | Signed in. Can write, like, comment, subscribe, receive notifications. |
| **Author** | A Member in relation to a blog they own. Only the Author can edit, delete, or view stats of that blog. |

### Enums
| Enum | Values |
|---|---|
| `BlogStatus` | `DRAFT`, `PUBLISHED` |
| `NotificationType` | `LIKE`, `COMMENT`, `REPLY`, `SHARE`, `SUBSCRIBE`, `NEW_BLOG` |
| `ShareChannel` | `COPY_LINK`, `X`, `FACEBOOK`, `LINKEDIN`, `WHATSAPP`, `EMAIL` |
| `UploadPurpose` | `banner`, `avatar` (editor images use the editor upload endpoints) |

Notification **filter tabs** (UI + `?type=` query): `all`, `like`, `comment`, `reply`, `share`, `subscription` (`subscription` = `SUBSCRIBE` + `NEW_BLOG`).

### Page routes
| Route | Screen | Access |
|---|---|---|
| `/` | Home feed (`?sort=latest\|trending&topic=<slug>`) | Public |
| `/search` | Search (`?q=&tab=blogs\|users&topic=<slug>`) | Public |
| `/blog/[slug]` | Blog reader | Public (published only) |
| `/u/[username]` | Public profile | Public |
| `/sign-in`, `/sign-up` | Auth | Guest only |
| `/forgot-password`, `/reset-password` | Password recovery | Guest only |
| `/editor` | New blog editor | Member |
| `/editor/[blogId]` | Edit blog / draft | Author |
| `/dashboard/blogs` | Manage blogs (`?tab=published\|drafts&q=`) | Member |
| `/dashboard/blogs/[blogId]/stats` | Blog stats | Author |
| `/dashboard/notifications` | Notifications (`?type=…`) | Member |
| `/settings/profile` | Edit profile | Member |
| `/settings/password` | Change password | Member |

### Validation limits
| Field | Rule |
|---|---|
| Name | 1–50 chars |
| Username | 3–30 chars, `^[a-z0-9_]+$`, unique, not reserved |
| Bio | 0–200 chars |
| Social links | `youtube`, `instagram`, `facebook`, `twitter`, `github`, `website` — each optional, valid `https://` URL, ≤ 255 chars |
| Password | 8–128 chars |
| Blog title | Draft: 0–120 chars · Publish: 3–120 chars |
| Blog description | Draft: 0–200 chars · Publish: 1–200 chars |
| Banner | Required to publish · JPG/PNG/WebP · ≤ 5 MB · 16:9 (recommended 1600×900) |
| Avatar | JPG/PNG/WebP · ≤ 2 MB · cropped square, stored 400×400 |
| Editor image | JPG/PNG/WebP/GIF · ≤ 5 MB |
| Topics | Publish: 1–5 per blog · each 2–30 chars, letters/numbers/spaces/hyphens |
| Content | Publish: ≥ 1 non-empty block · serialized JSON ≤ 500 KB |
| Comment | 1–1000 chars · replies are one level deep |
| Page size | default 10, max 50 (cursor pagination) |

### Counting rules
- **Read**: counted after the reader keeps the page open ≥ 10 seconds; once per `(blog, visitor)` per 24 h; the Author's own views are not counted.
- **Share**: every share action is recorded with its `ShareChannel`.
- **Read time**: `ceil(words / 200)`, minimum 1 minute.
- **Trending score** (blogs published in last 30 days): `reads + likes×3 + comments×4 + shares×5`.
