import type { Metadata } from "next"
import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import { BlogListItem, EmptyState, UserListItem } from "@/components/byline"
import { MoreBlogs } from "@/components/byline/more-blogs"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUser } from "@/lib/auth-guards"
import { toCardProps } from "@/lib/blog-cards"
import { prisma } from "@/lib/prisma"
import { latestBlogs } from "@/lib/services/feed"
import { searchBlogs, searchUsers } from "@/lib/services/search"

type SearchParams = Promise<{ q?: string; topic?: string; tab?: string }>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q?.trim() ? `“${q.trim()}” · Search` : "Search" }
}

const PAGE = 10

/** S-02 search: Blogs / Users tabs, optional topic filter (FR-SRCH-01…03). */
export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = (params.q ?? "").trim().slice(0, 100)
  const topicSlug = params.topic?.trim() || undefined
  const tab = params.tab === "users" ? "users" : "blogs"

  const [viewer, topic] = await Promise.all([
    getUser(),
    topicSlug
      ? prisma.topic.findUnique({ where: { slug: topicSlug }, select: { name: true, slug: true } })
      : Promise.resolve(null),
  ])

  const [blogs, people] = await Promise.all([
    q
      ? searchBlogs({ q, topic: topicSlug, limit: PAGE })
      : topicSlug
        ? latestBlogs({ topic: topicSlug, limit: PAGE })
        : Promise.resolve({ data: [], nextCursor: null }),
    q
      ? searchUsers({ q, limit: PAGE, viewerId: viewer?.id ?? null })
      : Promise.resolve({ data: [], nextCursor: null }),
  ])

  const heading = q ? `“${q}”` : (topic?.name ?? "Search")
  const clearTopic = q ? `/search?q=${encodeURIComponent(q)}` : "/search"
  const moreBlogs = q
    ? `/api/search?q=${encodeURIComponent(q)}${topicSlug ? `&topic=${encodeURIComponent(topicSlug)}` : ""}&limit=${PAGE}`
    : `/api/blogs?sort=latest&topic=${encodeURIComponent(topicSlug ?? "")}&limit=${PAGE}`

  if (!q && !topicSlug) {
    return (
      <main className="mx-auto max-w-wide px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={SearchIcon}
          title="Search Byline"
          description="Find stories by title, description or topic, and people by name or @username."
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-wide px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      <p className="text-eyebrow tracking-[1px] text-ink-subtle uppercase">
        {q ? "Search results" : "Topic"}
      </p>
      <h1 className="mt-3 mb-7 text-display-md break-words text-ink">{heading}</h1>

      <Tabs defaultValue={tab}>
        {q ? (
          <TabsList>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
        ) : null}

        <TabsContent value="blogs" className="max-w-190">
          {topic && q ? (
            <div className="flex items-center gap-2 pb-1 text-body-sm text-ink-subtle">
              Filtered by
              <Button
                variant="chip"
                size="chip"
                render={<Link href={clearTopic} />}
                nativeButton={false}
              >
                {topic.name}
                <XIcon className="size-3.5" aria-hidden />
                <span className="sr-only">Remove filter</span>
              </Button>
            </div>
          ) : null}
          {blogs.data.length ? (
            <>
              {blogs.data.map((b) => (
                <BlogListItem key={b.id} blog={toCardProps(b)} />
              ))}
              <MoreBlogs endpoint={moreBlogs} initialCursor={blogs.nextCursor} />
            </>
          ) : (
            <EmptyState
              title="No blogs found"
              description={topic ? "Try a different search or remove the topic filter." : "Try a different search."}
            />
          )}
        </TabsContent>

        {q ? (
          <TabsContent value="users" className="max-w-190">
            {people.data.length ? (
              <>
                <h2 className="mt-2 mb-2 text-title-lg text-ink">People matching “{q}”</h2>
                {people.data.map((u) => (
                  <UserListItem
                    key={u.id}
                    user={{ ...u, bio: u.bio ?? undefined, subscribed: u.viewer.subscribed }}
                  />
                ))}
              </>
            ) : (
              <EmptyState title="No people found" description="Search for a name or @username." />
            )}
          </TabsContent>
        ) : null}
      </Tabs>
    </main>
  )
}
