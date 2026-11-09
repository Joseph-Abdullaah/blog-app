"use client"

import * as React from "react"

import { CommentItem } from "@/components/byline"
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

/** The 10 most recent comments with delete (FR-DASH-04). */
export function StatsComments({ initial }: { initial: CommentDTO[] }) {
  const [comments, setComments] = React.useState(initial)
  const [pending, setPending] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  async function confirm() {
    if (!pending) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/comments/${pending}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error()
      // Deleting a top-level comment also removes its replies.
      setComments((all) => all.filter((c) => c.id !== pending && c.parentId !== pending))
      toast.add({ title: "Comment deleted", type: "success" })
      setPending(null)
    } catch {
      toast.add({ title: "Couldn't delete the comment", type: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (!comments.length) {
    return <p className="py-4 text-body-sm text-ink-subtle">No comments yet.</p>
  }

  return (
    <>
      {comments.map((c) => (
        <div key={c.id} className="border-t border-hairline">
          <CommentItem
            comment={{
              id: c.id,
              author: c.author,
              time: c.createdAt,
              content: c.content,
              canDelete: c.canDelete,
            }}
            onDelete={setPending}
          />
        </div>
      ))}
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this comment?</DialogTitle>
            <DialogDescription>Its replies will be deleted too. This can’t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button variant="destructive" loading={deleting} onClick={() => void confirm()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
