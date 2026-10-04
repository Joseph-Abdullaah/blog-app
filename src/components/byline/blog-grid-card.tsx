import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type BlogGridCardData = {
  slug: string
  title: string
  description: string
  date: string | Date
  topic?: string
  readTime: number
  bannerUrl?: string | null
}

/** Featured / related card: 16:9 banner, caption meta, title, description. */
function BlogGridCard({
  blog,
  className,
}: {
  blog: BlogGridCardData
  className?: string
}) {
  const meta = [formatDate(blog.date), blog.topic, `${blog.readTime} min read`]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card
      className={cn(
        "group/blog relative rounded-xl [--card-spacing:--spacing(3)] transition-colors duration-fast hover:bg-surface-2",
        className
      )}
    >
      <CardContent className="flex flex-col gap-3">
        {blog.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.bannerUrl}
            alt=""
            className="aspect-video w-full rounded-lg border border-hairline object-cover"
          />
        ) : (
          <div className="aspect-video w-full rounded-lg border border-hairline bg-surface-2" />
        )}
        <div className="flex flex-col gap-1 px-1 pb-1">
          <p className="text-caption text-ink-subtle">{meta}</p>
          <h3 className="text-title text-ink">
            <Link
              href={`/blog/${blog.slug}`}
              className="rounded-xs after:absolute after:inset-0 group-hover/blog:underline"
            >
              {blog.title}
            </Link>
          </h3>
          <p className="line-clamp-2 text-body-sm text-ink-subtle">
            {blog.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export { BlogGridCard }
export type { BlogGridCardData }
