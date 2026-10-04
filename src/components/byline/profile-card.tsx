import { GlobeIcon, Link2Icon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { IconButton } from "./icon-button"
import { StatGroup } from "./stat-card"
import type { AuthorSummary } from "./types"
import { UserAvatar } from "./user-avatar"

type SocialKey =
  | "youtube"
  | "instagram"
  | "facebook"
  | "twitter"
  | "github"
  | "website"

type ProfileData = AuthorSummary & {
  blogs: number
  reads: number
  subscribers: number
  bio?: string
  socials?: Partial<Record<SocialKey, string>>
  joined: string | Date
}

const socialLabels: Record<SocialKey, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  github: "GitHub",
  website: "Website",
}

/** Profile summary: avatar, @username, stats, bio, social links, joined date. */
function ProfileCard({
  user,
  isSelf = false,
}: {
  user: ProfileData
  isSelf?: boolean
}) {
  const socials = Object.entries(user.socials ?? {}).filter(([, url]) => url)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <UserAvatar name={user.name} src={user.image} size="2xl" />
        <div className="flex flex-col">
          <h2 className="text-title-lg text-ink">@{user.username}</h2>
          <p className="text-body-sm text-ink-subtle">{user.name}</p>
        </div>
        <StatGroup
          items={[
            { label: "Blogs", value: user.blogs },
            { label: "Reads", value: user.reads },
            { label: "Subscribers", value: user.subscribers },
          ]}
        />
        {user.bio ? <p className="text-body text-ink-muted">{user.bio}</p> : null}
        {isSelf ? (
          <Button
            variant="secondary"
            render={<Link href="/settings/profile" />}
            nativeButton={false}
          >
            Edit Profile
          </Button>
        ) : null}
        {socials.length ? (
          <div className="flex items-center gap-1">
            {socials.map(([key, url]) => (
              <IconButton
                key={key}
                icon={key === "website" ? GlobeIcon : Link2Icon}
                label={socialLabels[key as SocialKey]}
                href={url}
              />
            ))}
          </div>
        ) : null}
        <p className="text-caption text-ink-subtle">
          Joined {formatDate(user.joined)}
        </p>
      </CardContent>
    </Card>
  )
}

export { ProfileCard }
export type { ProfileData }
