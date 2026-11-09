import * as z from "zod"

import {
  handler,
  ok,
  paginationSchema,
  parseOrThrow,
  requireApiUser,
  searchParamsObject,
} from "@/lib/api"
import { listNotifications, NOTIFICATION_FILTERS, type NotificationFilter } from "@/lib/services/notifications"

const querySchema = paginationSchema.extend({
  type: z
    .enum(Object.keys(NOTIFICATION_FILTERS) as [NotificationFilter, ...NotificationFilter[]])
    .default("all"),
})

/** E27 — the signed-in member's notifications, newest first (FR-NOTF-02). */
export const GET = handler(async (request: Request) => {
  const user = await requireApiUser()
  const { type, cursor, limit } = parseOrThrow(querySchema, searchParamsObject(request))
  const { data, nextCursor } = await listNotifications(user.id, { filter: type, cursor, limit })
  return ok(data, { meta: { nextCursor } })
})
