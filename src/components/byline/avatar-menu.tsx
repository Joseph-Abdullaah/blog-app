"use client"

import { authClient } from "@/lib/auth-client"

import {
  ChartNoAxesColumnIcon,
  LogOutIcon,
  PenLineIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AuthorSummary } from "./types"
import { UserAvatar } from "./user-avatar"

async function handleSignOut() {
  await authClient.signOut()
}

function AvatarMenu({
  user,
}: {
  user: AuthorSummary
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account menu"
            className="p-0"
          />
        }
      >
        <UserAvatar name={user.name} src={user.image} size="lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col px-2.5 py-2">
            <span className="text-body-sm font-medium text-ink">{user.name}</span>
            <span className="text-caption text-ink-subtle">@{user.username}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={`/u/${user.username}`} />}>
            <UserIcon aria-hidden />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/editor" />}>
            <PenLineIcon aria-hidden />
            Write
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/blogs" />}>
            <ChartNoAxesColumnIcon aria-hidden />
            Manage Blogs
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings/profile" />}>
            <SettingsIcon aria-hidden />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AvatarMenu }
