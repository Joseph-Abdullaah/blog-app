import type { Prisma } from "../../../generated/prisma/client"
import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { toCommentDTO } from "@/lib/services/comments"
import { authorSelect } from "@/lib/services/feed"
import type { BlogStats, BlogStatus, DashboardBlog, ShareChannel } from "@/types/dto"

const dashboardSelect = {
  id: true,
  slug: true,
  status: true,
  title: true,
  bannerUrl: true,
  likesCount: true,
  commentsCount: true,
  readsCount: true,
  sharesCount: true,
  publishedAt: true,
  updatedAt: true,
} satisfies Prisma.BlogSelect

type Row = Prisma.BlogGetPayload<{ select: typeof dashboardSelect }>

const toDashboardBlog = (row: Row): DashboardBlog => ({
  ...row,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  updatedAt: row.updatedAt.toISOString(),
})

/**
 * E15 — the member's blogs for one tab (FR-DASH-01): published by publishedAt
 * desc, drafts by updatedAt desc, optional title search.
 */
export async function listMyBlogs(
  userId: string,
  opts: { status: BlogStatus; q?: string; cursor?: string; limit: number }
) {
  const rows = await prisma.blog.findMany({
    where: {
      authorId: userId,
      status: opts.status,
      ...(opts.q ? { title: { contains: opts.q, mode: "insensitive" } } : {}),
    },
    orderBy:
      opts.status === "PUBLISHED"
        ? [{ publishedAt: "desc" }, { id: "desc" }]
        : [{ updatedAt: "desc" }, { id: "desc" }],
    select: dashboardSelect,
    take: opts.limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  })
  const hasMore = rows.length > opts.limit
  const page = rows.slice(0, opts.limit)
  return {
    data: page.map(toDashboardBlog),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

/**
 * E13 — delete a blog the member owns. Likes, comments, reads, shares, topic
 * links and notifications cascade; orphaned topics stay (FR-DASH-03).
 */
export async function deleteBlog(userId: string, blogId: string) {
  const { count } = await prisma.blog.deleteMany({ where: { id: blogId, authorId: userId } })
  if (!count) throw ApiError.notFound("Blog not found")
}

const CHANNELS: ShareChannel[] = ["COPY_LINK", "X", "FACEBOOK", "LINKEDIN", "WHATSAPP", "EMAIL"]
const DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** YYYY-MM-DD in UTC. */
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/** E16 — totals, 30 days of reads (zero-filled), shares by channel, recent comments (FR-DASH-04). */
export async function blogStats(userId: string, blogId: string): Promise<BlogStats | null> {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, authorId: userId },
    select: { likesCount: true, commentsCount: true, readsCount: true, sharesCount: true },
  })
  if (!blog) return null

  const today = new Date()
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - (DAYS - 1) * DAY_MS
  )

  const [reads, shares, comments] = await Promise.all([
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
             COUNT(*)::int AS count
      FROM "read"
      WHERE "blogId" = ${blogId} AND "createdAt" >= ${start}
      GROUP BY 1
    `,
    prisma.share.groupBy({ by: ["channel"], where: { blogId }, _count: { _all: true } }),
    prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        blogId: true,
        parentId: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: { select: authorSelect },
        blog: { select: { authorId: true } },
        _count: { select: { replies: true } },
      },
    }),
  ])

  const readsByDayMap = new Map(reads.map((r) => [r.day, r.count]))
  const sharesMap = new Map(shares.map((s) => [s.channel, s._count._all]))

  return {
    totals: {
      reads: blog.readsCount,
      likes: blog.likesCount,
      comments: blog.commentsCount,
      shares: blog.sharesCount,
    },
    readsByDay: Array.from({ length: DAYS }, (_, i) => {
      const date = isoDay(new Date(start.getTime() + i * DAY_MS))
      return { date, count: readsByDayMap.get(date) ?? 0 }
    }),
    sharesByChannel: CHANNELS.map((channel) => ({ channel, count: sharesMap.get(channel) ?? 0 })),
    recentComments: comments.map((c) => toCommentDTO(c, userId)),
  }
}

/** Title and slug for the stats page header. */
export function ownedBlogSummary(userId: string, blogId: string) {
  return prisma.blog.findFirst({
    where: { id: blogId, authorId: userId },
    select: { id: true, title: true, slug: true, status: true },
  })
}
