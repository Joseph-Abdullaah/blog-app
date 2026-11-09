import * as z from "zod"

import {
  handler,
  ok,
  paginationSchema,
  parseOrThrow,
  readJson,
  requireApiUser,
  searchParamsObject,
} from "@/lib/api"
import { createDraft } from "@/lib/services/blogs"
import { getFeed } from "@/lib/services/feed"
import { draftBlogSchema } from "@/lib/validations/blog"

const feedQuerySchema = paginationSchema.extend({
  sort: z.enum(["latest", "trending"]).default("latest"),
  topic: z.string().trim().min(1).optional(),
})

/** E8 — home feed: `sort=latest|trending`, optional `topic` slug, cursor pagination. */
export const GET = handler(async (request: Request) => {
  const query = parseOrThrow(feedQuerySchema, searchParamsObject(request))
  const { data, nextCursor } = await getFeed(query)
  return ok(data, { meta: { nextCursor } })
})

/** E9 — create a draft (FR-EDIT-01/05). */
export const POST = handler(async (request: Request) => {
  const user = await requireApiUser()
  const input = parseOrThrow(draftBlogSchema, await readJson(request))
  return ok(await createDraft(user.id, input), { status: 201 })
})
