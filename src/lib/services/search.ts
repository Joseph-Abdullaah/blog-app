import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { cardSelect, toBlogCard } from "@/lib/services/feed"
import type { BlogCard, UserSearchResult } from "@/types/dto"

/** Escape LIKE wildcards so the query is matched literally. */
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

const offsetOf = (cursor?: string) => Math.max(0, Number.parseInt(cursor ?? "0", 10) || 0)

/**
 * E25 blogs (FR-SRCH-01): published blogs whose title or description contains
 * `q`, or that have a topic containing it; best title match first, then newest.
 */
export async function searchBlogs(opts: {
  q: string
  topic?: string
  cursor?: string
  limit: number
}): Promise<{ data: BlogCard[]; nextCursor: string | null }> {
  const offset = offsetOf(opts.cursor)
  const pattern = likePattern(opts.q)
  const topicFilter = opts.topic
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "blog_topic" bt JOIN "topic" t ON t.id = bt."topicId"
        WHERE bt."blogId" = b.id AND t.slug = ${opts.topic})`
    : Prisma.empty

  const ranked = await prisma.$queryRaw<{ id: string }[]>`
    SELECT b.id FROM "blog" b
    WHERE b.status = 'PUBLISHED'
      AND (b.title ILIKE ${pattern} OR b.description ILIKE ${pattern}
           OR EXISTS (
             SELECT 1 FROM "blog_topic" bt JOIN "topic" t ON t.id = bt."topicId"
             WHERE bt."blogId" = b.id AND t.name ILIKE ${pattern}))
      ${topicFilter}
    ORDER BY similarity(b.title, ${opts.q}) DESC, b."publishedAt" DESC, b.id DESC
    LIMIT ${opts.limit + 1} OFFSET ${offset}
  `
  return hydrateBlogs(ranked, offset, opts.limit)
}

async function hydrateBlogs(ranked: { id: string }[], offset: number, limit: number) {
  const hasMore = ranked.length > limit
  const ids = ranked.slice(0, limit).map((r) => r.id)
  if (!ids.length) return { data: [], nextCursor: null }

  const rows = await prisma.blog.findMany({ where: { id: { in: ids } }, select: cardSelect })
  const byId = new Map(rows.map((r) => [r.id, r]))
  return {
    data: ids.flatMap((id) => (byId.has(id) ? [toBlogCard(byId.get(id)!)] : [])),
    nextCursor: hasMore ? String(offset + limit) : null,
  }
}

/** E25 users (FR-SRCH-02): name or username contains `q`, best match first. */
export async function searchUsers(opts: {
  q: string
  cursor?: string
  limit: number
  viewerId: string | null
}): Promise<{ data: UserSearchResult[]; nextCursor: string | null }> {
  const offset = offsetOf(opts.cursor)
  const pattern = likePattern(opts.q)

  const ranked = await prisma.$queryRaw<{ id: string }[]>`
    SELECT u.id FROM "user" u
    WHERE u.username IS NOT NULL
      AND (u.name ILIKE ${pattern} OR u.username ILIKE ${pattern})
    ORDER BY GREATEST(similarity(u.name, ${opts.q}), similarity(u.username, ${opts.q})) DESC,
             u."createdAt" DESC
    LIMIT ${opts.limit + 1} OFFSET ${offset}
  `
  const hasMore = ranked.length > opts.limit
  const ids = ranked.slice(0, opts.limit).map((r) => r.id)
  if (!ids.length) return { data: [], nextCursor: null }

  const [users, subscriptions] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, username: true, image: true, bio: true },
    }),
    opts.viewerId
      ? prisma.subscription.findMany({
          where: { subscriberId: opts.viewerId, authorId: { in: ids } },
          select: { authorId: true },
        })
      : Promise.resolve([]),
  ])
  const subscribed = new Set(subscriptions.map((s) => s.authorId))
  const byId = new Map(users.map((u) => [u.id, u]))

  return {
    data: ids.flatMap((id) => {
      const u = byId.get(id)
      return u
        ? [
            {
              id: u.id,
              name: u.name,
              username: u.username ?? "",
              image: u.image,
              bio: u.bio,
              viewer: { subscribed: subscribed.has(u.id) },
            },
          ]
        : []
    }),
    nextCursor: hasMore ? String(offset + opts.limit) : null,
  }
}
