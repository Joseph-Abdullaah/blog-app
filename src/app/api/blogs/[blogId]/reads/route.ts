import { handler, ok, optionalApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { recordRead } from "@/lib/services/feed"
import { visitorId } from "@/lib/visitor"

type Context = { params: Promise<{ blogId: string }> }

/** E19 — record a read (called after 10 s visible; FR-READ-04). */
export const POST = handler(async (_request: Request, { params }: Context) => {
  const { blogId } = await params
  const [user, visitor] = await Promise.all([optionalApiUser(), visitorId()])
  const result = await recordRead(blogId, visitor, user?.id ?? null)
  if (!result) throw ApiError.notFound("Blog not found")
  return ok(result)
})
