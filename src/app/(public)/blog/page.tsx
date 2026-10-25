import { TopicChip } from "@/components/byline"
import { Trending } from "@/components/byline/trending"
import { HomeFeed } from "@/components/screens/home-feed"
import { latestBlogs, trendingBlogs } from "@/lib/services/feed"
import { searchTopics } from "@/lib/services/topics"

export const dynamic = "force-dynamic"

/** S-01 home feed with Trending and Popular topics rails. */
export default async function BlogsPage() {
  const [feed, trending, topics] = await Promise.all([
    latestBlogs({ limit: 10 }),
    trendingBlogs({ limit: 5 }),
    searchTopics(undefined, 10),
  ])
  const popular = topics.filter((t) => t.blogsCount > 0)

  return (
    <div className="mx-auto grid max-w-wide grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail)] lg:px-8">
      <main>
        <HomeFeed
          initialBlogs={feed.data}
          initialCursor={feed.nextCursor}
          topics={popular}
        />
      </main>
      <aside className="grid gap-8 pt-2 md:grid-cols-2 md:gap-12 lg:flex lg:flex-col lg:gap-8">
        {trending.data.length ? (
          <div>
            <h2 className="mb-4 text-title-lg text-ink">Trending</h2>
            {trending.data.map((b, i) => (
              <Trending
                key={b.id}
                slug={b.slug}
                title={b.title}
                author={b.author}
                date={b.publishedAt}
                index={i}
              />
            ))}
          </div>
        ) : null}

        {popular.length ? (
          <section>
            <h2 className="mb-4 text-title-lg text-ink">Popular topics</h2>
            <div className="flex flex-wrap gap-2">
              {popular.map((t) => (
                <TopicChip key={t.id} href={`/search?topic=${encodeURIComponent(t.slug)}`}>
                  {t.name}
                </TopicChip>
              ))}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  )
}
