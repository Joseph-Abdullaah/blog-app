import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Loader2Icon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border border-transparent text-label whitespace-nowrap transition-[background-color,opacity,color] duration-fast ease-byline select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-88",
        secondary:
          "border-hairline bg-surface-1 text-ink hover:bg-surface-2 aria-expanded:bg-surface-2",
        ghost:
          "text-ink-muted hover:bg-surface-1 hover:text-ink aria-expanded:bg-surface-1 aria-expanded:text-ink",
        outline:
          "border-hairline-strong bg-transparent text-ink hover:bg-surface-1 aria-expanded:bg-surface-1",
        destructive: "bg-danger text-on-danger hover:opacity-90",
        chip: "bg-surface-2 text-ink hover:bg-surface-3",
        filter:
          "bg-surface-1 text-ink hover:bg-surface-2 aria-pressed:bg-ink aria-pressed:text-on-ink aria-pressed:hover:opacity-88",
        link: "rounded-xs text-brand underline-offset-4 hover:text-brand-hover hover:underline",
      },
      size: {
        default: "h-control-md px-4",
        sm: "h-control-sm px-3",
        lg: "h-control-lg px-6",
        chip: "h-8 px-3.5",
        filter: "h-10 px-5",
        xs: "h-6 gap-1 px-2.5 text-caption [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-control-md",
        "icon-sm": "size-control-sm [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-control-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Keeps the label and adds a leading spinner (Byline loading state). */
    loading?: boolean
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
