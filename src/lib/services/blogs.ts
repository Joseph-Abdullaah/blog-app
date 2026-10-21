import type { Prisma } from "../../../generated/prisma/client"
import { readTimeMinutes } from "@/lib/editor/read-time"
import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { replaceBlogTopics, topicSelect } from "@/lib/services/topics"
import { blogSlug } from "@/lib/slug"
import type { DraftBlogValues, PublishBlogValues } from "@/lib/validations/blog"
import type { EditableBlog, EditorJsData } from "@/types/dto"

export const EMPTY_CONTENT: EditorJsData = { blocks: [] }

const editableSelect = {
  id: true,
  slug: true,
  status: true,
  title: true,
  description: true,
  bannerUrl: true,
  content: true,
  publishedAt: true,
  updatedAt: true,
  topics: { select: { topic: { select: topicSelect } } },
} satisfies Prisma.BlogSelect

type EditableRow = Prisma.BlogGetPayload<{ select: typeof editableSelect }>

export function toEditableBlog(row: EditableRow): EditableBlog {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    description: row.description,
    bannerUrl: row.bannerUrl,
    content: (row.content as unknown as EditorJsData) ?? EMPTY_CONTENT,
    topics: row.topics.map((t) => t.topic),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** E10 — the blog if `userId` owns it, else null (no existence leak, FR-EDIT-08). */
export async function getEditableBlog(userId: string, blogId: string) {
  const row = await prisma.blog.findFirst({
    where: { id: blogId, authorId: userId },
    select: editableSelect,
  })
  return row ? toEditableBlog(row) : null
}

/** Only the fields present in the request are written. */
function draftData(input: DraftBlogValues) {
  const data: Prisma.BlogUncheckedUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl
  if (input.content !== undefined) {
    data.content = input.content as unknown as Prisma.InputJsonValue
  }
  return data
}

/** E9 — create a draft (FR-EDIT-01/05). */
export async function createDraft(userId: string, input: DraftBlogValues) {
  const id = await prisma.$transaction(async (tx) => {
    const blog = await tx.blog.create({
      data: {
        ...(draftData(input) as Prisma.BlogUncheckedCreateInput),
        authorId: userId,
        status: "DRAFT",
      },
      select: { id: true },
    })
    if (input.topics?.length) await replaceBlogTopics(tx, blog.id, input.topics)
    return blog.id
  })
  return (await getEditableBlog(userId, id))!
}

/** E11 — save a draft. Published blogs must go through publish (409). */
export async function saveDraft(
  userId: string,
  blogId: string,
  input: DraftBlogValues
) {
  const where = { id: blogId, authorId: userId, status: "DRAFT" as const }

  // Fast path: one conditional update that returns the blog.
  if (input.topics === undefined) {
    try {
      const row = await prisma.blog.update({
        where,
        data: draftData(input),
        select: editableSelect,
      })
      return toEditableBlog(row)
    } catch (error) {
      if (!isNotFound(error)) throw error
      throw await whyNotEditable(userId, blogId)
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.blog.updateMany({ where, data: draftData(input) })
    if (count === 0) return false
    await replaceBlogTopics(tx, blogId, input.topics!)
    return true
  })
  if (!updated) throw await whyNotEditable(userId, blogId)
  return (await getEditableBlog(userId, blogId))!
}

/** 404 when missing or not the owner, 409 when it's already published. */
async function whyNotEditable(userId: string, blogId: string) {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, authorId: userId },
    select: { status: true },
  })
  return blog
    ? ApiError.conflict("This blog is published. Use Update to change it.")
    : ApiError.notFound("Blog not found")
}

/** Prisma "record to update not found". */
function isNotFound(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2025"
}

/**
 * E12 — publish, or update a published blog, in one transaction (FR-PUB-03…08).
 * First publish sets the slug and publishedAt and notifies subscribers;
 * updates keep both and send no notifications.
 */
export async function publishBlog(
  userId: string,
  blogId: string,
  input: PublishBlogValues
) {
  const existing = await prisma.blog.findFirst({
    where: { id: blogId, authorId: userId },
    select: { status: true, slug: true },
  })
  if (!existing) throw ApiError.notFound("Blog not found")

  const firstPublish = existing.status === "DRAFT"
  const slug = existing.slug ?? blogSlug(input.title)

  await prisma.$transaction(
    async (tx) => {
      await tx.blog.update({
        where: { id: blogId },
        data: {
          title: input.title,
          description: input.description,
          bannerUrl: input.bannerUrl,
          content: input.content as unknown as Prisma.InputJsonValue,
          readTimeMinutes: readTimeMinutes(input.content),
          status: "PUBLISHED",
          ...(firstPublish ? { slug, publishedAt: new Date() } : {}),
        },
      })
      await replaceBlogTopics(tx, blogId, input.topics)

      if (firstPublish) {
        const subscribers = await tx.subscription.findMany({
          where: { authorId: userId },
          select: { subscriberId: true },
        })
        if (subscribers.length) {
          await tx.notification.createMany({
            data: subscribers.map(({ subscriberId }) => ({
              type: "NEW_BLOG" as const,
              recipientId: subscriberId,
              actorId: userId,
              blogId,
            })),
          })
        }
      }
    },
    { timeout: 20_000 }
  )

  return { id: blogId, slug, status: "PUBLISHED" as const, firstPublish }
}
