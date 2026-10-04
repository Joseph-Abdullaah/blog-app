import { cn } from "@/lib/utils"
import { Navbar } from "./navbar"
import { SideNav, type SideNavKey } from "./side-nav"
import type { AuthorSummary } from "./types"

/** Navbar + SideNav + content, for S-11…S-15. */
function DashboardShell({
  user,
  active,
  unread,
  title,
  children,
  className,
}: {
  user: AuthorSummary
  active: SideNavKey
  unread?: boolean
  /** Page title (title-sm). */
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="min-h-svh bg-canvas">
      <Navbar user={user} unread={unread} />
      <div className="mx-auto flex max-w-wide flex-col lg:flex-row">
        <SideNav
          active={active}
          unread={unread}
          className="border-b border-hairline lg:border-r lg:border-b-0"
        />
        <main className={cn("min-w-0 flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-8", className)}>
          {title ? (
            <h1 className="mb-6 text-title-sm text-ink">{title}</h1>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}

export { DashboardShell }
