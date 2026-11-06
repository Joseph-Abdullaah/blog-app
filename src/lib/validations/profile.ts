import * as z from "zod"

import { usernameSchema } from "@/lib/validations/auth"

/** Usernames that would clash with routes (FR-PROF-02), on top of the auth rules. */
export const RESERVED_ROUTE_USERNAMES = new Set([
  "me",
  "admin",
  "administrator",
  "support",
  "api",
  "blog",
  "u",
  "editor",
  "dashboard",
  "settings",
  "search",
  "sign-in",
  "sign-up",
  "byline",
])

export const profileUsernameSchema = usernameSchema.refine(
  (value) => !RESERVED_ROUTE_USERNAMES.has(value),
  { message: "That username is reserved" }
)

/** Optional https:// link ≤ 255; empty means "remove". */
const socialUrl = z
  .string()
  .trim()
  .max(255, "Links can be at most 255 characters")
  .refine((value) => value === "" || /^https:\/\/\S+\.\S+/.test(value), {
    message: "Use a full link starting with https://",
  })
  .transform((value) => value || null)

export const socialsSchema = z.object({
  youtube: socialUrl,
  instagram: socialUrl,
  facebook: socialUrl,
  twitter: socialUrl,
  github: socialUrl,
  website: socialUrl,
})

/** E2 — every field optional; send only what changed (FR-PROF-01/02/04). */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(50, "Use at most 50 characters").optional(),
  username: profileUsernameSchema.optional(),
  bio: z
    .string()
    .trim()
    .max(200, "Bio can be at most 200 characters")
    .transform((value) => value || null)
    .nullable()
    .optional(),
  image: z.url({ protocol: /^https$/, error: "Upload an image first" }).nullable().optional(),
  socials: socialsSchema.partial().optional(),
})

/** The Edit Profile form (all fields present). */
export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(50, "Use at most 50 characters"),
  username: profileUsernameSchema,
  bio: z.string().trim().max(200, "Bio can be at most 200 characters"),
  socials: socialsSchema,
})

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
export type ProfileFormInput = z.input<typeof profileFormSchema>
export type ProfileFormValues = z.output<typeof profileFormSchema>
