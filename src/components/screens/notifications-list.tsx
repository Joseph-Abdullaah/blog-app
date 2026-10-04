"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"

import {
  EmptyState,
  FilterChip,
  NotificationItem,
  type NotificationType,
} from "@/components/byline"
import { Button } from "@/components/ui/button"
import type { MockNotification } from "@/lib/mock-data"

const filters: { label: string; type?: NotificationType }[] = [
  { label: "All" },
  { label: "Like", type: "LIKE" },
  { label: "Comment", type: "COMMENT" },
  { label: "Reply", type: "REPLY" },
  { label: "Share", type: "SHARE" },
  { label: "Subscription", type: "SUBSCRIBE" },
]

/** Notifications with type filters and "Mark all as read". */
function NotificationsList({ items }: { items: MockNotification[] }) {
  const [filter, setFilter] = React.useState("All")
  const [read, setRead] = React.useState(false)

  const type = filters.find((f) => f.label === filter)?.type
  const visible = items.filter((n) => !type || n.type === type)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-title-sm text-ink">Recent Notifications</h1>
        <Button variant="ghost" size="sm" onClick={() => setRead(true)}>
          Mark all as read
        </Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <FilterChip
            key={f.label}
            selected={filter === f.label}
            onClick={() => setFilter(f.label)}
          >
            {f.label}
          </FilterChip>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="Nothing here yet"
          description="New activity will show up in this list."
        />
      ) : (
        <div className="flex flex-col border-l-2 border-hairline-strong pl-4 sm:pl-5">
          {visible.map((n) => (
            <NotificationItem
              key={n.id}
              notification={{ ...n, isRead: read || n.isRead }}
            />
          ))}
        </div>
      )}
    </>
  )
}

export { NotificationsList }
