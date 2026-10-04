import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-input w-full min-w-0 rounded-md border border-transparent bg-surface-1 px-3.5 text-body text-ink transition-[border-color] duration-fast ease-byline file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-ink placeholder:text-ink-subtle hover:border-hairline-strong read-only:text-ink-subtle disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
