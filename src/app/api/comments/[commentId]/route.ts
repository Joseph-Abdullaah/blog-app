import { handler, ok, requireApiUser } from "@/lib/api"
import { deleteComment } from "@/lib/services/comments"

type Context = { params: Promise<{ commentId: string }> }

/** E24 — delete a comment (its author or the blog's author). */
export const DELETE = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { commentId } = await params
  return ok(await deleteComment(user.id, commentId))
})
