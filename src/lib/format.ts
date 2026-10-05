/** Compact counts: 1.2k, 3.4M. */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${trim(n / 1000)}k`
  return `${trim(n / 1_000_000)}M`
}

function trim(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(/\.0$/, "")
}

/** Relative under 7 days ("2h", "3d"), otherwise "27 Sep" / "27 Sep 2025". */
export function formatDate(input: Date | string | number, now = new Date()): string {
  const date = new Date(input)
  const diff = now.getTime() - date.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff >= 0 && diff < 7 * day) {
    if (diff < minute) return "now"
    if (diff < hour) return `${Math.floor(diff / minute)}m`
    if (diff < day) return `${Math.floor(diff / hour)}h`
    return `${Math.floor(diff / day)}d`
  }
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}
