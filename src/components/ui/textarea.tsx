import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-30 w-full resize-none rounded-md border border-transparent bg-surface-1 px-3.5 py-3 text-body text-ink transition-[border-color] duration-fast ease-byline placeholder:text-ink-subtle hover:border-hairline-strong read-only:text-ink-subtle disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
