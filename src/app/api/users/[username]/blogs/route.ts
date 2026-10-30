import { handler, ok, paginationSchema, parseOrThrow, searchParamsObject } from "@/lib/api"
import { listUserBlogs } from "@/lib/services/users"

type Context = { params: Promise<{ username: string }> }

/** E5 — a user's published blogs, newest first. */
export const GET = handler(async (request: Request, { params }: Context) => {
  const { username } = await params
  const page = parseOrThrow(paginationSchema, searchParamsObject(request))
  const { data, nextCursor } = await listUserBlogs(username, page)
  return ok(data, { meta: { nextCursor } })
})
