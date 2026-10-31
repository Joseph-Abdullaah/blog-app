import { handler, ok, requireApiUser } from "@/lib/api"
import { subscribe, unsubscribe } from "@/lib/services/users"

type Context = { params: Promise<{ username: string }> }

/** E6 — subscribe (idempotent; 403 for yourself). */
export const PUT = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { username } = await params
  return ok(await subscribe(user.id, username))
})

/** E7 — unsubscribe (idempotent). */
export const DELETE = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { username } = await params
  return ok(await unsubscribe(user.id, username))
})
