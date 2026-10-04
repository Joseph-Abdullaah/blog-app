import Link from "next/link"

import { formatDate } from "@/lib/format"
import type { AuthorSummary, NotificationType } from "./types"
import { UnreadDot } from "./unread-dot"
import { UserAvatar } from "./user-avatar"

type NotificationData = {
  type: NotificationType
  isRead: boolean
  actor: AuthorSummary
  blog?: { title: string; slug?: string }
  comment?: string
  date: string | Date
}

const verbs: Record<NotificationType, string> = {
  LIKE: "liked",
  COMMENT: "commented on",
  REPLY: "replied to your comment on",
  SHARE: "shared",
  SUBSCRIBE: "subscribed to you",
  NEW_BLOG: "published",
}

/** Notification row: unread dot, actor, sentence, optional quote box, time. */
function NotificationItem({
  notification: n,
}: {
  notification: NotificationData
}) {
  const hasBlog = n.type !== "SUBSCRIBE" && n.blog

  return (
    <div className="flex items-start gap-3 border-b border-hairline py-4">
      <span className="flex h-8 w-2 items-center">
        {n.isRead ? null : <UnreadDot />}
      </span>
      <UserAvatar name={n.actor.name} src={n.actor.image} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-body text-ink-muted">
          <Link
            href={`/u/${n.actor.username}`}
            className="rounded-xs font-medium text-ink hover:underline"
          >
            {n.actor.name}
          </Link>{" "}
          {verbs[n.type]}
          {hasBlog ? (
            <>
              {" "}
              <Link
                href={`/blog/${n.blog!.slug ?? ""}`}
                className="rounded-xs font-medium text-ink hover:underline"
              >
                {n.blog!.title}
              </Link>
            </>
          ) : null}
        </p>
        {n.comment ? (
          <blockquote className="rounded-sm bg-surface-1 p-3 text-body-sm text-ink-muted">
            {n.comment}
          </blockquote>
        ) : null}
      </div>
      <span className="shrink-0 text-caption text-ink-subtle">
        {formatDate(n.date)}
      </span>
    </div>
  )
}

export { NotificationItem }
export type { NotificationData }
