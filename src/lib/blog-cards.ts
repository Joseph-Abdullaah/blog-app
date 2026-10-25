import type { BlogCard } from "@/types/dto"

/** API `BlogCard` → props for `BlogListItem` / `BlogGridCard`. */
export function toCardProps(blog: BlogCard) {
  const topic = blog.topics[0]
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    author: blog.author,
    date: blog.publishedAt,
    topic: topic?.name,
    topicSlug: topic?.slug,
    likes: blog.likesCount,
    readTime: blog.readTimeMinutes,
    bannerUrl: blog.bannerUrl || null,
  }
}
