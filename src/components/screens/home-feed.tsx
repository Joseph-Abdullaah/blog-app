"use client"

import * as React from "react"
import { LayoutGridIcon, ListIcon } from "lucide-react"

import {
  BlogGridCard,
  BlogListItem,
  EmptyState,
  FilterChip,
} from "@/components/byline"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { MockBlog } from "@/lib/mock-data"

/** Home feed: Latest / Trending tabs, topic filter chips and a list / grid toggle. */
function HomeFeed({
  blogs,
  topics,
}: {
  blogs: MockBlog[]
  topics: string[]
}) {
  const [tab, setTab] = React.useState("latest")
  const [topic, setTopic] = React.useState("All")
  const [layout, setLayout] = React.useState("list")

  const visible = blogs
    .filter((b) => topic === "All" || b.topics.includes(topic))
    .toSorted((a, b) =>
      tab === "trending"
        ? b.likes - a.likes
        : b.date.localeCompare(a.date)
    )

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <Tabs value={tab} onValueChange={setTab} className="min-w-0 flex-1">
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
        {["All", ...topics.slice(0, 7)].map((t) => (
          <FilterChip
            key={t}
            selected={topic === t}
            onClick={() => setTopic(t)}
            className="shrink-0"
          >
            {t}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No stories yet"
          description="Nothing in this topic. Try another one."
        />
      ) : layout === "list" ? (
        <div>
          {visible.map((b) => (
            <BlogListItem key={b.id} blog={b} />
          ))}
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-8 pt-4 sm:grid-cols-2">
          {visible.map((b) => (
            <BlogGridCard key={b.id} blog={b} />
          ))}
        </div>
      )}
    </div>
  )
}

export { HomeFeed }
