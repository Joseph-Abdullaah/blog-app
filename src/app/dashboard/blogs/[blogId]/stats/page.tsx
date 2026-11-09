import type { Metadata } from "next"
import Link from "next/link"
import { EyeIcon, HeartIcon, MessageCircleIcon, Share2Icon } from "lucide-react"
import { notFound } from "next/navigation"

import { DashboardShell, StatCard } from "@/components/byline"
import { ReadsChart } from "@/components/screens/reads-chart"
import { StatsComments } from "@/components/screens/stats-comments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { dashboardContext } from "@/lib/dashboard-context"
import { blogStats, ownedBlogSummary } from "@/lib/services/dashboard"
import type { ShareChannel } from "@/types/dto"

export const metadata: Metadata = { title: "Blog stats" }

const CHANNEL_LABEL: Record<ShareChannel, string> = {
  COPY_LINK: "Copy link",
  X: "X",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
}

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })

/** S-12 — stats for one of the member's blogs (FR-DASH-04). */
export default async function BlogStatsPage({
  params,
}: {
  params: Promise<{ blogId: string }>
}) {
  const { blogId } = await params
  const { user, shellUser, unread } = await dashboardContext(`/dashboard/blogs/${blogId}/stats`)
  const [blog, stats] = await Promise.all([
    ownedBlogSummary(user.id, blogId),
    blogStats(user.id, blogId),
  ])
  if (!blog || !stats) notFound()

  // Bars are relative to the busiest channel; keep the track empty when nothing was shared.
  const maxShares = Math.max(1, ...stats.sharesByChannel.map((c) => c.count))

  return (
    <DashboardShell user={shellUser} active="Blogs" unread={unread} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="min-w-0 text-body-sm text-ink-subtle">
          <Link href="/dashboard/blogs" className="rounded-xs hover:text-ink">
            Blogs
          </Link>{" "}
          <span aria-hidden>/</span> <span className="text-ink">{blog.title || "Untitled"}</span>
        </nav>
        {blog.status === "PUBLISHED" && blog.slug ? (
          <Button
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href={`/blog/${blog.slug}`} />}
            nativeButton={false}
          >
            View blog
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reads" value={stats.totals.reads} icon={EyeIcon} />
        <StatCard label="Likes" value={stats.totals.likes} icon={HeartIcon} />
        <StatCard label="Comments" value={stats.totals.comments} icon={MessageCircleIcon} />
        <StatCard label="Shares" value={stats.totals.shares} icon={Share2Icon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reads — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadsChart
            data={stats.readsByDay.map((d) => ({ label: dayLabel(d.date), reads: d.count }))}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shares by channel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {stats.sharesByChannel.map((c) => (
              <div key={c.channel} className="flex items-center gap-3 text-body-sm">
                <span className="w-26 shrink-0 text-ink-muted">{CHANNEL_LABEL[c.channel]}</span>
                <Progress
                  value={(c.count / maxShares) * 100}
                  aria-label={`${CHANNEL_LABEL[c.channel]} shares`}
                  className="flex-1"
                />
                <span className="w-7 text-right text-ink tabular-nums">{c.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent comments</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsComments initial={stats.recentComments} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
