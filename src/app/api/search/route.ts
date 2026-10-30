import * as z from "zod"

import {
  handler,
  ok,
  optionalApiUser,
  paginationSchema,
  parseOrThrow,
  searchParamsObject,
} from "@/lib/api"
import { searchBlogs, searchUsers } from "@/lib/services/search"

const searchQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1, "Enter something to search for").max(100),
  type: z.enum(["blogs", "users"]).default("blogs"),
  topic: z.string().trim().min(1).optional(),
})

/** E25 — search blogs (default) or users (FR-SRCH-01…03). */
export const GET = handler(async (request: Request) => {
  const { q, type, topic, cursor, limit } = parseOrThrow(
    searchQuerySchema,
    searchParamsObject(request)
  )
  if (type === "users") {
    const user = await optionalApiUser()
    const { data, nextCursor } = await searchUsers({ q, cursor, limit, viewerId: user?.id ?? null })
    return ok(data, { meta: { nextCursor } })
  }
  const { data, nextCursor } = await searchBlogs({ q, topic, cursor, limit })
  return ok(data, { meta: { nextCursor } })
})
