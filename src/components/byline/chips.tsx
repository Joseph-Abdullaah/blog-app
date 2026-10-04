import { XIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Topic pill. Links to the topic, or shows a remove × when `onRemove` is set. */
function TopicChip({
  children,
  href,
  onRemove,
  className,
}: {
  children: React.ReactNode
  href?: string
  onRemove?: () => void
  className?: string
}) {
  if (onRemove) {
    return (
      <Button
        type="button"
        variant="chip"
        size="chip"
        className={className}
        onClick={onRemove}
      >
        {children}
        <XIcon className="size-3.5" aria-hidden />
        <span className="sr-only">Remove</span>
      </Button>
    )
  }
  if (href) {
    return (
      <Button
        variant="chip"
        size="chip"
        className={className}
        render={<Link href={href} />}
        nativeButton={false}
      >
        {children}
      </Button>
    )
  }
  return (
    <Button
      variant="chip"
      size="chip"
      className={cn("pointer-events-none", className)}
    >
      {children}
    </Button>
  )
}

/** Toggle pill for filters; selected = ink fill. */
function FilterChip({
  children,
  selected = false,
  onClick,
  className,
}: {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="filter"
      size="filter"
      aria-pressed={selected}
      onClick={onClick}
      className={className}
    >
      {children}
    </Button>
  )
}

export { TopicChip, FilterChip }
