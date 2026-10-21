import { handler, ok, parseOrThrow, readJson, requireApiUser } from "@/lib/api"
import { publishBlog } from "@/lib/services/blogs"
import { publishBlogSchema } from "@/lib/validations/blog"

type Context = { params: Promise<{ blogId: string }> }

/** E12 — publish or update; full body, publish rules (FR-PUB-03…08). */
export const POST = handler(async (request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  const input = parseOrThrow(publishBlogSchema, await readJson(request))
  return ok(await publishBlog(user.id, blogId, input))
})
