import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import type { ShareChannel } from "@/types/dto"

/** A published blog's author and counters, or 404 (likes/shares need a live blog). */
async function publishedBlog(blogId: string) {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, status: "PUBLISHED" },
    select: { id: true, authorId: true },
  })
  if (!blog) throw ApiError.notFound("Blog not found")
  return blog
}

/* ─────────────── Likes (E17/E18) ─────────────── */

/** Idempotent like: Like + likesCount + LIKE notification (FR-LIKE-01/02). */
export async function likeBlog(userId: string, blogId: string) {
  const blog = await publishedBlog(blogId)
  if (blog.authorId === userId) throw ApiError.forbidden("You can't like your own blog")

  return prisma.$transaction(async (tx) => {
    const created = await tx.like.createMany({
      data: [{ userId, blogId }],
      skipDuplicates: true,
    })
    if (created.count === 0) {
      const { likesCount } = await tx.blog.findUniqueOrThrow({
        where: { id: blogId },
        select: { likesCount: true },
      })
      return { liked: true, likesCount }
    }
    const { likesCount } = await tx.blog.update({
      where: { id: blogId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    })
    await tx.notification.create({
      data: { type: "LIKE", recipientId: blog.authorId, actorId: userId, blogId },
    })
    return { liked: true, likesCount }
  })
}

/** Idempotent unlike: reverses the like, the counter and the notification. */
export async function unlikeBlog(userId: string, blogId: string) {
  await publishedBlog(blogId)

  return prisma.$transaction(async (tx) => {
    const removed = await tx.like.deleteMany({ where: { userId, blogId } })
    if (removed.count === 0) {
      const { likesCount } = await tx.blog.findUniqueOrThrow({
        where: { id: blogId },
        select: { likesCount: true },
      })
      return { liked: false, likesCount }
    }
    const { likesCount } = await tx.blog.update({
      where: { id: blogId },
      data: { likesCount: { decrement: 1 } },
      select: { likesCount: true },
    })
    await tx.notification.deleteMany({
      where: { type: "LIKE", actorId: userId, blogId },
    })
    return { liked: false, likesCount }
  })
}

/* ─────────────── Shares (E20) ─────────────── */

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Every share counts (FR-SHR-02). A SHARE notification is sent only for a
 * signed-in sharer who isn't the author, once per 24 h per blog (FR-SHR-03).
 */
export async function recordShare(
  blogId: string,
  channel: ShareChannel,
  visitorId: string,
  userId: string | null
) {
  const blog = await publishedBlog(blogId)

  return prisma.$transaction(async (tx) => {
    await tx.share.create({ data: { blogId, channel, visitorId, userId } })
    const { sharesCount } = await tx.blog.update({
      where: { id: blogId },
      data: { sharesCount: { increment: 1 } },
      select: { sharesCount: true },
    })

    if (userId && userId !== blog.authorId) {
      const recent = await tx.notification.findFirst({
        where: {
          type: "SHARE",
          actorId: userId,
          blogId,
          createdAt: { gte: new Date(Date.now() - DAY_MS) },
        },
        select: { id: true },
      })
      if (!recent) {
        await tx.notification.create({
          data: { type: "SHARE", recipientId: blog.authorId, actorId: userId, blogId },
        })
      }
    }
    return { sharesCount }
  })
}
