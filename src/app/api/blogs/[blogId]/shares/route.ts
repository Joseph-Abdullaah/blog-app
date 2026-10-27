import { handler, ok, optionalApiUser, parseOrThrow, readJson } from "@/lib/api"
import { recordShare } from "@/lib/services/interactions"
import { shareSchema } from "@/lib/validations/interactions"
import { visitorId } from "@/lib/visitor"

type Context = { params: Promise<{ blogId: string }> }

/** E20 — record a share from the share menu (FR-SHR-01…03). */
export const POST = handler(async (request: Request, { params }: Context) => {
  const { blogId } = await params
  const { channel } = parseOrThrow(shareSchema, await readJson(request))
  const [user, visitor] = await Promise.all([optionalApiUser(), visitorId()])
  return ok(await recordShare(blogId, channel, visitor, user?.id ?? null), { status: 201 })
})
