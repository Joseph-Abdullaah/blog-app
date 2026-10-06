# Byline — Tech Stack, Architecture & Deployment

| | |
|---|---|
| Version | 1.0 |
| Related | [SRS](02-SRS.md) · [Database Schema](06-DATABASE-SCHEMA.md) · [API Spec](08-API-SPEC.md) · [Design System](05-DESIGN-SYSTEM.md) |

> Versions are the current stable majors as of October 2026. Pin exact versions in `package.json` when the project is created.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19** | UI + API in one app; server components for SEO pages |
| Language | **TypeScript** (strict) | Shared types between UI, API and Prisma |
| Styling | **Tailwind CSS v4** | Tokens from the design system as CSS variables |
| Components | **shadcn/ui** (Radix primitives) + **Lucide** icons | Accessible, owned source in `src/components/ui` |
| Theme | **next-themes** | Light / dark / system (F-15) |
| Auth | **Better Auth 1.x** (email+password, Google, Prisma adapter) | Sessions in our DB, password reset, change password |
| ORM | **Prisma ORM 7** with **`@prisma/adapter-neon`** | Type-safe queries; serverless driver for Neon |
| Database | **PostgreSQL 17 on Neon** (+ `pg_trgm`) | Serverless Postgres, branching per preview deploy |
| Editor | **Editor.js 2.x** + tools: `@editorjs/header`, `@editorjs/list`, `@editorjs/image`, `@editorjs/code`, `@editorjs/quote`, `@editorjs/delimiter`, `@editorjs/table`, `@editorjs/embed`, `@editorjs/inline-code`, `@editorjs/marker` | Block JSON content (FR-EDIT-02) |
| Rendering content | Custom React `BlockRenderer` + **sanitize-html** (inline allow-list) + **Shiki** (code highlighting) | Safe, styled output (FR-READ-02) |
| Validation | **Zod** (shared client/server) | C-02 |
| Forms | **React Hook Form** + `@hookform/resolvers/zod` | Profile, auth, publish panel |
| Client data | **TanStack Query v5** | Optimistic likes/subscribes, infinite lists, polling unread count |
| File storage | **Vercel Blob** | Banners, avatars, editor images |
| Image crop | **react-easy-crop** | Avatar 1:1 crop |
| Toasts | **sonner** (shadcn) | Feedback |
| Charts | **Recharts** (shadcn chart) | Stats page |
| Email | **Resend** + **React Email** | Password reset only |
| Rate limiting | **Upstash Redis** + `@upstash/ratelimit` | NFR-SEC-04 |
| Dates | **date-fns** | Relative/compact dates |
| Errors | **Sentry** (`@sentry/nextjs`) | NFR-OBS-01 |
| Analytics | **Vercel Analytics + Speed Insights** | Web vitals (NFR-PERF-01) |
| Testing | **Vitest** + Testing Library (unit), **Playwright** (e2e) | NFR-MAINT-01 |
| Quality | ESLint, Prettier (+ tailwind plugin), Husky + lint-staged | |
| Package manager | **pnpm** · Node.js 22 LTS | |

## 2. Architecture

```
Browser
  │  RSC pages (/, /blog/[slug], /u/[username], /search)   ← server-rendered, cached
  │  Client components (editor, likes, comments, notifications) ← TanStack Query
  ▼
Next.js on Vercel
  ├─ middleware.ts         sets bl_vid cookie; guards Member/Guest-only routes (FR-AUTH-08)
  ├─ app/api/auth/[...all] Better Auth handler
  ├─ app/api/**            Route Handlers → services → Prisma
  └─ lib/services/*        business rules + transactions (one place, used by RSC and API)
        ├─ Prisma (Neon adapter) → Neon PostgreSQL
        ├─ Vercel Blob
        ├─ Upstash Redis (rate limit)
        └─ Resend (email)
```
- **Server Components** call `lib/services` directly (no HTTP hop); **client components** call the `/api` endpoints. Both paths share the same service functions, so rules are enforced once.
- **Caching:** public pages use `revalidateTag` — tags `blog:{id}`, `feed`, `user:{username}` invalidated on publish/update/delete/profile update. Counters on the reader are fetched client-side so cached HTML stays valid.

## 3. Folder structure
```
byline/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ prisma.config.ts
├─ public/  (logo.svg, og-default.png)
├─ src/
│  ├─ app/
│  │  ├─ (public)/page.tsx                    # S-01 Home
│  │  ├─ (public)/search/page.tsx             # S-02
│  │  ├─ (public)/blog/[slug]/page.tsx        # S-03
│  │  ├─ (public)/u/[username]/page.tsx       # S-04
│  │  ├─ (auth)/sign-in/page.tsx              # S-05
│  │  ├─ (auth)/sign-up/page.tsx              # S-06
│  │  ├─ (auth)/forgot-password/page.tsx      # S-07
│  │  ├─ (auth)/reset-password/page.tsx       # S-08
│  │  ├─ editor/page.tsx                      # S-09 (+ S-10 panel)
│  │  ├─ editor/[blogId]/page.tsx             # S-09
│  │  ├─ (dashboard)/dashboard/blogs/page.tsx                 # S-11
│  │  ├─ (dashboard)/dashboard/blogs/[blogId]/stats/page.tsx  # S-12
│  │  ├─ (dashboard)/dashboard/notifications/page.tsx         # S-13
│  │  ├─ (dashboard)/settings/profile/page.tsx                # S-14
│  │  ├─ (dashboard)/settings/password/page.tsx               # S-15
│  │  ├─ not-found.tsx                        # S-16
│  │  ├─ api/…                                # E1–E33 (see API spec)
│  │  ├─ sitemap.ts · robots.ts
│  │  ├─ layout.tsx · globals.css
│  ├─ components/
│  │  ├─ ui/            # shadcn primitives
│  │  ├─ layout/        # Navbar, AvatarMenu, SideNav, DashboardShell, EditorBar
│  │  ├─ blog/          # BlogListItem, BlogGridCard, AuthorRow, InteractionBar, LikeButton, ShareMenu, BlockRenderer
│  │  ├─ editor/        # Editor (dynamic, ssr:false), BannerUpload, TitleInput, PublishPanel
│  │  ├─ comments/      # CommentComposer, CommentItem
│  │  ├─ notifications/ # NotificationItem
│  │  └─ profile/       # ProfileCard, SocialLinks, AvatarCropDialog
│  ├─ lib/
│  │  ├─ auth.ts · auth-client.ts
│  │  ├─ prisma.ts
│  │  ├─ services/      # blogs, comments, likes, reads, shares, subscriptions, notifications, search, uploads, users
│  │  ├─ validations/   # zod schemas (user, blog, comment, upload)
│  │  ├─ editor/        # tools config, word count, read time
│  │  ├─ rate-limit.ts · api.ts (envelope + error helpers) · slug.ts
│  ├─ generated/prisma/ # Prisma client output
│  ├─ types/dto.ts
│  └─ middleware.ts
└─ tests/ (unit/, e2e/)
```
Editor.js touches `window`, so the editor component is loaded with `next/dynamic` and `ssr: false`.

## 4. Key configuration

### 4.1 `prisma.config.ts`
```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: env("DIRECT_URL") }, // unpooled URL for migrations
});
```

### 4.2 `src/lib/prisma.ts`
```ts
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 4.3 `src/lib/auth.ts` (outline)
```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true, minPasswordLength: 8, maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => sendResetEmail(user.email, url), // Resend
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } },
  account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  user: { additionalFields: {
    username: { type: "string", required: false, input: false },
    bio: { type: "string", required: false, input: false },
    // youtube, instagram, facebook, twitter, github, website — same shape
  } },
  databaseHooks: { user: { create: { before: async (u) => ({ data: { ...u, username: await generateUsername(u.email) } }) } } },
  rateLimit: { enabled: true, window: 60, max: 10 },
  plugins: [nextCookies()],
});
```

## 5. Environment variables
| Name | Where | Example / note |
|---|---|---|
| `DATABASE_URL` | all | Neon **pooled** connection string |
| `DIRECT_URL` | build/migrate | Neon **direct** connection string |
| `BETTER_AUTH_SECRET` | all | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | all | `https://byline.app` / `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | all | same as above (share URLs, OG) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | all | Google Cloud OAuth; redirect `${BETTER_AUTH_URL}/api/auth/callback/google` |
| `BLOB_READ_WRITE_TOKEN` | all | Vercel Blob store |
| `RESEND_API_KEY` / `EMAIL_FROM` | all | `Byline <no-reply@byline.app>` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | all | rate limiting |
| `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` | prod | error tracking + source maps |

## 6. Environments & deployment

| Env | App | Database | Trigger |
|---|---|---|---|
| Local | `pnpm dev` | Neon branch `dev` (or local Postgres via Docker) | — |
| Preview | Vercel preview deployment | Neon branch per PR (Neon ↔ Vercel integration) | Pull request |
| Production | Vercel production | Neon `main` branch | Merge to `main` |

### 6.1 CI — GitHub Actions (`.github/workflows/ci.yml`)
On every PR: `pnpm install --frozen-lockfile` → `prisma generate` → `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build` → Playwright e2e against the preview URL.

### 6.2 Release steps
1. Merge to `main` → Vercel builds.
2. Build command: `prisma generate && prisma migrate deploy && next build` (migrations use `DIRECT_URL`).
3. Sentry release + source maps uploaded.
4. Smoke test: `/`, `/blog/<seed-slug>`, sign in, publish a draft (Playwright `@smoke` tag).

### 6.3 Production checklist
- [ ] Custom domain + HTTPS on Vercel; `BETTER_AUTH_URL` and Google redirect URI updated.
- [ ] Resend domain verified (SPF/DKIM).
- [ ] Neon point-in-time restore enabled (7 days) — NFR-REL-02.
- [ ] Vercel Blob store connected; image domains allowed in `next.config.ts` `images.remotePatterns`.
- [ ] Security headers (`next.config.ts`): CSP (allow Blob, YouTube/X/CodePen embeds), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] `sitemap.xml`, `robots.txt`, OG default image.
- [ ] Rate limits verified (429 responses).

## 7. Scripts (`package.json`)
| Script | Command |
|---|---|
| `dev` | `next dev --turbopack` |
| `build` | `prisma generate && next build` |
| `start` | `next start` |
| `lint` / `typecheck` | `eslint .` / `tsc --noEmit` |
| `test` / `test:e2e` | `vitest run` / `playwright test` |
| `db:migrate` / `db:deploy` | `prisma migrate dev` / `prisma migrate deploy` |
| `db:seed` / `db:studio` | `prisma db seed` / `prisma studio` |

## 8. Build phases (from PRD §7)
| Phase | Output |
|---|---|
| 1 Docs | This document set |
| 2 Design system | Claude Design system built from [05-DESIGN-SYSTEM.md](05-DESIGN-SYSTEM.md) |
| 3 UI/UX screens | S-01…S-16 (optional, in Claude Design) |
| 4 Frontend | Pages + components wired to mocked services matching the DTOs |
| 5 Backend | Prisma schema, services, Route Handlers E1–E33, Better Auth |
