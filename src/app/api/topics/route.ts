import { handler, ok, parseOrThrow, searchParamsObject } from "@/lib/api"
import { searchTopics } from "@/lib/services/topics"
import { topicSearchSchema } from "@/lib/validations/blog"

/** E26 — autocomplete with `q`, or the most-used topics without it. */
export const GET = handler(async (request: Request) => {
  const { q, limit } = parseOrThrow(topicSearchSchema, searchParamsObject(request))
  return ok(await searchTopics(q || undefined, limit))
})
