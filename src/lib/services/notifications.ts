import type { NotificationType, Prisma } from "../../../generated/prisma/client"
import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { authorSelect, toAuthor } from "@/lib/services/feed"
import type { NotificationDTO } from "@/types/dto"

/** List filters (FR-NOTF-02); "subscription" covers SUBSCRIBE and NEW_BLOG. */
export const NOTIFICATION_FILTERS = {
  all: undefined,
  like: ["LIKE"],
  comment: ["COMMENT"],
  reply: ["REPLY"],
  share: ["SHARE"],
  subscription: ["SUBSCRIBE", "NEW_BLOG"],
} as const satisfies Record<string, readonly NotificationType[] | undefined>

export type NotificationFilter = keyof typeof NOTIFICATION_FILTERS

const notificationSelect = {
  id: true,
  type: true,
  isRead: true,
  createdAt: true,
  actor: { select: authorSelect },
  blog: { select: { id: true, slug: true, title: true } },
  comment: {
    select: {
      id: true,
      content: true,
      parentId: true,
      parent: { select: { content: true } },
    },
  },
} satisfies Prisma.NotificationSelect

type Row = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>

function toDTO(row: Row): NotificationDTO {
  return {
    id: row.id,
    type: row.type,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
    actor: toAuthor(row.actor),
    blog: row.blog ? { id: row.blog.id, slug: row.blog.slug ?? "", title: row.blog.title } : null,
    comment: row.comment
      ? {
          id: row.comment.id,
          content: row.comment.content,
          parentId: row.comment.parentId,
          parentContent: row.comment.parent?.content ?? null,
        }
      : null,
  }
}

/** E27 — newest first, 10 per page by default. */
export async function listNotifications(
  userId: string,
  opts: { filter: NotificationFilter; cursor?: string; limit: number }
) {
  const types = NOTIFICATION_FILTERS[opts.filter]
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId, ...(types ? { type: { in: [...types] } } : {}) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: notificationSelect,
    take: opts.limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  })
  const hasMore = rows.length > opts.limit
  const page = rows.slice(0, opts.limit)
  return { data: page.map(toDTO), nextCursor: hasMore ? page[page.length - 1].id : null }
}

/** E28 */
export function unreadCount(userId: string) {
  return prisma.notification.count({ where: { recipientId: userId, isRead: false } })
}

/** E29 — 404 unless the viewer is the recipient. */
export async function markRead(userId: string, notificationId: string) {
  const { count } = await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { isRead: true },
  })
  if (!count) throw ApiError.notFound("Notification not found")
  return { id: notificationId, isRead: true as const }
}

/** E30 */
export async function markAllRead(userId: string) {
  const { count } = await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  })
  return { updated: count }
}
