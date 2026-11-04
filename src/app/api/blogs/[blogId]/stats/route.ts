import { handler, ok, requireApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { blogStats } from "@/lib/services/dashboard"

type Context = { params: Promise<{ blogId: string }> }

/** E16 — stats for a blog you own (FR-DASH-04). */
export const GET = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  const stats = await blogStats(user.id, blogId)
  if (!stats) throw ApiError.notFound("Blog not found")
  return ok(stats)
})
