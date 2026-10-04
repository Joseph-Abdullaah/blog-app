import { BellIcon, PenLineIcon, SearchIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AvatarMenu } from "./avatar-menu"
import { IconButton } from "./icon-button"
import { Logo } from "./logo"
import { SearchInput } from "./search-input"
import type { AuthorSummary } from "./types"


function Navbar({
  user,
  unread = false,
  className,
}: {
  user?: AuthorSummary | null
  unread?: boolean
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-navbar border-b border-hairline bg-canvas/85 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-wide items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <SearchInput className="hidden max-w-xs md:block" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <IconButton
            icon={SearchIcon}
            label="Search"
            href="/search"
            className="md:hidden"
          />
          
          {user ? (
            <>
              <Button
                variant="ghost"
                render={<Link href="/editor" />}
                nativeButton={false}
              >
                <PenLineIcon aria-hidden />
                Write
              </Button>
              <IconButton
                icon={BellIcon}
                label="Notifications"
                href="/dashboard/notifications"
                dot={unread}
                filled
              />
              <AvatarMenu user={user}  />
            </>
          ) : (
            <Button render={<Link href="/sign-in" />} nativeButton={false}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export { Navbar }
