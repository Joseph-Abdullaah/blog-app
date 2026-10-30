import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { latestBlogs } from "@/lib/services/feed"
import type { PublicProfile, Socials } from "@/types/dto"

export const socialsSelect = {
  youtube: true,
  instagram: true,
  facebook: true,
  twitter: true,
  github: true,
  website: true,
} as const

export function toSocials(u: Record<keyof Socials, string | null>): Socials {
  return {
    youtube: u.youtube,
    instagram: u.instagram,
    facebook: u.facebook,
    twitter: u.twitter,
    github: u.github,
    website: u.website,
  }
}

/** E4 — public profile with stats and the viewer's relationship (FR-PROF-06). */
export async function getPublicProfile(
  username: string,
  viewerId: string | null
): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      createdAt: true,
      ...socialsSelect,
      _count: { select: { subscribers: true } },
    },
  })
  if (!user) return null

  const [stats, subscription] = await Promise.all([
    prisma.blog.aggregate({
      where: { authorId: user.id, status: "PUBLISHED" },
      _count: { _all: true },
      _sum: { readsCount: true },
    }),
    viewerId && viewerId !== user.id
      ? prisma.subscription.findUnique({
          where: { subscriberId_authorId: { subscriberId: viewerId, authorId: user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ])

  return {
    id: user.id,
    name: user.name,
    username: user.username ?? username,
    image: user.image,
    bio: user.bio,
    socials: toSocials(user),
    joinedAt: user.createdAt.toISOString(),
    stats: {
      blogsCount: stats._count._all,
      totalReads: stats._sum.readsCount ?? 0,
      subscribersCount: user._count.subscribers,
    },
    viewer: { isSelf: viewerId === user.id, subscribed: Boolean(subscription) },
  }
}

/** E5 — a user's published blogs, newest first. */
export async function listUserBlogs(
  username: string,
  page: { cursor?: string; limit: number }
) {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  })
  if (!user) throw ApiError.notFound("User not found")
  return latestBlogs({ ...page, where: { authorId: user.id } })
}

/* ─────────────── Subscriptions (E6/E7) ─────────────── */

async function authorByUsername(username: string) {
  const author = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  })
  if (!author) throw ApiError.notFound("User not found")
  return author
}

const countSubscribers = (authorId: string) =>
  prisma.subscription.count({ where: { authorId } })

/** Idempotent subscribe; notifies the author the first time (FR-SUB-01/02). */
export async function subscribe(subscriberId: string, username: string) {
  const author = await authorByUsername(username)
  if (author.id === subscriberId) throw ApiError.forbidden("You can't subscribe to yourself")

  await prisma.$transaction(async (tx) => {
    const created = await tx.subscription.createMany({
      data: [{ subscriberId, authorId: author.id }],
      skipDuplicates: true,
    })
    if (created.count) {
      await tx.notification.create({
        data: { type: "SUBSCRIBE", recipientId: author.id, actorId: subscriberId },
      })
    }
  })
  return { subscribed: true, subscribersCount: await countSubscribers(author.id) }
}

/** Idempotent unsubscribe; removes the SUBSCRIBE notification if still unread. */
export async function unsubscribe(subscriberId: string, username: string) {
  const author = await authorByUsername(username)

  await prisma.$transaction([
    prisma.subscription.deleteMany({ where: { subscriberId, authorId: author.id } }),
    prisma.notification.deleteMany({
      where: { type: "SUBSCRIBE", actorId: subscriberId, recipientId: author.id, isRead: false },
    }),
  ])
  return { subscribed: false, subscribersCount: await countSubscribers(author.id) }
}
