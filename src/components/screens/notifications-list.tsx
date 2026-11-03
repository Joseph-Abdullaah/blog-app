"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"

import { EmptyState, FilterChip, NotificationItem } from "@/components/byline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import type { NotificationDTO } from "@/types/dto"

type Filter = "all" | "like" | "comment" | "reply" | "share" | "subscription"

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Like", value: "like" },
  { label: "Comment", value: "comment" },
  { label: "Reply", value: "reply" },
  { label: "Share", value: "share" },
  { label: "Subscription", value: "subscription" },
]

type Page = { data?: NotificationDTO[]; meta?: { nextCursor: string | null } }

/** Tell the navbar bell to refresh its unread count. */
const notifyBell = () => window.dispatchEvent(new Event("byline:notifications-changed"))

function toItem(n: NotificationDTO) {
  return {
    type: n.type,
    isRead: n.isRead,
    actor: n.actor,
    blog: n.blog ? { title: n.blog.title, slug: n.blog.slug } : undefined,
    comment: n.comment?.content,
    date: n.createdAt,
  }
}

/** S-13 notifications: type filters, load more, mark one / all as read (FR-NOTF-02/04). */
function NotificationsList({
  initial,
  initialCursor,
}: {
  initial: NotificationDTO[]
  initialCursor: string | null
}) {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [items, setItems] = React.useState(initial)
  const [cursor, setCursor] = React.useState(initialCursor)
  const [loading, setLoading] = React.useState(false)
  const [markingAll, setMarkingAll] = React.useState(false)
  const requestId = React.useRef(0)

  async function load(next: Filter, after?: string | null) {
    const id = ++requestId.current
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: next, limit: "10" })
      if (after) params.set("cursor", after)
      const res = await fetch(`/api/notifications?${params}`)
      const body = (await res.json()) as Page
      if (id !== requestId.current) return
      if (!res.ok || !body.data) throw new Error()
      setItems((prev) => (after ? [...prev, ...body.data!] : body.data!))
      setCursor(body.meta?.nextCursor ?? null)
    } catch {
      if (id === requestId.current) {
        toast.add({ title: "Couldn't load notifications", type: "error" })
      }
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  function changeFilter(next: Filter) {
    setFilter(next)
    setItems([])
    setCursor(null)
    void load(next)
  }

  async function markRead(id: string) {
    const target = items.find((n) => n.id === id)
    if (!target || target.isRead) return
    setItems((all) => all.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    // keepalive: the click usually navigates away.
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH", keepalive: true }).catch(() => {})
    notifyBell()
  }

  async function markAll() {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" })
      if (!res.ok) throw new Error()
      setItems((all) => all.map((n) => ({ ...n, isRead: true })))
      notifyBell()
    } catch {
      toast.add({ title: "Couldn't mark notifications as read", type: "error" })
    } finally {
      setMarkingAll(false)
    }
  }

  const hasUnread = items.some((n) => !n.isRead)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-title-sm text-ink">Recent Notifications</h1>
        <Button
          variant="ghost"
          size="sm"
          loading={markingAll}
          disabled={!hasUnread}
          onClick={() => void markAll()}
        >
          Mark all as read
        </Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <FilterChip
            key={f.value}
            selected={filter === f.value}
            onClick={() => changeFilter(f.value)}
          >
            {f.label}
          </FilterChip>
        ))}
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={BellIcon}
          title="Nothing here yet"
          description="Likes, comments, replies, shares and new subscribers will show up here."
        />
      ) : (
        <div className="flex flex-col border-l-2 border-hairline-strong pl-4 sm:pl-5">
          {items.map((n) => (
            // Any link inside the row marks it read (FR-NOTF-04).
            <div
              key={n.id}
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) void markRead(n.id)
              }}
            >
              <NotificationItem notification={toItem(n)} />
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3 py-6" aria-label="Loading notifications">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6" />
        </div>
      ) : null}

      {cursor && !loading ? (
        <div className="flex justify-center pt-6">
          <Button variant="secondary" onClick={() => void load(filter, cursor)}>
            Load more
          </Button>
        </div>
      ) : null}
    </>
  )
}

export { NotificationsList }
