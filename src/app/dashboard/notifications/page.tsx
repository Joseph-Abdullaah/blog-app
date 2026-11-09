import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { NotificationsList } from "@/components/screens/notifications-list"
import { currentUser, notifications } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Notifications" }

export default function NotificationsPage() {
  return (
    <DashboardShell
      user={currentUser}
      active="Notifications"
      unread
      className="max-w-190"
    >
      <NotificationsList items={notifications} />
    </DashboardShell>
  )
}
