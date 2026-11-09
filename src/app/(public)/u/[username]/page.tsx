import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogListItem, EmptyState, ProfileCard } from "@/components/byline"
import { MoreBlogs } from "@/components/byline/more-blogs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUser } from "@/lib/auth-guards"
import { toCardProps } from "@/lib/blog-cards"
import { getPublicProfile, listUserBlogs } from "@/lib/services/users"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfile(username, null)
  return profile
    ? {
        title: `${profile.name} (@${profile.username})`,
        description: profile.bio ?? `Stories by ${profile.name} on Byline.`,
      }
    : { title: "Page not found" }
}

const PAGE = 10

/** S-04 public profile (FR-PROF-06). */
export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const viewer = await getUser()
  const profile = await getPublicProfile(username, viewer?.id ?? null)
  if (!profile) notFound()

  const blogs = await listUserBlogs(profile.username, { limit: PAGE })
  const socials = Object.fromEntries(
    Object.entries(profile.socials).filter(([, url]) => url)
  ) as Record<string, string>

  return (
    <div className="mx-auto flex max-w-wide flex-col gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--spacing-rail)] lg:gap-12 lg:px-8">
      <main className="order-2 min-w-0 lg:order-1">
        <Tabs defaultValue="blogs">
          <TabsList>
            <TabsTrigger value="blogs">Blogs Published</TabsTrigger>
          </TabsList>
          <TabsContent value="blogs">
            {blogs.data.length ? (
              <>
                {blogs.data.map((b) => (
                  <BlogListItem key={b.id} blog={toCardProps(b)} />
                ))}
                <MoreBlogs
                  endpoint={`/api/users/${encodeURIComponent(profile.username)}/blogs?limit=${PAGE}`}
                  initialCursor={blogs.nextCursor}
                />
              </>
            ) : (
              <EmptyState
                title="No blogs yet"
                description={
                  profile.viewer.isSelf
                    ? "Your published stories will show up here."
                    : `${profile.name} hasn’t published anything yet.`
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
      <aside className="order-1 lg:order-2">
        <ProfileCard
          isSelf={profile.viewer.isSelf}
          subscribed={profile.viewer.subscribed}
          user={{
            name: profile.name,
            username: profile.username,
            image: profile.image,
            bio: profile.bio ?? undefined,
            blogs: profile.stats.blogsCount,
            reads: profile.stats.totalReads,
            subscribers: profile.stats.subscribersCount,
            socials,
            joined: profile.joinedAt,
          }}
        />
      </aside>
    </div>
  )
}
