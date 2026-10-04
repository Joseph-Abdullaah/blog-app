import {
  BellIcon,
  FileTextIcon,
  LockIcon,
  PenLineIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UnreadDot } from "./unread-dot"

const items = [
  { key: "Blogs", label: "Blogs", href: "/dashboard/blogs", icon: FileTextIcon },
  {
    key: "Notifications",
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: BellIcon,
  },
  { key: "Write", label: "Write", href: "/editor", icon: PenLineIcon },
  {
    key: "Edit Profile",
    label: "Edit Profile",
    href: "/settings/profile",
    icon: UserIcon,
  },
  {
    key: "Change Password",
    label: "Change Password",
    href: "/settings/password",
    icon: LockIcon,
  },
] as const

type SideNavKey = (typeof items)[number]["key"]

/** Dashboard navigation: a 240px column from lg, a scrolling row below. Active = surface-1 + 2px ink edge. */
function SideNav({
  active,
  unread = false,
  className,
}: {
  active?: SideNavKey
  unread?: boolean
  className?: string
}) {
  return (
    <nav
      aria-label="Dashboard"
      className={cn(
        "flex overflow-x-auto lg:w-sidenav lg:flex-col lg:overflow-visible",
        className
      )}
    >
      {items.map(({ key, label, href, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          aria-current={active === key ? "page" : undefined}
          className="h-11 shrink-0 justify-start rounded-none px-6 text-body-sm aria-[current=page]:bg-surface-1 aria-[current=page]:text-ink aria-[current=page]:shadow-[inset_0_-2px_0_var(--ink)] lg:aria-[current=page]:shadow-[inset_-2px_0_0_var(--ink)]"
          render={<Link href={href} />}
          nativeButton={false}
        >
          <Icon className="size-4" aria-hidden />
          {label}
          {key === "Notifications" && unread ? <UnreadDot /> : null}
        </Button>
      ))}
    </nav>
  )
}

export { SideNav }
export type { SideNavKey }
