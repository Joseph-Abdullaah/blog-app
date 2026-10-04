import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCount } from "@/lib/format"

/** Label in caption, number in display-sm. */
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon?: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-caption text-ink-subtle">
          {Icon ? <Icon className="size-4" aria-hidden /> : null}
          {label}
        </div>
        <div className="text-display-sm text-ink">{formatCount(value)}</div>
      </CardContent>
    </Card>
  )
}

/** Inline stats separated by hairline verticals (profile, post header). */
function StatGroup({
  items,
}: {
  items: { label: string; value: number }[]
}) {
  return (
    <dl className="flex items-stretch">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            i === 0
              ? "flex flex-col pr-6"
              : "flex flex-col border-l border-hairline px-6"
          }
        >
          <dd className="text-title text-ink">{formatCount(item.value)}</dd>
          <dt className="text-caption text-ink-subtle">{item.label}</dt>
        </div>
      ))}
    </dl>
  )
}

export { StatCard, StatGroup }
