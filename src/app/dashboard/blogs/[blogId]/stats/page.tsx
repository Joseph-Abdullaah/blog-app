import type { Metadata } from "next"
import Link from "next/link"
import {
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
} from "lucide-react"
import { notFound } from "next/navigation"

import { CommentItem, DashboardShell, StatCard } from "@/components/byline"
import { ReadsChart } from "@/components/screens/reads-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  comments,
  currentUser,
  getBlogById,
  readsOverTime,
  shareChannels,
} from "@/lib/mock-data"

export const metadata: Metadata = { title: "Blog stats" }

export default async function BlogStatsPage({
  params,
}: {
  params: Promise<{ blogId: string }>
}) {
  const { blogId } = await params
  const blog = getBlogById(blogId)
  if (!blog) notFound()

  const maxShares = Math.max(...shareChannels.map((c) => c.count))

  return (
    <DashboardShell user={currentUser} active="Blogs" unread className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-subtle">
          <Link href="/dashboard/blogs" className="rounded-xs hover:text-ink">
            Blogs
          </Link>{" "}
          <span aria-hidden>/</span>{" "}
          <span className="text-ink">{blog.title}</span>
        </nav>
        <Button
          variant="link"
          className="h-auto p-0 text-body-sm"
          render={<Link href={`/blog/${blog.slug}`} />}
          nativeButton={false}
        >
          View blog
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reads" value={blog.reads} icon={EyeIcon} />
        <StatCard label="Likes" value={blog.likes} icon={HeartIcon} />
        <StatCard label="Comments" value={blog.comments} icon={MessageCircleIcon} />
        <StatCard label="Shares" value={blog.shares} icon={Share2Icon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reads — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadsChart data={readsOverTime} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shares by channel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {shareChannels.map((c) => (
              <div key={c.label} className="flex items-center gap-3 text-body-sm">
                <span className="w-26 shrink-0 text-ink-muted">{c.label}</span>
                <Progress
                  value={(c.count / maxShares) * 100}
                  aria-label={`${c.label} shares`}
                  className="flex-1"
                />
                <span className="w-7 text-right tabular-nums text-ink">
                  {c.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent comments</CardTitle>
          </CardHeader>
          <CardContent>
            {comments.map((c) => (
              <div key={c.id} className="border-t border-hairline">
                <CommentItem
                  comment={{
                    id: c.id,
                    author: c.author,
                    time: c.time,
                    content: c.content,
                    canDelete: true,
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
