import type { Prisma } from "../../../generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { topicSlug } from "@/lib/slug"
import { normalizeTopicName } from "@/lib/validations/blog"
import type { TopicDTO } from "@/types/dto"

type Tx = Prisma.TransactionClient

export const topicSelect = { id: true, name: true, slug: true } as const

/** Find or create topics by slug in two queries (FR-PUB-04). Duplicates by slug are merged. */
export async function upsertTopics(
  db: Tx | typeof prisma,
  names: string[]
): Promise<TopicDTO[]> {
  const bySlug = new Map<string, string>()
  for (const raw of names) {
    const name = normalizeTopicName(raw)
    const slug = topicSlug(name)
    if (slug && !bySlug.has(slug)) bySlug.set(slug, name)
  }
  if (!bySlug.size) return []

  await db.topic.createMany({
    data: [...bySlug].map(([slug, name]) => ({ slug, name })),
    skipDuplicates: true,
  })
  const topics = await db.topic.findMany({
    where: { slug: { in: [...bySlug.keys()] } },
    select: topicSelect,
  })
  // Keep the order the author typed them in.
  const order = [...bySlug.keys()]
  return topics.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
}

/** Replace a blog's topic links with the given names. Orphaned topics are kept. */
export async function replaceBlogTopics(db: Tx, blogId: string, names: string[]) {
  const topics = await upsertTopics(db, names)
  await db.blogTopic.deleteMany({ where: { blogId } })
  if (topics.length) {
    await db.blogTopic.createMany({
      data: topics.map((t) => ({ blogId, topicId: t.id })),
      skipDuplicates: true,
    })
  }
  return topics
}

/**
 * E26 — with `q`: names containing it, best matches first (autocomplete).
 * Without `q`: the topics with the most published blogs.
 */
export async function searchTopics(q: string | undefined, limit: number) {
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {}

  const topics = await prisma.topic.findMany({
    where,
    select: {
      ...topicSelect,
      _count: { select: { blogs: { where: { blog: { status: "PUBLISHED" } } } } },
    },
    orderBy: q ? [{ name: "asc" }] : [{ blogs: { _count: "desc" } }, { name: "asc" }],
    take: q ? Math.max(limit * 3, 20) : limit,
  })

  const results = topics.map(({ _count, ...t }) => ({
    ...t,
    blogsCount: _count.blogs,
  }))

  if (!q) return results.slice(0, limit)

  // Rank: exact, then prefix, then contains; ties by popularity.
  const needle = q.toLowerCase()
  const rank = (name: string) => {
    const n = name.toLowerCase()
    return n === needle ? 0 : n.startsWith(needle) ? 1 : 2
  }
  return results
    .sort((a, b) => rank(a.name) - rank(b.name) || b.blogsCount - a.blogsCount)
    .slice(0, limit)
}
