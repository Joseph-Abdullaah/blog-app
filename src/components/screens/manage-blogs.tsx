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
import type { MockBlog } from "@/lib/mock-data"

/** Manage Blogs: Published / Drafts tabs with Edit, Stats and Delete (confirmed) actions. */
function ManageBlogs({
  blogs,
  query,
}: {
  blogs: MockBlog[]
  query?: string
}) {
  const [items, setItems] = React.useState(blogs)

  const q = query?.toLowerCase().trim()
  const matches = items.filter(
    (b) => !q || b.title.toLowerCase().includes(q)
  )
  const published = matches.filter((b) => b.status === "PUBLISHED")
  const drafts = matches.filter((b) => b.status === "DRAFT")

  function renderRows(rows: MockBlog[], empty: string) {
    if (rows.length === 0) {
      return (
        <EmptyState icon={FileTextIcon} title={empty}>
          <Button render={<Link href="/editor" />} nativeButton={false}>
            Write
          </Button>
        </EmptyState>
      )
    }
    return rows.map((b) => (
      <DashboardBlogRow
        key={b.id}
        blog={{
          id: b.id,
          status: b.status,
          title: b.title,
          published: b.status === "PUBLISHED" ? b.date : undefined,
          updated: b.status === "DRAFT" ? b.date : undefined,
          likes: b.likes,
          comments: b.comments,
          reads: b.reads,
          shares: b.shares,
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
            <IconButton
              icon={PencilIcon}
              label="Edit"
              size="sm"
              href={`/editor/${b.id}`}
            />
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  className="text-danger hover:text-danger"
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
              title="Delete this blog?"
              description="This can't be undone."
              confirmLabel="Delete"
              destructive
              onConfirm={() => {
                setItems((prev) => prev.filter((x) => x.id !== b.id))
                toast.add({ title: "Blog deleted", type: "success" })
              }}
            />
          </>
        }
      />
    ))
  }

  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">Published Blogs</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        {renderRows(published, "No published blogs")}
      </TabsContent>
      <TabsContent value="drafts">
        {renderRows(drafts, "No drafts")}
      </TabsContent>
    </Tabs>
  )
}

export { ManageBlogs }
