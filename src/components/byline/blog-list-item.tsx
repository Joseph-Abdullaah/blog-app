import { HeartIcon } from "lucide-react"
import Link from "next/link"

import { formatCount, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { TopicChip } from "./chips"
import type { AuthorSummary } from "./types"
import { UserAvatar } from "./user-avatar"

type BlogListItemData = {
  slug: string
  title: string
  description: string
  author: AuthorSummary
  date: string | Date
  topic?: string
  likes: number
  readTime: number
  bannerUrl?: string | null
}

/** Feed row: meta → title → 2-line description → footer, square thumbnail on the right. */
function BlogListItem({
  blog,
  className,
}: {
  blog: BlogListItemData
  className?: string
}) {
  return (
    <article
      className={cn(
        "group relative flex gap-4 border-b border-hairline py-6 sm:gap-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 text-body-sm">
          <UserAvatar name={blog.author.name} src={blog.author.image} size="sm" />
          <span className="truncate text-ink">{blog.author.name}</span>
          <span className="truncate text-ink-subtle">
            @{blog.author.username} · {formatDate(blog.date)}
          </span>
        </div>
        <h3 className="text-title-lg text-ink">
          <Link
            href={`/blog/${blog.slug}`}
            className="rounded-xs group-hover:underline after:absolute after:inset-0"
          >
            {blog.title}
          </Link>
        </h3>
        <p className="line-clamp-2 font-serif text-reading-sm text-ink-subtle">
          {blog.description}
        </p>
        <div className="mt-1 flex items-center gap-4 text-body-sm text-ink-subtle">
          {blog.topic ? (
            <TopicChip
              href={`/search?topic=${encodeURIComponent(blog.topic)}`}
              className="relative z-10"
            >
              {blog.topic}
            </TopicChip>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="size-4" aria-hidden />
            {formatCount(blog.likes)}
          </span>
          <span>{blog.readTime} min read</span>
        </div>
      </div>
      {blog.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.bannerUrl}
          alt=""
          className="size-20 shrink-0 rounded-md border border-hairline object-cover sm:size-30"
        />
      ) : null}
    </article>
  )
}

export { BlogListItem }
export type { BlogListItemData }
