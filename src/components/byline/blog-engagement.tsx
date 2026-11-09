"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { toast } from "@/components/ui/toast"
import type { ShareChannel } from "@/types/dto"

type Engagement = {
  blogId: string
  slug: string
  title: string
  signedIn: boolean
  isAuthor: boolean
  liked: boolean
  likes: number
  comments: number
  liking: boolean
  toggleLike: () => void
  share: (channel: ShareChannel) => void
  /** Adjust the shown comment count after adding or deleting comments. */
  setComments: (count: number | ((n: number) => number)) => void
  /** Send guests to sign-in and back to this blog (FR-LIKE-03). */
  requireSignIn: () => boolean
}

const EngagementContext = React.createContext<Engagement | null>(null)

export function useEngagement() {
  return React.useContext(EngagementContext)
}

/**
 * Shared like / share / comment state for one blog page, so both interaction
 * bars and the comments section stay in sync. Server content passes through as children.
 */
export function BlogEngagementProvider({
  blogId,
  slug,
  title,
  signedIn,
  isAuthor,
  liked: initialLiked,
  likes: initialLikes,
  comments: initialComments,
  children,
}: {
  blogId: string
  slug: string
  title: string
  signedIn: boolean
  isAuthor: boolean
  liked: boolean
  likes: number
  comments: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const [liked, setLiked] = React.useState(initialLiked)
  const [likes, setLikes] = React.useState(initialLikes)
  const [comments, setComments] = React.useState(initialComments)
  const [liking, setLiking] = React.useState(false)

  const requireSignIn = React.useCallback(() => {
    if (signedIn) return false
    router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/blog/${slug}`)}`)
    return true
  }, [router, signedIn, slug])

  const toggleLike = React.useCallback(async () => {
    if (requireSignIn() || isAuthor || liking) return
    const next = !liked
    // Optimistic: flip now, reconcile with the server's count.
    setLiked(next)
    setLikes((n) => n + (next ? 1 : -1))
    setLiking(true)
    try {
      const res = await fetch(`/api/blogs/${blogId}/like`, { method: next ? "PUT" : "DELETE" })
      const body = (await res.json()) as {
        data?: { liked: boolean; likesCount: number }
        error?: { message: string }
      }
      if (!res.ok || !body.data) throw new Error(body.error?.message)
      setLiked(body.data.liked)
      setLikes(body.data.likesCount)
    } catch (error) {
      setLiked(!next)
      setLikes((n) => n + (next ? -1 : 1))
      toast.add({
        title: "Couldn't update your like",
        description: (error as Error).message || "Try again.",
        type: "error",
      })
    } finally {
      setLiking(false)
    }
  }, [blogId, isAuthor, liked, liking, requireSignIn])

  const share = React.useCallback(
    (channel: ShareChannel) => {
      // Fire and forget: a failed count shouldn't block sharing.
      void fetch(`/api/blogs/${blogId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
        keepalive: true,
      })
    },
    [blogId]
  )

  const value = React.useMemo<Engagement>(
    () => ({
      blogId,
      slug,
      title,
      signedIn,
      isAuthor,
      liked,
      likes,
      comments,
      liking,
      toggleLike: () => void toggleLike(),
      share,
      setComments,
      requireSignIn,
    }),
    [blogId, slug, title, signedIn, isAuthor, liked, likes, comments, liking, toggleLike, share, requireSignIn]
  )

  return <EngagementContext value={value}>{children}</EngagementContext>
}
