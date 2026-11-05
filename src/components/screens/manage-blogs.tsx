"use client"

import * as React from "react"
import { FileTextIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"

import {
  ConfirmDialog,
  DashboardBlogRow,
  EmptyState,
  IconButton,
} from "@/components/byline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import type { BlogStatus, DashboardBlog } from "@/types/dto"

type TabState = { items: DashboardBlog[]; cursor: string | null }

/** S-11 Manage Blogs: Published / Drafts with Edit, Stats and Delete (FR-DASH-01…03). */
function ManageBlogs({
  published,
  drafts,
  query,
}: {
  published: TabState
  drafts: TabState
  query?: string
}) {
  const [tabs, setTabs] = React.useState<Record<BlogStatus, TabState>>({
    PUBLISHED: published,
    DRAFT: drafts,
  })
  const [loading, setLoading] = React.useState<BlogStatus | null>(null)

  async function loadMore(status: BlogStatus) {
    const cursor = tabs[status].cursor
    if (!cursor) return
    setLoading(status)
    try {
      const params = new URLSearchParams({ status, cursor, limit: "10" })
      if (query) params.set("q", query)
      const res = await fetch(`/api/users/me/blogs?${params}`)
      const body = (await res.json()) as {
        data?: DashboardBlog[]
        meta?: { nextCursor: string | null }
      }
      if (!res.ok || !body.data) throw new Error()
      setTabs((t) => ({
        ...t,
        [status]: { items: [...t[status].items, ...body.data!], cursor: body.meta?.nextCursor ?? null },
      }))
    } catch {
      toast.add({ title: "Couldn't load more blogs", type: "error" })
    } finally {
      setLoading(null)
    }
  }

  async function remove(blog: DashboardBlog) {
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error()
      setTabs((t) => ({
        ...t,
        [blog.status]: {
          ...t[blog.status],
          items: t[blog.status].items.filter((b) => b.id !== blog.id),
        },
      }))
      toast.add({ title: "Blog deleted", type: "success" })
    } catch {
      toast.add({ title: "Couldn't delete the blog", description: "Try again.", type: "error" })
    }
  }

  function renderRows(status: BlogStatus) {
    const { items, cursor } = tabs[status]
    if (items.length === 0) {
      return (
        <EmptyState
          icon={FileTextIcon}
          title={
            query
              ? "No blogs match your search"
              : status === "PUBLISHED"
                ? "No published blogs"
                : "No drafts"
          }
          description={query ? "Try a different title." : undefined}
        >
          {query ? null : (
            <Button render={<Link href="/editor" />} nativeButton={false}>
              Write
            </Button>
          )}
        </EmptyState>
      )
    }
    return (
      <>
        {items.map((b) => (
          <DashboardBlogRow
            key={b.id}
            blog={{
              id: b.id,
              status: b.status,
              title: b.title,
              published: b.publishedAt ?? undefined,
              updated: b.status === "DRAFT" ? b.updatedAt : undefined,
              likes: b.likesCount,
              comments: b.commentsCount,
              reads: b.readsCount,
              shares: b.sharesCount,
              bannerUrl: b.bannerUrl,
            }}
            actions={
              <>
                {b.status === "PUBLISHED" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/dashboard/blogs/${b.id}/stats`} />}
                    nativeButton={false}
                  >
                    Stats
                  </Button>
                ) : null}
                <IconButton icon={PencilIcon} label="Edit" size="sm" href={`/editor/${b.id}`} />
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete “${b.title || "Untitled"}”`}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2Icon aria-hidden />
                    </Button>
                  }
                  title="Delete this blog?"
                  description="Its likes, comments, reads and shares will be deleted too. This can't be undone."
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => void remove(b)}
                />
              </>
            }
          />
        ))}
        {cursor ? (
          <div className="flex justify-center pt-6">
            <Button
              variant="secondary"
              loading={loading === status}
              onClick={() => void loadMore(status)}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">Published Blogs</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </TabsList>
      <TabsContent value="published">{renderRows("PUBLISHED")}</TabsContent>
      <TabsContent value="drafts">{renderRows("DRAFT")}</TabsContent>
    </Tabs>
  )
}

export { ManageBlogs }
