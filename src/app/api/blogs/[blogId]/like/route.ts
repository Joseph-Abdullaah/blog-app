import { handler, ok, requireApiUser } from "@/lib/api"
import { likeBlog, unlikeBlog } from "@/lib/services/interactions"

type Context = { params: Promise<{ blogId: string }> }

/** E17 — like (idempotent; 403 on your own blog). */
export const PUT = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  return ok(await likeBlog(user.id, blogId))
})

/** E18 — unlike (idempotent). */
export const DELETE = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  return ok(await unlikeBlog(user.id, blogId))
})
