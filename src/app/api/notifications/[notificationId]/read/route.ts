import { handler, ok, requireApiUser } from "@/lib/api"
import { markRead } from "@/lib/services/notifications"

type Context = { params: Promise<{ notificationId: string }> }

/** E29 — mark one notification read; 404 unless you're the recipient. */
export const PATCH = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { notificationId } = await params
  return ok(await markRead(user.id, notificationId))
})
