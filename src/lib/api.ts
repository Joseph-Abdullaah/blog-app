import { NextResponse } from "next/server"
import * as z from "zod"

import { getSession } from "@/lib/auth-guards"
import { ApiError, type ErrorCode } from "@/lib/errors"

/** `{ data, meta? }` success envelope (API spec §1.1). */
export function ok<T>(
  data: T,
  init?: { status?: number; meta?: { nextCursor: string | null } }
) {
  return NextResponse.json(
    init?.meta ? { data, meta: init.meta } : { data },
    { status: init?.status ?? 200 }
  )
}

/** `{ error: { code, message, fields? } }` error envelope. */
export function fail(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>
) {
  const { status } = new ApiError(code, message)
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status }
  )
}

/** First message per field, e.g. `{ title: "Title must be at least 3 characters" }`. */
export function fieldErrors(error: z.ZodError) {
  const flat = z.flattenError(error)
  const fields: Record<string, string> = {}
  for (const [key, messages] of Object.entries(flat.fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0]
    if (first) fields[key] = first
  }
  return fields
}

/** Parse a value with a Zod schema or throw a 422 ApiError. */
export function parseOrThrow<T extends z.ZodType>(schema: T, value: unknown) {
  const result = schema.safeParse(value)
  if (!result.success) {
    const fields = fieldErrors(result.error)
    const message =
      Object.values(fields)[0] ??
      result.error.issues[0]?.message ??
      "Invalid request"
    throw ApiError.validation(message, fields)
  }
  return result.data as z.infer<T>
}

/** Read a JSON body or throw 400. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ApiError("BAD_REQUEST", "Malformed JSON body")
  }
}

/** The signed-in user, or throw 401. */
export async function requireApiUser() {
  const session = await getSession()
  if (!session) throw new ApiError("UNAUTHENTICATED", "Sign in to continue")
  return session.user
}

/** The signed-in user, or null (public endpoints). */
export async function optionalApiUser() {
  const session = await getSession()
  return session?.user ?? null
}

/** Wrap a route handler: ApiError → envelope, anything else → 500. */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>
) {
  return async (...args: Args) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.code, error.message, error.fields)
      }
      console.error(error)
      return fail("INTERNAL_ERROR", "Something went wrong")
    }
  }
}

/** `?cursor=&limit=` (API spec §1.3). */
export const paginationSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export function searchParamsObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams)
}
