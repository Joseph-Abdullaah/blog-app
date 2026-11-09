"use client"

import { BellIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import { IconButton } from "./icon-button"

const POLL_MS = 30_000

/** "99+" above 99 (FR-NOTF-03). */
export const formatUnread = (count: number) => (count > 99 ? "99+" : String(count))

/**
 * Navbar bell with the unread dot. Polls the unread count every 30 s and when
 * the window regains focus (FR-NOTF-03).
 */
export function NotificationBell({ initialCount = 0 }: { initialCount?: number }) {
  const pathname = usePathname()
  const [count, setCount] = React.useState(initialCount)

  React.useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const res = await fetch("/api/notifications/unread-count")
        if (!res.ok) return
        const body = (await res.json()) as { data?: { count: number } }
        if (!cancelled && body.data) setCount(body.data.count)
      } catch {
        // Offline or signed out: keep the last known count.
      }
    }

    void refresh()
    const timer = setInterval(refresh, POLL_MS)
    window.addEventListener("focus", refresh)
    // Notifications page marks items read; let it tell the bell.
    window.addEventListener("byline:notifications-changed", refresh)
    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener("focus", refresh)
      window.removeEventListener("byline:notifications-changed", refresh)
    }
  }, [pathname])

  return (
    <IconButton
      icon={BellIcon}
      label={count ? `Notifications (${formatUnread(count)} unread)` : "Notifications"}
      href="/dashboard/notifications"
      dot={count > 0}
      filled
    />
  )
}
