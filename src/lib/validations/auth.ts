import * as z from "zod"


const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
])

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Use only letters, numbers, dots, and underscores")
  .transform((value) => value.toLowerCase())
  .refine((value) => !RESERVED_USERNAMES.has(value), {
    message: "That username is reserved",
  })
