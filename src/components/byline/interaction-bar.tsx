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
  const [liked, setLiked] = React.useState(initialLiked)
  const [count, setCount] = React.useState(initialCount)

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className={cn("px-2", liked && "text-like hover:text-like")}
      onClick={() => {
        const next = !liked
        setLiked(next)
        setCount((c) => c + (next ? 1 : -1))
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

const shareTargets = [
  { label: "X", href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  { label: "Facebook", href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { label: "LinkedIn", href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { label: "WhatsApp", href: (u: string, t: string) => `https://wa.me/?text=${t}%20${u}` },
]

/** Share dropdown: copy link, social targets, email. */
function ShareMenu({ url, title }: { url?: string; title?: string }) {
  function target() {
    return {
      u: encodeURIComponent(url ?? window.location.href),
      t: encodeURIComponent(title ?? document.title),
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="px-2" />}
      >
        <Share2Icon className="size-5" aria-hidden />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(url ?? window.location.href)
              toast.add({ title: "Link copied", type: "success" })
            }}
          >
            <Link2Icon aria-hidden />
            Copy link
          </DropdownMenuItem>
          {shareTargets.map((s) => (
            <DropdownMenuItem
              key={s.label}
              onClick={() => {
                const { u, t } = target()
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
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-6 border-y border-hairline",
        className
      )}
    >
      <LikeButton liked={liked} count={likes} onToggle={onToggleLike} />
      <Button
        variant="ghost"
        size="sm"
        className="px-2"
        render={<a href="#comments" />}
        nativeButton={false}
      >
        <MessageCircleIcon className="size-5" aria-hidden />
        {formatCount(comments)}
        <span className="sr-only">comments</span>
      </Button>
      <div className="ml-auto">
        <ShareMenu url={url} title={title} />
      </div>
    </div>
  )
}

export { InteractionBar, LikeButton, ShareMenu }
