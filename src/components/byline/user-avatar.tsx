import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"

type AvatarSize = React.ComponentProps<typeof Avatar>["size"]

/** Avatar with the Byline fallback: initials on surface-2. */
function UserAvatar({
  name,
  src,
  size = "default",
  className,
}: {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
}) {
  return (
    <Avatar size={size} className={className}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

export { UserAvatar }
