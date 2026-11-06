import { ApiError } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { latestBlogs } from "@/lib/services/feed"
import {
  profileUsernameSchema,
  type UpdateProfileValues,
} from "@/lib/validations/profile"
import type { Me, PublicProfile, Socials } from "@/types/dto"

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

/* ─────────────── The signed-in member (E1–E3) ─────────────── */

const meSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  bio: true,
  createdAt: true,
  ...socialsSelect,
  accounts: { where: { providerId: "credential" }, select: { id: true } },
} as const

/** E1 — the member's own profile; `hasPassword` is false for Google-only accounts. */
export async function getMe(userId: string): Promise<Me> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: meSelect })
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username ?? "",
    image: user.image,
    bio: user.bio,
    socials: toSocials(user),
    hasPassword: user.accounts.length > 0,
    createdAt: user.createdAt.toISOString(),
  }
}

/** E3 — `available` is true for the member's current username (FR-PROF-03). */
export async function usernameAvailability(raw: string, userId: string) {
  const parsed = profileUsernameSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? ""
    return {
      available: false,
      reason: (message.includes("reserved") ? "RESERVED" : "INVALID") as "RESERVED" | "INVALID",
      message,
    }
  }
  const owner = await prisma.user.findUnique({
    where: { username: parsed.data },
    select: { id: true },
  })
  return owner && owner.id !== userId
    ? { available: false, reason: "TAKEN" as const, message: "That username is taken" }
    : { available: true, reason: null, message: null }
}

/** E2 — update only the fields sent; 409 when the username is taken. */
export async function updateMe(userId: string, input: UpdateProfileValues) {
  if (input.username) {
    const owner = await prisma.user.findUnique({
      where: { username: input.username },
      select: { id: true },
    })
    if (owner && owner.id !== userId) throw ApiError.conflict("That username is taken")
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.username !== undefined
          ? { username: input.username, displayUsername: input.username }
          : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
        ...(input.socials ?? {}),
      },
    })
  } catch (error) {
    // Lost a race for the same username.
    if ((error as { code?: string }).code === "P2002") {
      throw ApiError.conflict("That username is taken")
    }
    throw error
  }
  return getMe(userId)
}
