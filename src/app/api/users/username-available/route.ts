import { handler, ok, requireApiUser, searchParamsObject } from "@/lib/api"
import { usernameAvailability } from "@/lib/services/users"

/** E3 — username availability for the Edit Profile form (FR-PROF-03). */
export const GET = handler(async (request: Request) => {
  const user = await requireApiUser()
  const { username = "" } = searchParamsObject(request)
  return ok(await usernameAvailability(username, user.id))
})
