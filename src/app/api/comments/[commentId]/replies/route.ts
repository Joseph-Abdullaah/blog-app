import {
  handler,
  ok,
  optionalApiUser,
  paginationSchema,
  parseOrThrow,
  searchParamsObject,
} from "@/lib/api"
import { listReplies } from "@/lib/services/comments"

type Context = { params: Promise<{ commentId: string }> }

/** E23 — replies to a comment, oldest first. */
export const GET = handler(async (request: Request, { params }: Context) => {
  const { commentId } = await params
  const page = parseOrThrow(paginationSchema, searchParamsObject(request))
  const user = await optionalApiUser()
  const { data, nextCursor } = await listReplies(commentId, page, user?.id ?? null)
  return ok(data, { meta: { nextCursor } })
})
