import type { Metadata } from "next"
import Link from "next/link"
import { XIcon } from "lucide-react"

import {
  BlogListItem,
  EmptyState,
  UserListItem,
} from "@/components/byline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { publishedBlogs, users } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Search" }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; tab?: string }>
}) {

    const { q = "", topic, tab } = await searchParams
  const needle = q.toLowerCase().trim()

  const blogs = publishedBlogs().filter(
    (b) =>
      (!topic || b.topics.includes(topic)) &&
      (!needle ||
        b.title.toLowerCase().includes(needle) ||
        b.description.toLowerCase().includes(needle))
  )
  const people = users.filter(
    (u) =>
      needle &&
      (u.name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle) ||
        u.bio?.toLowerCase().includes(needle))
  )

  const clearTopic = q ? `/search?q=${encodeURIComponent(q)}` : "/search"
  const heading = q ? `“${q}”` : topic ? topic : "Search"

    return (
        <main className="mx-auto max-w-wide px-4 pt-10 pb-16 sm:px-6 lg:px-8">
                <p className="text-eyebrow tracking-[1px] text-ink-subtle uppercase">
                  Search results
                </p>
                <h1 className="mt-3 mb-7 text-display-md text-ink">{heading}</h1>
        
                <Tabs defaultValue={tab === "users" ? "users" : "blogs"}>
                  <TabsList>
                    <TabsTrigger value="blogs">Blogs</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>
        
                  <TabsContent value="blogs" className="max-w-190">
                    {topic ? (
                      <div className="flex items-center gap-2 pb-1 text-body-sm text-ink-subtle">
                        Filtered by
                        <Button
                          variant="chip"
                          size="chip"
                          render={<Link href={clearTopic} />}
                          nativeButton={false}
                        >
                          {topic}
                          <XIcon className="size-3.5" aria-hidden />
                          <span className="sr-only">Remove filter</span>
                        </Button>
                      </div>
                    ) : null}
                    {blogs.length ? (
                      blogs.map((b) => <BlogListItem key={b.id} blog={b} />)
                    ) : (
                      <EmptyState
                        title="No blogs found"
                        description="Try a different search or remove a filter."
                      />
                    )}
                  </TabsContent>
        
                  <TabsContent value="users" className="max-w-190">
                    {people.length ? (
                      <>
                        <h2 className="mt-2 mb-2 text-title-lg text-ink">
                          People matching {q ? `“${q}”` : "your search"}
                        </h2>
                        {people.map((u) => (
                          <UserListItem key={u.username} user={u} />
                        ))}
                      </>
                    ) : (
                      <EmptyState
                        title="No people found"
                        description="Search for a name or @username."
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </main>
    )
}