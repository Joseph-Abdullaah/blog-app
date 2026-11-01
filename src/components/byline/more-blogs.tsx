"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { toCardProps } from "@/lib/blog-cards"
import type { BlogCard } from "@/types/dto"
import { BlogListItem } from "./blog-list-item"

/**
 * "Load more" for server-rendered blog lists (search, profile). `endpoint` is a
 * paginated API URL without the cursor, e.g. `/api/users/amina/blogs?limit=10`.
 */
export function MoreBlogs({
  endpoint,
  initialCursor,
}: {
  endpoint: string
  initialCursor: string | null
}) {
  const [blogs, setBlogs] = React.useState<BlogCard[]>([])
  const [cursor, setCursor] = React.useState(initialCursor)
  const [loading, setLoading] = React.useState(false)

  async function load() {
    if (!cursor) return
    setLoading(true)
    try {
      const sep = endpoint.includes("?") ? "&" : "?"
      const res = await fetch(`${endpoint}${sep}cursor=${encodeURIComponent(cursor)}`)
      const body = (await res.json()) as {
        data?: BlogCard[]
        meta?: { nextCursor: string | null }
        error?: { message: string }
      }
      if (!res.ok || !body.data) throw new Error(body.error?.message)
      setBlogs((prev) => [...prev, ...body.data!])
      setCursor(body.meta?.nextCursor ?? null)
    } catch (error) {
      toast.add({
        title: "Couldn't load more",
        description: (error as Error).message || "Try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {blogs.map((b) => (
        <BlogListItem key={b.id} blog={toCardProps(b)} />
      ))}
      {cursor ? (
        <div className="flex justify-center pt-6">
          <Button variant="secondary" loading={loading} onClick={() => void load()}>
            Load more
          </Button>
        </div>
      ) : null}
    </>
  )
}
