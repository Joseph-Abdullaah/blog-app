import Link from "next/link"
import { formatDate } from "@/lib/format"
import { AuthorSummary } from "@/components/byline/types"


export type TrendingProps = {
    slug: string
    title: string
    author: AuthorSummary
    date: string
    index: number
}

export function Trending({ slug, title, author, date, index }: TrendingProps) {
    return (
              <section>
            <ol>
                <li className="flex gap-4 border-t border-hairline py-3.5">
                    <span className="w-6 font-mono text-body-sm font-semibold text-ink-tertiary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/blog/${slug}`}
                      className="rounded-xs text-title-sm font-semibold text-ink hover:underline"
                    >
                      {title}
                    </Link>
                    <p className="mt-1 text-caption text-ink-subtle">
                      {author.name} · {formatDate(date)}
                    </p>
                  </div>
                </li>
            </ol>
            
          </section>
    )
}