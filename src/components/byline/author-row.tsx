import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import type { AuthorSummary } from "./types"
import { SubscribeButton } from "./subscribe-button"
import { UserAvatar } from "./user-avatar"

/** Reader byline: author, date · read time, and Subscribe (or Edit for the author). */
function AuthorRow({
  author,
  date,
  readTime,
  subscribed = false,
  isAuthor = false,
  editHref,
}: {
  author: AuthorSummary
  date: string | Date
  readTime: number
  subscribed?: boolean
  isAuthor?: boolean
  editHref?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${author.username}`} className="rounded-full">
        <UserAvatar name={author.name} src={author.image} size="xl" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/u/${author.username}`}
          className="truncate rounded-xs text-body font-medium text-ink hover:underline"
        >
          {author.name}
        </Link>
        <span className="truncate text-body-sm text-ink-subtle">
          @{author.username} · {formatDate(date)} · {readTime} min read
        </span>
      </div>
      {isAuthor ? (
        editHref ? (
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={editHref} />}
            nativeButton={false}
          >
            Edit
          </Button>
        ) : null
      ) : (
        <SubscribeButton subscribed={subscribed} name={author.name} />
      )}
    </div>
  )
}

export { AuthorRow }
