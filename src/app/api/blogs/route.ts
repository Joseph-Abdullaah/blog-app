import { handler, ok, parseOrThrow, readJson, requireApiUser } from "@/lib/api"
import { createDraft } from "@/lib/services/blogs"
import { draftBlogSchema } from "@/lib/validations/blog"

/** E9 — create a draft (FR-EDIT-01/05). */
export const POST = handler(async (request: Request) => {
  const user = await requireApiUser()
  const input = parseOrThrow(draftBlogSchema, await readJson(request))
  return ok(await createDraft(user.id, input), { status: 201 })
})
