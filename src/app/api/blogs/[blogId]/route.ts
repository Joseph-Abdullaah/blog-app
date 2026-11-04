import { handler, ok, parseOrThrow, readJson, requireApiUser } from "@/lib/api"
import { NextResponse } from "next/server"
import { ApiError } from "@/lib/errors"
import { getEditableBlog, saveDraft } from "@/lib/services/blogs"
import { deleteBlog } from "@/lib/services/dashboard"
import { draftBlogSchema } from "@/lib/validations/blog"

type Context = { params: Promise<{ blogId: string }> }

/** E10 — owner view of a blog; 404 for non-owners (FR-EDIT-08). */
export const GET = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  const blog = await getEditableBlog(user.id, blogId)
  if (!blog) throw ApiError.notFound("Blog not found")
  return ok(blog)
})

/** E11 — save draft; 409 if the blog is published (FR-EDIT-05/09). */
export const PATCH = handler(async (request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  const input = parseOrThrow(draftBlogSchema, await readJson(request))
  return ok(await saveDraft(user.id, blogId, input))
})

/** E13 — delete a blog you own; everything referencing it cascades (FR-DASH-03). */
export const DELETE = handler(async (_request: Request, { params }: Context) => {
  const user = await requireApiUser()
  const { blogId } = await params
  await deleteBlog(user.id, blogId)
  return new NextResponse(null, { status: 204 })
})
