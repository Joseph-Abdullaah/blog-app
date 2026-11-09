import type { Prisma } from "../../../generated/prisma/client"
import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { authorSelect, toAuthor } from "@/lib/services/feed"
import type { CommentDTO } from "@/types/dto"

const commentSelect = {
  id: true,
  blogId: true,
  parentId: true,
  content: true,
  createdAt: true,
  authorId: true,
  author: { select: authorSelect },
  blog: { select: { authorId: true } },
  _count: { select: { replies: true } },
} satisfies Prisma.CommentSelect

type CommentRow = Prisma.CommentGetPayload<{ select: typeof commentSelect }>

export function toCommentDTO(row: CommentRow, viewerId: string | null): CommentDTO {
  return {
    id: row.id,
    blogId: row.blogId,
    parentId: row.parentId,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    author: toAuthor(row.author),
    repliesCount: row._count.replies,
    // The comment's author or the blog's author may delete it (FR-CMT-04).
    canDelete: Boolean(viewerId) && (viewerId === row.authorId || viewerId === row.blog.authorId),
  }
}

type Page = { cursor?: string; limit: number }

/** E21 — top-level comments of a published blog, newest first (FR-CMT-03). */
export async function listComments(blogId: string, page: Page, viewerId: string | null) {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, status: "PUBLISHED" },
    select: { id: true },
  })
  if (!blog) throw ApiError.notFound("Blog not found")

  const rows = await prisma.comment.findMany({
    where: { blogId, parentId: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: commentSelect,
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  })
  return paginate(rows, page.limit, viewerId)
}

/** E23 — replies to a comment, oldest first (FR-CMT-03). */
export async function listReplies(commentId: string, page: Page, viewerId: string | null) {
  const parent = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } })
  if (!parent) throw ApiError.notFound("Comment not found")

  const rows = await prisma.comment.findMany({
    where: { parentId: commentId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: commentSelect,
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  })
  return paginate(rows, page.limit, viewerId)
}

function paginate(rows: CommentRow[], limit: number, viewerId: string | null) {
  const hasMore = rows.length > limit
  const items = rows.slice(0, limit)
  return {
    data: items.map((r) => toCommentDTO(r, viewerId)),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  }
}

/**
 * E22 — comment or reply. A reply to a reply is attached to its top-level
 * comment (one level deep). Notifies the blog author (COMMENT) or the parent
 * comment's author (REPLY), never yourself (FR-CMT-01/02).
 */
export async function createComment(
  userId: string,
  blogId: string,
  content: string,
  parentId?: string | null
) {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, status: "PUBLISHED" },
    select: { authorId: true },
  })
  if (!blog) throw ApiError.notFound("Blog not found")

  let parent: { id: string; authorId: string } | null = null
  if (parentId) {
    const target = await prisma.comment.findFirst({
      where: { id: parentId, blogId },
      select: { id: true, authorId: true, parent: { select: { id: true, authorId: true } } },
    })
    if (!target) throw ApiError.notFound("The comment you're replying to no longer exists")
    parent = target.parent ?? { id: target.id, authorId: target.authorId }
  }

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: { blogId, authorId: userId, parentId: parent?.id ?? null, content },
      select: commentSelect,
    })
    await tx.blog.update({
      where: { id: blogId },
      data: { commentsCount: { increment: 1 } },
    })

    const recipientId = parent ? parent.authorId : blog.authorId
    if (recipientId !== userId) {
      await tx.notification.create({
        data: {
          type: parent ? "REPLY" : "COMMENT",
          recipientId,
          actorId: userId,
          blogId,
          commentId: created.id,
        },
      })
    }
    return created
  })

  return toCommentDTO(row, userId)
}

/**
 * E24 — delete a comment (its author or the blog's author). Replies and
 * notifications cascade; commentsCount drops by 1 + replies (FR-CMT-04).
 */
export async function deleteComment(userId: string, commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      blogId: true,
      authorId: true,
      blog: { select: { authorId: true } },
      _count: { select: { replies: true } },
    },
  })
  if (!comment) throw ApiError.notFound("Comment not found")
  if (comment.authorId !== userId && comment.blog.authorId !== userId) {
    throw ApiError.forbidden("You can't delete this comment")
  }

  const deletedCount = 1 + comment._count.replies
  const [, blog] = await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.blog.update({
      where: { id: comment.blogId },
      data: { commentsCount: { decrement: deletedCount } },
      select: { commentsCount: true },
    }),
  ])
  return { deletedCount, commentsCount: blog.commentsCount }
}
