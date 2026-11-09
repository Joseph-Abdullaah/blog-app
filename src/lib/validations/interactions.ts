import * as z from "zod"

/** E22 — comment or reply (FR-CMT-01/02). */
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a comment first")
    .max(1000, "Comments can be at most 1000 characters"),
  parentId: z.string().min(1).nullable().optional(),
})

/** E20 — share channel (FR-SHR-01). */
export const shareSchema = z.object({
  channel: z.enum(["COPY_LINK", "X", "FACEBOOK", "LINKEDIN", "WHATSAPP", "EMAIL"]),
})

export type CommentValues = z.infer<typeof commentSchema>
export type ShareValues = z.infer<typeof shareSchema>
