import { handler, ok, optionalApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { getPublicProfile } from "@/lib/services/users"

type Context = { params: Promise<{ username: string }> }

/** E4 — public profile. */
export const GET = handler(async (_request: Request, { params }: Context) => {
  const { username } = await params
  const user = await optionalApiUser()
  const profile = await getPublicProfile(username, user?.id ?? null)
  if (!profile) throw ApiError.notFound("User not found")
  return ok(profile)
})
