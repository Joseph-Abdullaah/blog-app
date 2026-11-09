import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  AuthorRow,
  BlockRenderer,
  BlogGridCard,
  CommentComposer,
  CommentItem,
  InteractionBar,
  TopicChip,
} from "@/components/byline"
import { Button } from "@/components/ui/button"
import { blogs, comments, currentUser, getBlog } from "@/lib/mock-data"


type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = getBlog(slug)
  return blog
    ? { title: blog.title, description: blog.description }
    : { title: "Page not found" }
}



export default async function BlogPage( { params }: Props) {
    const { slug } = await params
    const blog = getBlog(slug)
    if (!blog || blog.status !== "PUBLISHED") notFound()

    const related = blogs
    .filter((b) => b.id !== blog.id && b.status === "PUBLISHED")
    .slice(0, 3)
  const isAuthor = blog.author.username === currentUser.username

    return (
        <article className="mx-auto max-w-read px-4 pt-8 pb-24 sm:px-6 sm:pt-10">
                {blog.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={blog.bannerUrl}
                    alt=""
                    className="aspect-video w-full rounded-lg border border-hairline object-cover"
                  />
                ) : null}
                <h1 className="mt-8 mb-4 text-display-lg text-ink sm:mt-10">
                  {blog.title}
                </h1>
                <p className="mb-8 font-serif text-reading-lead text-ink-subtle">
                  {blog.description}
                </p>
                <AuthorRow
                  author={blog.author}
                  date={blog.date}
                  readTime={blog.readTime}
                  isAuthor={isAuthor}
                  editHref={`/editor/${blog.id}`}
                  subscribed={
                    "subscribed" in blog.author ? Boolean(blog.author.subscribed) : false
                  }
                />
                <InteractionBar
                  likes={blog.likes}
                  comments={comments.length}
                  title={blog.title}
                  className="mt-6 mb-8"
                />
        
                <BlockRenderer blocks={blog.blocks} />
        
                <div className="mt-10 mb-6 flex flex-wrap gap-2">
                  {blog.topics.map((t) => (
                    <TopicChip key={t} href={`/search?topic=${encodeURIComponent(t)}`}>
                      {t}
                    </TopicChip>
                  ))}
                </div>
                <InteractionBar
                  likes={blog.likes}
                  comments={comments.length}
                  title={blog.title}
                />
        
                <section id="comments" className="mt-12 scroll-mt-24">
                  <h2 className="mb-5 text-headline text-ink">
                    Comments ({comments.length})
                  </h2>
                  <CommentComposer />
                  <div className="mt-8">
                    {comments.map(({ replies, ...c }) => (
                      <div key={c.id} className="border-t border-hairline">
                        <CommentItem comment={c} replies={replies} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center pt-4">
                    <Button variant="secondary">Load more comments</Button>
                  </div>
                </section>
        
                {related.length ? (
                  <section className="mt-16">
                    <h2 className="mb-5 text-eyebrow tracking-[0.4px] text-ink-subtle uppercase">
                      Related reading
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {related.map((b) => (
                        <BlogGridCard key={b.id} blog={b} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </article>
    )
}