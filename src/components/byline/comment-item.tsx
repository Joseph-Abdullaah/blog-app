"use client"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import type { AuthorSummary } from "./types"
import { UserAvatar } from "./user-avatar"

type CommentData = {
  id: string
  author: AuthorSummary
  time: string | Date
  content: string
  canDelete?: boolean
}

/** Comment with body in serif; replies indent 44px behind a hairline rule. */
function CommentItem({
  comment,
  replies,
  onReply,
  onDelete,
}: {
  comment: CommentData
  replies?: CommentData[]
  onReply?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center gap-2 text-body-sm">
        <UserAvatar name={comment.author.name} src={comment.author.image} />
        <span className="font-medium text-ink">{comment.author.name}</span>
        <span className="text-ink-subtle">{formatDate(comment.time)}</span>
      </div>
      <p className="font-serif text-reading-sm text-ink-muted">
        {comment.content}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="xs" onClick={() => onReply?.(comment.id)}>
          Reply
        </Button>
        {comment.canDelete ? (
          <Button
            variant="ghost"
            size="xs"
            className="text-danger hover:text-danger"
            onClick={() => onDelete?.(comment.id)}
          >
            Delete
          </Button>
        ) : null}
      </div>
      {replies?.length ? (
        <div className="ml-11 border-l border-hairline pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { CommentItem }
export type { CommentData }
