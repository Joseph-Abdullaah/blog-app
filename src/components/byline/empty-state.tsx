import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/** Centered icon in a 64px surface-1 circle, title, optional description and action. */
function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  children,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  /** Optional action, usually a Button. */
  children?: React.ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
    </Empty>
  )
}

export { EmptyState }
