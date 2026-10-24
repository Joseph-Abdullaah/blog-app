import { handler, ok, optionalApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { getBlogDetail } from "@/lib/services/feed"

type Context = { params: Promise<{ slug: string }> }

/** E14 — a published blog by slug; drafts and unknown slugs are 404 (FR-READ-01). */
export const GET = handler(async (_request: Request, { params }: Context) => {
  const { slug } = await params
  const user = await optionalApiUser()
  const blog = await getBlogDetail(slug, user?.id)
  if (!blog) throw ApiError.notFound("Blog not found")
  return ok(blog)
})
