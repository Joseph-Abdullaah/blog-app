import { handler, ok, parseOrThrow, readJson, requireApiUser } from "@/lib/api"
import { getMe, updateMe } from "@/lib/services/users"
import { updateProfileSchema } from "@/lib/validations/profile"

/** E1 — the signed-in member. */
export const GET = handler(async () => {
  const user = await requireApiUser()
  return ok(await getMe(user.id))
})

/** E2 — update name, username, bio, avatar and social links (FR-PROF-01/02/04). */
export const PATCH = handler(async (request: Request) => {
  const user = await requireApiUser()
  const input = parseOrThrow(updateProfileSchema, await readJson(request))
  return ok(await updateMe(user.id, input))
})
