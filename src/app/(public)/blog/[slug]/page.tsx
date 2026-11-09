import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  AuthorRow,
  BlockRenderer,
  BlogGridCard,
  InteractionBar,
  TopicChip,
} from "@/components/byline"
import { BlogEngagementProvider } from "@/components/byline/blog-engagement"
import { CommentsSection } from "@/components/byline/comments-section"
import { ReadTracker } from "@/components/byline/read-tracker"
import { getUser } from "@/lib/auth-guards"
import { toCardProps } from "@/lib/blog-cards"
import { listComments } from "@/lib/services/comments"
import { getBlogDetail, relatedBlogs } from "@/lib/services/feed"

type Props = { params: Promise<{ slug: string }> }

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL

/** Open Graph + Twitter card meta (FR-READ-03). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogDetail(slug)
  if (!blog) return { title: "Page not found" }

  const images = blog.bannerUrl ? [{ url: blog.bannerUrl, alt: blog.title }] : []
  return {
    title: blog.title,
    description: blog.description,
    alternates: appUrl ? { canonical: `${appUrl}/blog/${blog.slug}` } : undefined,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.description,
      url: appUrl ? `${appUrl}/blog/${blog.slug}` : undefined,
      images,
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
      tags: blog.topics.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: images.map((i) => i.url),
    },
  }
}

/** S-03 blog reader: server-rendered; drafts and unknown slugs are 404 (FR-READ-01). */
export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const user = await getUser()
  const blog = await getBlogDetail(slug, user?.id)
  if (!blog) notFound()

  const [related, comments] = await Promise.all([
    relatedBlogs(blog),
    listComments(blog.id, { limit: 10 }, user?.id ?? null),
  ])

  return (
    <BlogEngagementProvider
      blogId={blog.id}
      slug={blog.slug}
      title={blog.title}
      signedIn={Boolean(user)}
      isAuthor={blog.viewer.isAuthor}
      liked={blog.viewer.liked}
      likes={blog.likesCount}
      comments={blog.commentsCount}
    >
      <article className="mx-auto max-w-read px-4 pt-8 pb-24 sm:px-6 sm:pt-10">
        <ReadTracker blogId={blog.id} />
        {blog.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.bannerUrl}
            alt=""
            className="aspect-video w-full rounded-lg border border-hairline object-cover"
          />
        ) : null}
        <h1 className="mt-8 mb-4 text-display-lg text-ink sm:mt-10">{blog.title}</h1>
        <p className="mb-8 font-serif text-reading-lead text-ink-subtle">
          {blog.description}
        </p>
        <AuthorRow
          author={blog.author}
          date={blog.publishedAt}
          readTime={blog.readTimeMinutes}
          isAuthor={blog.viewer.isAuthor}
          editHref={`/editor/${blog.id}`}
          subscribed={blog.viewer.subscribedToAuthor}
        />
        <InteractionBar
          likes={blog.likesCount}
          comments={blog.commentsCount}
          liked={blog.viewer.liked}
          title={blog.title}
          className="mt-6 mb-8"
        />

        <BlockRenderer blocks={blog.content.blocks} />

        {blog.topics.length ? (
          <div className="mt-10 mb-6 flex flex-wrap gap-2">
            {blog.topics.map((t) => (
              <TopicChip key={t.id} href={`/search?topic=${encodeURIComponent(t.slug)}`}>
                {t.name}
              </TopicChip>
            ))}
          </div>
        ) : null}
        <InteractionBar
          likes={blog.likesCount}
          comments={blog.commentsCount}
          liked={blog.viewer.liked}
          title={blog.title}
        />

        <CommentsSection initial={comments.data} initialCursor={comments.nextCursor} />

        {related.length ? (
          <section className="mt-16">
            <h2 className="mb-5 text-eyebrow tracking-[0.4px] text-ink-subtle uppercase">
              Related reading
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((b) => (
                <BlogGridCard key={b.id} blog={toCardProps(b)} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </BlogEngagementProvider>
  )
}
