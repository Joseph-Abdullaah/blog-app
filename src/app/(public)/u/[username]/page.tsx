import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  BlogListItem,
  EmptyState,
  ProfileCard,
} from "@/components/byline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currentUser, getUser, publishedBlogs } from "@/lib/mock-data"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = getUser(username)
  return { title: user ? `${user.name} (@${user.username})` : "Page not found" }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const user = getUser(username)
  if (!user) notFound()

  const blogs = publishedBlogs().filter(
    (b) => b.author.username === user.username
  )

  return (
      <div className="mx-auto flex max-w-wide flex-col gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail)] lg:gap-12 lg:px-8">
        <main className="order-2 min-w-0 lg:order-1">
          <Tabs defaultValue="blogs">
            <TabsList>
              <TabsTrigger value="blogs">Blogs Published</TabsTrigger>
            </TabsList>
            <TabsContent value="blogs">
              {blogs.length ? (
                blogs.map((b) => <BlogListItem key={b.id} blog={b} />)
              ) : (
                <EmptyState
                  title="No blogs yet"
                  description={`${user.name} hasn’t published anything.`}
                />
              )}
            </TabsContent>
          </Tabs>
        </main>
        <aside className="order-1 lg:order-2">
          <ProfileCard
            user={user}
            isSelf={user.username === currentUser.username}
          />
        </aside>
      </div>

  )
}
