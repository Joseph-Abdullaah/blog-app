import { TopicChip } from "@/components/byline"
import { HomeFeed } from "@/components/screens/home-feed"
import { Trending } from "@/components/byline/trending"
import {
  publishedBlogs,
  topics,
} from "@/lib/mock-data"


export default function BlogsPage() {
    const blogs = publishedBlogs()
    const trending = blogs.toSorted((a, b) => b.likes - a.likes).slice(0, 5)

    return (
        <div className="mx-auto grid max-w-wide grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail)] lg:px-8">
        <main>
          <HomeFeed blogs={blogs} topics={topics} />
          <p className="pt-8 text-center text-body-sm text-ink-subtle">
            You’re all caught up
          </p>
        </main>
        <aside className="grid gap-8 pt-2 md:grid-cols-2 md:gap-12 lg:flex lg:flex-col lg:gap-8">
            <div>
                <h2 className="mb-4 text-title-lg text-ink">Trending</h2>
            {trending.map((b, i) => (
                <Trending
                    key={b.id}
                    slug={b.slug}
                    title={b.title}
                    author={b.author}
                    date={b.date}
                    index={i}
                />
            ))}
            </div>
            
          <section>
            <h2 className="mb-4 text-title-lg text-ink">Popular topics</h2>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <TopicChip key={t} href={`/search?topic=${encodeURIComponent(t)}`}>
                  {t}
                </TopicChip>
              ))}
            </div>
          </section>
        </aside>
      </div>
    )
}