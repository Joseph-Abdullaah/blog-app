import * as z from "zod"

import {
  handler,
  ok,
  paginationSchema,
  parseOrThrow,
  requireApiUser,
  searchParamsObject,
} from "@/lib/api"
import { listMyBlogs } from "@/lib/services/dashboard"

const querySchema = paginationSchema.extend({
  status: z.enum(["PUBLISHED", "DRAFT"]),
  q: z.string().trim().max(120).optional(),
})

/** E15 — the member's blogs for the dashboard (FR-DASH-01). */
export const GET = handler(async (request: Request) => {
  const user = await requireApiUser()
  const { status, q, cursor, limit } = parseOrThrow(querySchema, searchParamsObject(request))
  const { data, nextCursor } = await listMyBlogs(user.id, { status, q: q || undefined, cursor, limit })
  return ok(data, { meta: { nextCursor } })
})
