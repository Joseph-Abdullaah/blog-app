import type { Metadata } from "next"

import { DashboardShell, SearchInput } from "@/components/byline"
import { ManageBlogs } from "@/components/screens/manage-blogs"
import { blogs, currentUser } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Manage Blogs" }

export default async function ManageBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const mine = blogs.filter((b) => b.author.username === currentUser.username)

  return (
    <DashboardShell
      user={currentUser}
      active="Blogs"
      unread
      title="Manage Blogs"
    >
      <SearchInput
        placeholder="Search blogs"
        action="/dashboard/blogs"
        defaultValue={q}
        shortcut={false}
      />
      <div className="mt-6">
        <ManageBlogs blogs={mine} query={q} />
      </div>
    </DashboardShell>
  )
}
