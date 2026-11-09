import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { NotificationsList } from "@/components/screens/notifications-list"
import { requireUser } from "@/lib/auth-guards"
import { listNotifications, unreadCount } from "@/lib/services/notifications"

export const metadata: Metadata = { title: "Notifications" }

/** S-13 — the member's notifications (FR-NOTF-02…04). */
export default async function NotificationsPage() {
  const user = await requireUser("/dashboard/notifications")
  const [page, unread] = await Promise.all([
    listNotifications(user.id, { filter: "all", limit: 10 }),
    unreadCount(user.id),
  ])

  return (
    <DashboardShell
      user={{ name: user.name, username: user.username ?? "", image: user.image }}
      active="Notifications"
      unread={unread > 0}
      className="max-w-190"
    >
      <NotificationsList initial={page.data} initialCursor={page.nextCursor} />
    </DashboardShell>
  )
}
