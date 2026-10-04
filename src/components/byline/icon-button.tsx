import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { UnreadDot } from "./unread-dot"

type IconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "variant" | "size" | "render" | "nativeButton"
> & {
  icon: LucideIcon
  /** Required: accessible name, also shown as the tooltip. */
  label: string
  /** surface-1 fill instead of ghost. */
  filled?: boolean
  dot?: boolean
  size?: "sm" | "md"
  href?: string
}

/** Circular icon-only button (32 / 40). With `href` it renders a link. */
function IconButton({
  icon: Icon,
  label,
  filled = false,
  dot = false,
  size = "md",
  href,
  className,
  ...props
}: IconButtonProps) {
  const variant = filled ? "secondary" : "ghost"
  const buttonSize = size === "sm" ? "icon-sm" : "icon"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          href ? (
            <Link
              href={href}
              aria-label={label}
              className={cn(
                buttonVariants({ variant, size: buttonSize }),
                "relative",
                className
              )}
            />
          ) : (
            <Button
              variant={variant}
              size={buttonSize}
              aria-label={label}
              className={cn("relative", className)}
              {...props}
            />
          )
        }
      >
        <Icon aria-hidden />
        {dot ? <UnreadDot overlay /> : null}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export { IconButton }
