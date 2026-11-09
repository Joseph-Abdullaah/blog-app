import { cache } from "react"

import type { Prisma } from "../../../generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { topicSelect } from "@/lib/services/topics"
import type { AuthorSummary, BlogCard, BlogDetail, EditorJsData } from "@/types/dto"

export const authorSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} satisfies Prisma.UserSelect

export function toAuthor(user: {
  id: string
  name: string
  username: string | null
  image: string | null
}): AuthorSummary {
  return { id: user.id, name: user.name, username: user.username ?? "", image: user.image }
}

export const cardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  bannerUrl: true,
  readTimeMinutes: true,
  likesCount: true,
  commentsCount: true,
  readsCount: true,
  sharesCount: true,
  publishedAt: true,
  author: { select: authorSelect },
  topics: { select: { topic: { select: topicSelect } } },
} satisfies Prisma.BlogSelect

type CardRow = Prisma.BlogGetPayload<{ select: typeof cardSelect }>

export function toBlogCard(row: CardRow): BlogCard {
  return {
    id: row.id,
    slug: row.slug ?? "",
    title: row.title,
    description: row.description,
    bannerUrl: row.bannerUrl ?? "",
    topics: row.topics.map((t) => t.topic),
    readTimeMinutes: row.readTimeMinutes,
    likesCount: row.likesCount,
    commentsCount: row.commentsCount,
    readsCount: row.readsCount,
    sharesCount: row.sharesCount,
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
    author: toAuthor(row.author),
  }
}

/** Published blogs, optionally limited to one topic (by slug). */
export function publishedWhere(topic?: string): Prisma.BlogWhereInput {
  return {
    status: "PUBLISHED",
    ...(topic ? { topics: { some: { topic: { slug: topic } } } } : {}),
  }
}

export type FeedPage = { data: BlogCard[]; nextCursor: string | null }

/** `latest`: publishedAt desc, cursor = last blog id. */
export async function latestBlogs(opts: {
  topic?: string
  cursor?: string
  limit: number
  where?: Prisma.BlogWhereInput
}): Promise<FeedPage> {
  const rows = await prisma.blog.findMany({
    where: { ...publishedWhere(opts.topic), ...opts.where },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    select: cardSelect,
    take: opts.limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  })
  const hasMore = rows.length > opts.limit
  const page = rows.slice(0, opts.limit)
  return {
    data: page.map(toBlogCard),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

/**
 * `trending` (FR-SRCH-05): published in the last 30 days, ordered by
 * reads + likes×3 + comments×4 + shares×5. Cursor = offset.
 */
export async function trendingBlogs(opts: {
  topic?: string
  cursor?: string
  limit: number
}): Promise<FeedPage> {
  const offset = Math.max(0, Number.parseInt(opts.cursor ?? "0", 10) || 0)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const ranked = await prisma.$queryRaw<{ id: string }[]>`
    SELECT b.id FROM "blog" b
    WHERE b.status = 'PUBLISHED' AND b."publishedAt" >= ${since}
      AND (${opts.topic ?? null}::text IS NULL OR EXISTS (
        SELECT 1 FROM "blog_topic" bt JOIN "topic" t ON t.id = bt."topicId"
        WHERE bt."blogId" = b.id AND t.slug = ${opts.topic ?? null}
      ))
    ORDER BY (b."readsCount" + b."likesCount" * 3 + b."commentsCount" * 4 + b."sharesCount" * 5) DESC,
             b."publishedAt" DESC, b.id DESC
    LIMIT ${opts.limit + 1} OFFSET ${offset}
  `
  const hasMore = ranked.length > opts.limit
  const ids = ranked.slice(0, opts.limit).map((r) => r.id)
  if (!ids.length) return { data: [], nextCursor: null }

  const rows = await prisma.blog.findMany({ where: { id: { in: ids } }, select: cardSelect })
  const byId = new Map(rows.map((r) => [r.id, r]))
  return {
    data: ids.flatMap((id) => (byId.has(id) ? [toBlogCard(byId.get(id)!)] : [])),
    nextCursor: hasMore ? String(offset + opts.limit) : null,
  }
}

/** E8 — home feed. */
export function getFeed(opts: {
  sort: "latest" | "trending"
  topic?: string
  cursor?: string
  limit: number
}) {
  return opts.sort === "trending" ? trendingBlogs(opts) : latestBlogs(opts)
}

/** E14 — a published blog by slug, with the viewer's state. Null for drafts/unknown. */
export const getBlogDetail = cache(
  async (slug: string, viewerId?: string | null): Promise<BlogDetail | null> => {
    const row = await prisma.blog.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { ...cardSelect, content: true, updatedAt: true, authorId: true },
    })
    if (!row) return null

    const [liked, subscribed] = viewerId
      ? await Promise.all([
          prisma.like.findUnique({
            where: { userId_blogId: { userId: viewerId, blogId: row.id } },
            select: { id: true },
          }),
          prisma.subscription.findUnique({
            where: {
              subscriberId_authorId: { subscriberId: viewerId, authorId: row.authorId },
            },
            select: { id: true },
          }),
        ])
      : [null, null]

    return {
      ...toBlogCard(row),
      content: (row.content as unknown as EditorJsData) ?? { blocks: [] },
      updatedAt: row.updatedAt.toISOString(),
      viewer: {
        liked: Boolean(liked),
        isAuthor: viewerId === row.authorId,
        subscribedToAuthor: Boolean(subscribed),
      },
    }
  }
)

/** Up to 3 recent blogs sharing a topic with this one, then any recent ones. */
export async function relatedBlogs(blog: BlogCard, limit = 3) {
  const slugs = blog.topics.map((t) => t.slug)
  const byTopic = slugs.length
    ? await prisma.blog.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: blog.id },
          topics: { some: { topic: { slug: { in: slugs } } } },
        },
        orderBy: { publishedAt: "desc" },
        select: cardSelect,
        take: limit,
      })
    : []
  if (byTopic.length >= limit) return byTopic.map(toBlogCard)

  const rest = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: [blog.id, ...byTopic.map((b) => b.id)] },
    },
    orderBy: { publishedAt: "desc" },
    select: cardSelect,
    take: limit - byTopic.length,
  })
  return [...byTopic, ...rest].map(toBlogCard)
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * E19 — count a read unless the viewer is the author or this visitor already
 * read it in the last 24 h (FR-READ-04).
 */
export async function recordRead(
  blogId: string,
  visitorId: string,
  viewerId: string | null
) {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, status: "PUBLISHED" },
    select: { authorId: true, readsCount: true },
  })
  if (!blog) return null
  if (viewerId && viewerId === blog.authorId) {
    return { counted: false, readsCount: blog.readsCount }
  }

  const recent = await prisma.read.findFirst({
    where: { blogId, visitorId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    select: { id: true },
  })
  if (recent) return { counted: false, readsCount: blog.readsCount }

  const [, updated] = await prisma.$transaction([
    prisma.read.create({ data: { blogId, visitorId, userId: viewerId } }),
    prisma.blog.update({
      where: { id: blogId },
      data: { readsCount: { increment: 1 } },
      select: { readsCount: true },
    }),
  ])
  return { counted: true, readsCount: updated.readsCount }
}
