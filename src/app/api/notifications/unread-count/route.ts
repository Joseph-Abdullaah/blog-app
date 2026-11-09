import { handler, ok, requireApiUser } from "@/lib/api"
import { unreadCount } from "@/lib/services/notifications"

/** E28 — unread count for the navbar badge (FR-NOTF-03). */
export const GET = handler(async () => {
  const user = await requireApiUser()
  return ok({ count: await unreadCount(user.id) })
})
