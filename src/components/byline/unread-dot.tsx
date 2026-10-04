import { cn } from "@/lib/utils"

/** 8px brand dot. `overlay` pins it to the corner of an icon with a 2px canvas ring. */
function UnreadDot({
  overlay = false,
  className,
}: {
  overlay?: boolean
  className?: string
}) {
  return (
    <span
      role="status"
      aria-label="Unread"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full bg-brand",
        overlay && "absolute top-2 right-2 ring-2 ring-canvas",
        className
      )}
    />
  )
}

export { UnreadDot }
