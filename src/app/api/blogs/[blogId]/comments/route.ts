import {
  handler,
  ok,
  optionalApiUser,
  paginationSchema,
  parseOrThrow,
  readJson,
  requireApiUser,
  searchParamsObject,
} from "@/lib/api"
import { createComment, listComments } from "@/lib/services/comments"
import { commentSchema } from "@/lib/validations/interactions"

type Context = { params: Promise<{ blogId: string }> }

/** E21 — top-level comments, newest first. */
export const GET = handler(async (request: Request, { params }: Context) => {
  const { blogId } = await params
  const page = parseOrThrow(paginationSchema, searchParamsObject(request))
  const user = await optionalApiUser()
  const { data, nextCursor } = await listComments(blogId, page, user?.id ?? null)
  return ok(data, { meta: { nextCursor } })
})

/** E22 — comment or reply. */
export const POST = handler(async (request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  const { content, parentId } = parseOrThrow(commentSchema, await readJson(request))
  return ok(await createComment(user.id, blogId, content, parentId), { status: 201 })
})
