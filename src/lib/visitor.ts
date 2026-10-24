import { cookies } from "next/headers"

/** Anonymous visitor id used to de-duplicate reads and shares (API spec §1.4). */
export const VISITOR_COOKIE = "bl_vid"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** The visitor id from the `bl_vid` cookie, creating and setting it if missing. */
export async function visitorId() {
  const jar = await cookies()
  const existing = jar.get(VISITOR_COOKIE)?.value
  if (existing && UUID.test(existing)) return existing

  const id = crypto.randomUUID()
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return id
}
