import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

/** The "b" mark (swaps by theme) with the lowercase "byline" wordmark set live in Inter 600. */
function Logo({
  wordmark = true,
  href = "/",
  size = 32,
  className,
}: {
  wordmark?: boolean
  href?: string
  /** Mark size in px. */
  size?: number
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label="Byline home"
      className={cn("inline-flex items-center gap-2 rounded-xs", className)}
    >
      <Image
        src="/brand/byline-mark-ink.png"
        alt=""
        width={size}
        height={size}
        priority
        style={{ width: size, height: size }}
        className="dark:hidden"
      />
      <Image
        src="/brand/byline-mark-light.png"
        alt=""
        width={size}
        height={size}
        priority
        style={{ width: size, height: size }}
        className="hidden dark:block"
      />
      {wordmark ? (
        <span className="text-title font-semibold tracking-[-0.5px] text-ink">
          byline
        </span>
      ) : null}
    </Link>
  )
}

export { Logo }
