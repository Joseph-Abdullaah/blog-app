import { handler, ok, requireApiUser } from "@/lib/api"
import { markAllRead } from "@/lib/services/notifications"

/** E30 — mark every notification read (FR-NOTF-04). */
export const PATCH = handler(async () => {
  const user = await requireApiUser()
  return ok(await markAllRead(user.id))
})
