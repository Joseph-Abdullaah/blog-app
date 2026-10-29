"use client"

import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import type { CommentDTO } from "@/types/dto"
import { useEngagement } from "./blog-engagement"
import { CommentComposer } from "./comment-composer"
import { CommentItem } from "./comment-item"

type Envelope<T> = {
  data?: T
  meta?: { nextCursor: string | null }
  error?: { message: string }
}

async function api<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  })
  const body = (await res.json().catch(() => ({}))) as Envelope<T>
  if (!res.ok || body.data === undefined) {
    throw new Error(body.error?.message ?? "Something went wrong. Try again.")
  }
  return body
}

const toItem = (c: CommentDTO) => ({
  id: c.id,
  author: c.author,
  time: c.createdAt,
  content: c.content,
  canDelete: c.canDelete,
})

type Thread = {
  comment: CommentDTO
  replies: CommentDTO[]
  repliesCursor: string | null
  repliesLoaded: boolean
}

const toThread = (comment: CommentDTO): Thread => ({
  comment,
  replies: [],
  repliesCursor: null,
  repliesLoaded: false,
})

/** Comments and one-level replies for a blog (FR-CMT-01…05). */
export function CommentsSection({
  initial,
  initialCursor,
}: {
  initial: CommentDTO[]
  initialCursor: string | null
}) {
  const engagement = useEngagement()!
  const { blogId, signedIn, slug } = engagement

  const [threads, setThreads] = React.useState(() => initial.map(toThread))
  const [cursor, setCursor] = React.useState(initialCursor)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [replyTo, setReplyTo] = React.useState<{ threadId: string; parentId: string } | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; threadId: string } | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(`/blog/${slug}#comments`)}`

  async function post(content: string, parentId: string | null) {
    try {
      const { data } = await api<CommentDTO>(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      })
      const created = data!
      engagement.setComments((n) => n + 1)
      if (created.parentId) {
        setThreads((all) =>
          all.map((t) =>
            t.comment.id === created.parentId
              ? {
                  ...t,
                  comment: { ...t.comment, repliesCount: t.comment.repliesCount + 1 },
                  replies: [...t.replies, created],
                }
              : t
          )
        )
        setReplyTo(null)
      } else {
        setThreads((all) => [toThread(created), ...all])
      }
      return true
    } catch (error) {
      toast.add({ title: "Couldn't post", description: (error as Error).message, type: "error" })
      return false
    }
  }

  async function loadMore() {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const body = await api<CommentDTO[]>(`/api/blogs/${blogId}/comments?cursor=${cursor}`)
      setThreads((all) => {
        const seen = new Set(all.map((t) => t.comment.id))
        return [...all, ...body.data!.filter((c) => !seen.has(c.id)).map(toThread)]
      })
      setCursor(body.meta?.nextCursor ?? null)
    } catch (error) {
      toast.add({ title: "Couldn't load comments", description: (error as Error).message, type: "error" })
    } finally {
      setLoadingMore(false)
    }
  }

  async function loadReplies(threadId: string) {
    const thread = threads.find((t) => t.comment.id === threadId)
    if (!thread) return
    try {
      const query = thread.repliesCursor ? `?cursor=${thread.repliesCursor}` : ""
      const body = await api<CommentDTO[]>(`/api/comments/${threadId}/replies${query}`)
      setThreads((all) =>
        all.map((t) => {
          if (t.comment.id !== threadId) return t
          const seen = new Set(t.replies.map((r) => r.id))
          return {
            ...t,
            replies: [...t.replies, ...body.data!.filter((r) => !seen.has(r.id))],
            repliesCursor: body.meta?.nextCursor ?? null,
            repliesLoaded: true,
          }
        })
      )
    } catch (error) {
      toast.add({ title: "Couldn't load replies", description: (error as Error).message, type: "error" })
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const { data } = await api<{ deletedCount: number; commentsCount: number }>(
        `/api/comments/${pendingDelete.id}`,
        { method: "DELETE" }
      )
      engagement.setComments(data!.commentsCount)
      const { id, threadId } = pendingDelete
      setThreads((all) =>
        id === threadId
          ? all.filter((t) => t.comment.id !== id)
          : all.map((t) =>
              t.comment.id === threadId
                ? {
                    ...t,
                    comment: { ...t.comment, repliesCount: Math.max(0, t.comment.repliesCount - 1) },
                    replies: t.replies.filter((r) => r.id !== id),
                  }
                : t
            )
      )
      toast.add({ title: "Comment deleted", type: "success" })
      setPendingDelete(null)
    } catch (error) {
      toast.add({ title: "Couldn't delete", description: (error as Error).message, type: "error" })
    } finally {
      setDeleting(false)
    }
  }

  function startReply(threadId: string, parentId: string) {
    if (engagement.requireSignIn()) return
    setReplyTo({ threadId, parentId })
  }

  return (
    <section id="comments" className="mt-12 scroll-mt-24">
      <h2 className="mb-5 text-headline text-ink">Comments ({engagement.comments})</h2>

      {signedIn ? (
        <CommentComposer onSubmit={(content) => post(content, null)} />
      ) : (
        <p className="rounded-lg border border-hairline bg-surface-1 p-4 text-body-sm text-ink-subtle">
          <Button
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href={signInHref} />}
            nativeButton={false}
          >
            Sign in
          </Button>{" "}
          to join the conversation.
        </p>
      )}

      <div className="mt-8">
        {threads.length === 0 ? (
          <p className="py-6 text-center text-body-sm text-ink-subtle">
            No comments yet. Start the conversation.
          </p>
        ) : null}

        {threads.map((thread) => {
          const hiddenReplies = thread.comment.repliesCount - thread.replies.length
          return (
            <div key={thread.comment.id} className="border-t border-hairline">
              <CommentItem
                comment={toItem(thread.comment)}
                onReply={(id) => startReply(thread.comment.id, id)}
                onDelete={(id) => setPendingDelete({ id, threadId: thread.comment.id })}
              />

              {thread.replies.length || hiddenReplies > 0 || replyTo?.threadId === thread.comment.id ? (
                <div className="mb-4 ml-11 border-l border-hairline pl-4">
                  {thread.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={toItem(reply)}
                      onReply={(id) => startReply(thread.comment.id, id)}
                      onDelete={(id) => setPendingDelete({ id, threadId: thread.comment.id })}
                    />
                  ))}

                  {hiddenReplies > 0 && (!thread.repliesLoaded || thread.repliesCursor) ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="mb-2"
                      onClick={() => void loadReplies(thread.comment.id)}
                    >
                      {thread.repliesLoaded
                        ? "Load more replies"
                        : `View ${hiddenReplies} ${hiddenReplies === 1 ? "reply" : "replies"}`}
                    </Button>
                  ) : null}

                  {replyTo?.threadId === thread.comment.id ? (
                    <div className="py-3">
                      <CommentComposer
                        label={`Reply to ${thread.comment.author.name}`}
                        placeholder="Write a reply"
                        submitLabel="Reply"
                        successMessage="Reply posted"
                        autoFocus
                        onCancel={() => setReplyTo(null)}
                        onSubmit={(content) => post(content, replyTo.parentId)}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {cursor ? (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
            Load more comments
          </Button>
        </div>
      ) : null}

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this comment?</DialogTitle>
            <DialogDescription>
              Its replies will be deleted too. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button variant="destructive" loading={deleting} onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
