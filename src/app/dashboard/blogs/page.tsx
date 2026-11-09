import type { Metadata } from "next"

import { DashboardShell, SearchInput } from "@/components/byline"
import { ManageBlogs } from "@/components/screens/manage-blogs"
import { dashboardContext } from "@/lib/dashboard-context"
import { listMyBlogs } from "@/lib/services/dashboard"

export const metadata: Metadata = { title: "Manage Blogs" }

/** S-11 — the member's published blogs and drafts (FR-DASH-01/02). */
export default async function ManageBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: rawQ } = await searchParams
  const q = rawQ?.trim().slice(0, 120) || undefined
  const { user, shellUser, unread } = await dashboardContext("/dashboard/blogs")

  const [published, drafts] = await Promise.all([
    listMyBlogs(user.id, { status: "PUBLISHED", q, limit: 10 }),
    listMyBlogs(user.id, { status: "DRAFT", q, limit: 10 }),
  ])

  return (
    <DashboardShell user={shellUser} active="Blogs" unread={unread} title="Manage Blogs">
      <SearchInput
        placeholder="Search blogs"
        action="/dashboard/blogs"
        defaultValue={q}
        shortcut={false}
      />
      <div className="mt-6">
        <ManageBlogs
          key={q ?? ""}
          query={q}
          published={{ items: published.data, cursor: published.nextCursor }}
          drafts={{ items: drafts.data, cursor: drafts.nextCursor }}
        />
      </div>
    </DashboardShell>
  )
}
