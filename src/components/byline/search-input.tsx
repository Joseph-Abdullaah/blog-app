import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

/** Pill search field (GET /search?q=). Shows a "/" shortcut hint on desktop. */
function SearchInput({
  placeholder = "Search",
  action = "/search",
  defaultValue,
  shortcut = true,
  className,
}: {
  placeholder?: string
  action?: string
  defaultValue?: string
  shortcut?: boolean
  className?: string
}) {
  return (
    <form action={action} role="search" className={cn("w-full", className)}>
      <InputGroup className="h-control-md rounded-pill">
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="q"
          aria-label={placeholder}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
        {shortcut ? (
          <InputGroupAddon align="inline-end" className="hidden md:flex">
            <InputGroupText
              aria-hidden
              className="rounded-xs bg-surface-2 px-1.5 text-caption"
            >
              /
            </InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </form>
  )
}

export { SearchInput }
