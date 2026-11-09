"use client"

import * as React from "react"
import {
  GlobeIcon,
  HeartIcon,
  Link2Icon,
  MailIcon,
  MessageCircleIcon,
  Share2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import { formatCount } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ShareChannel } from "@/types/dto"
import { useEngagement } from "./blog-engagement"

/** Heart toggle. Inactive ink-subtle; active filled `like`; pops once. */
function LikeButton({
  liked: initialLiked = false,
  count: initialCount,
  onToggle,
}: {
  liked?: boolean
  count: number
  onToggle?: (liked: boolean) => void
}) {
  const engagement = useEngagement()
  const [localLiked, setLocalLiked] = React.useState(initialLiked)
  const [localCount, setLocalCount] = React.useState(initialCount)

  const liked = engagement ? engagement.liked : localLiked
  const count = engagement ? engagement.likes : localCount
  const ownBlog = engagement?.isAuthor ?? false

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={liked}
      aria-label={ownBlog ? "Likes" : liked ? "Unlike" : "Like"}
      title={ownBlog ? "You can't like your own blog" : undefined}
      disabled={ownBlog}
      className={cn("px-2 disabled:opacity-100", liked && "text-like hover:text-like")}
      onClick={() => {
        if (engagement) return engagement.toggleLike()
        const next = !localLiked
        setLocalLiked(next)
        setLocalCount((c) => c + (next ? 1 : -1))
        onToggle?.(next)
      }}
    >
      <HeartIcon
        key={String(liked)}
        className={cn(
          "size-5",
          liked && "animate-[byline-pop_240ms_var(--ease-byline)] fill-current"
        )}
        aria-hidden
      />
      <span className="text-body-sm">{formatCount(count)}</span>
    </Button>
  )
}

const shareTargets: {
  channel: ShareChannel
  label: string
  href: (url: string, title: string) => string
}[] = [
  { channel: "X", label: "X", href: (u, t) => `https://x.com/intent/post?url=${u}&text=${t}` },
  { channel: "FACEBOOK", label: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { channel: "LINKEDIN", label: "LinkedIn", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { channel: "WHATSAPP", label: "WhatsApp", href: (u, t) => `https://wa.me/?text=${t}%20${u}` },
]

/** Share dropdown: copy link, social targets, email (FR-SHR-01). Each share is counted. */
function ShareMenu({ url, title }: { url?: string; title?: string }) {
  const engagement = useEngagement()

  function target() {
    const link =
      url ??
      (engagement ? `${window.location.origin}/blog/${engagement.slug}` : window.location.href)
    return {
      link,
      u: encodeURIComponent(link),
      t: encodeURIComponent(title ?? engagement?.title ?? document.title),
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="px-2" />}>
        <Share2Icon className="size-5" aria-hidden />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(target().link)
                engagement?.share("COPY_LINK")
                toast.add({ title: "Link copied", type: "success" })
              } catch {
                toast.add({ title: "Couldn't copy the link", type: "error" })
              }
            }}
          >
            <Link2Icon aria-hidden />
            Copy link
          </DropdownMenuItem>
          {shareTargets.map((s) => (
            <DropdownMenuItem
              key={s.channel}
              onClick={() => {
                const { u, t } = target()
                engagement?.share(s.channel)
                window.open(s.href(u, t), "_blank", "noopener,noreferrer")
              }}
            >
              <GlobeIcon aria-hidden />
              {s.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => {
              const { u, t } = target()
              engagement?.share("EMAIL")
              window.location.href = `mailto:?subject=${t}&body=${u}`
            }}
          >
            <MailIcon aria-hidden />
            Email
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Hairlines top and bottom, h-14: like, comments, share. */
function InteractionBar({
  likes,
  comments,
  liked,
  onToggleLike,
  url,
  title,
  className,
}: {
  likes: number
  comments: number
  liked?: boolean
  onToggleLike?: (liked: boolean) => void
  url?: string
  title?: string
  className?: string
}) {
  const engagement = useEngagement()
  const commentCount = engagement ? engagement.comments : comments

  return (
    <div className={cn("flex h-14 items-center gap-6 border-y border-hairline", className)}>
      <LikeButton liked={liked} count={likes} onToggle={onToggleLike} />
      <Button
        variant="ghost"
        size="sm"
        className="px-2"
        render={<a href="#comments" />}
        nativeButton={false}
      >
        <MessageCircleIcon className="size-5" aria-hidden />
        {formatCount(commentCount)}
        <span className="sr-only">comments</span>
      </Button>
      <div className="ml-auto">
        <ShareMenu url={url} title={title} />
      </div>
    </div>
  )
}

export { InteractionBar, LikeButton, ShareMenu }
