import { requireUser } from "@/lib/auth-guards"
import { unreadCount } from "@/lib/services/notifications"

/** Signed-in user and unread state for `DashboardShell` (redirects guests to sign-in). */
export async function dashboardContext(path: string) {
  const user = await requireUser(path)
  const unread = await unreadCount(user.id)
  return {
    user,
    shellUser: { name: user.name, username: user.username ?? "", image: user.image },
    unread: unread > 0,
  }
}
