import Link from "next/link"

import type { AuthorSummary } from "./types"
import { SubscribeButton } from "./subscribe-button"
import { UserAvatar } from "./user-avatar"

/** Search / subscriber row: avatar, name, @username, one-line bio, Subscribe. */
function UserListItem({
  user,
}: {
  user: AuthorSummary & { bio?: string; subscribed?: boolean }
}) {
  return (
    <div className="flex items-center gap-4 border-b border-hairline py-4">
      <Link
        href={`/u/${user.username}`}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-md"
      >
        <UserAvatar name={user.name} src={user.image} size="xl" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-title text-ink">{user.name}</span>
          <span className="truncate text-body-sm text-ink-subtle">
            @{user.username}
          </span>
          {user.bio ? (
            <span className="truncate text-body-sm text-ink-muted">
              {user.bio}
            </span>
          ) : null}
        </span>
      </Link>
      <SubscribeButton subscribed={user.subscribed} name={user.name} />
    </div>
  )
}

export { UserListItem }
