"use client"

import * as React from "react"
import { LayoutGridIcon, ListIcon } from "lucide-react"

import {
  BlogGridCard,
  BlogListItem,
  EmptyState,
  FilterChip,
} from "@/components/byline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toCardProps } from "@/lib/blog-cards"
import type { BlogCard, TopicDTO } from "@/types/dto"

type Sort = "latest" | "trending"
const PAGE_SIZE = 10

/** Home feed (S-01): Latest / Trending, topic chips, list / grid, infinite loading (E8). */
function HomeFeed({
  initialBlogs,
  initialCursor,
  topics,
}: {
  initialBlogs: BlogCard[]
  initialCursor: string | null
  topics: TopicDTO[]
}) {
  const [sort, setSort] = React.useState<Sort>("latest")
  const [topic, setTopic] = React.useState<string | null>(null)
  const [layout, setLayout] = React.useState("list")
  const [blogs, setBlogs] = React.useState(initialBlogs)
  const [cursor, setCursor] = React.useState(initialCursor)
  const [loading, setLoading] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const requestId = React.useRef(0)
  const sentinel = React.useRef<HTMLDivElement>(null)

  const load = React.useCallback(
    async (next: { sort: Sort; topic: string | null; cursor?: string | null }) => {
      const id = ++requestId.current
      setLoading(true)
      setFailed(false)
      const params = new URLSearchParams({ sort: next.sort, limit: String(PAGE_SIZE) })
      if (next.topic) params.set("topic", next.topic)
      if (next.cursor) params.set("cursor", next.cursor)
      try {
        const res = await fetch(`/api/blogs?${params}`)
        const body = (await res.json()) as {
          data?: BlogCard[]
          meta?: { nextCursor: string | null }
        }
        if (id !== requestId.current) return // a newer request replaced this one
        if (!res.ok || !body.data) throw new Error()
        setBlogs((prev) => (next.cursor ? [...prev, ...body.data!] : body.data!))
        setCursor(body.meta?.nextCursor ?? null)
      } catch {
        if (id === requestId.current) setFailed(true)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    []
  )

  function change(next: { sort?: Sort; topic?: string | null }) {
    const s = next.sort ?? sort
    const t = next.topic !== undefined ? next.topic : topic
    setSort(s)
    setTopic(t)
    setBlogs([])
    setCursor(null)
    void load({ sort: s, topic: t })
  }

  // Load the next page when the sentinel scrolls into view.
  React.useEffect(() => {
    const el = sentinel.current
    if (!el || !cursor || loading || failed) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void load({ sort, topic, cursor })
      },
      { rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, loading, failed, load, sort, topic])

  const cards = blogs.map(toCardProps)

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <Tabs
          value={sort}
          onValueChange={(value) => change({ sort: value as Sort })}
          className="min-w-0 flex-1"
        >
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>
        <ToggleGroup
          aria-label="Layout"
          value={[layout]}
          onValueChange={(v) => v[0] && setLayout(v[0])}
          spacing={1}
          className="mb-1.5 rounded-lg border border-hairline bg-surface-1 p-0.75"
        >
          <ToggleGroupItem value="list" aria-label="List layout">
            <ListIcon aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid layout">
            <LayoutGridIcon aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-5 pb-2 sm:mx-0 sm:px-0">
        <FilterChip
          selected={topic === null}
          onClick={() => change({ topic: null })}
          className="shrink-0"
        >
          All
        </FilterChip>
        {topics.slice(0, 7).map((t) => (
          <FilterChip
            key={t.id}
            selected={topic === t.slug}
            onClick={() => change({ topic: t.slug })}
            className="shrink-0"
          >
            {t.name}
          </FilterChip>
        ))}
      </div>

      {cards.length === 0 && !loading ? (
        failed ? (
          <EmptyState title="Couldn’t load stories" description="Check your connection and try again.">
            <Button variant="secondary" onClick={() => void load({ sort, topic })}>
              Try again
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            title="No stories yet"
            description={
              topic ? "Nothing in this topic yet. Try another one." : "Published stories will show up here."
            }
          />
        )
      ) : layout === "list" ? (
        <div>
          {cards.map((b) => (
            <BlogListItem key={b.id} blog={b} />
          ))}
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-8 pt-4 sm:grid-cols-2">
          {cards.map((b) => (
            <BlogGridCard key={b.id} blog={b} />
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3 py-6" aria-label="Loading stories">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : null}

      {failed && cards.length ? (
        <div className="flex justify-center pt-6">
          <Button variant="secondary" onClick={() => void load({ sort, topic, cursor })}>
            Load more
          </Button>
        </div>
      ) : null}

      <div ref={sentinel} aria-hidden />

      {!cursor && !loading && cards.length ? (
        <p className="pt-8 text-center text-body-sm text-ink-subtle">You’re all caught up</p>
      ) : null}
    </div>
  )
}

export { HomeFeed }
