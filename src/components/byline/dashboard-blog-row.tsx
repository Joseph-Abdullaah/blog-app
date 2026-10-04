import {
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { formatCount, formatDate } from "@/lib/format"
import type { BlogStatus } from "./types"

type DashboardBlogData = {
  id: string
  status: BlogStatus
  title: string
  published?: string | Date
  updated?: string | Date
  likes?: number
  comments?: number
  reads?: number
  shares?: number
  bannerUrl?: string | null
}

/** Manage Blogs row. Pass row actions (Edit, Stats, Delete…) as `actions`. */
function DashboardBlogRow({
  blog,
  actions,
}: {
  blog: DashboardBlogData
  actions?: React.ReactNode
}) {
  const published = blog.status === "PUBLISHED"
  const stats = [
    { icon: HeartIcon, label: "likes", value: blog.likes },
    { icon: MessageCircleIcon, label: "comments", value: blog.comments },
    { icon: EyeIcon, label: "reads", value: blog.reads },
    { icon: Share2Icon, label: "shares", value: blog.shares },
  ]

  return (
    <div className="flex items-center gap-4 border-b border-hairline py-4">
      {blog.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.bannerUrl}
          alt=""
          className="hidden aspect-video h-14 shrink-0 rounded-md border border-hairline object-cover sm:block"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/editor/${blog.id}`}
            className="truncate rounded-xs text-title text-ink hover:underline"
          >
            {blog.title || "Untitled"}
          </Link>
          <Badge variant={published ? "brand" : "secondary"}>
            {published ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-body-sm text-ink-subtle">
          {published && blog.published
            ? `Published ${formatDate(blog.published)}`
            : blog.updated
              ? `Edited ${formatDate(blog.updated)}`
              : "Draft"}
        </p>
      </div>
      {published ? (
        <ul className="hidden items-center gap-4 text-body-sm text-ink-subtle md:flex">
          {stats.map(({ icon: Icon, label, value }) => (
            <li key={label} className="inline-flex items-center gap-1">
              <Icon className="size-4" aria-hidden />
              <span className="sr-only">{label}</span>
              {formatCount(value ?? 0)}
            </li>
          ))}
        </ul>
      ) : null}
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </div>
  )
}

export { DashboardBlogRow }
export type { DashboardBlogData }
