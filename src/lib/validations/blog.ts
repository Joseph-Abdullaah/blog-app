import * as z from "zod"

/* ─────────────── Building blocks ─────────────── */

/** Trim and collapse inner whitespace: "  Web   Design " → "Web Design" (FR-PUB-04). */
export const normalizeTopicName = (value: string) =>
  value.trim().replace(/\s+/g, " ")

/** A topic name, e.g. "Web Design". */
export const topicNameSchema = z
  .string()
  .transform(normalizeTopicName)
  .pipe(
    z
      .string()
      .min(2, "Topics must be at least 2 characters")
      .max(30, "Topics must be at most 30 characters")
      .regex(/^[A-Za-z0-9 -]+$/, "Use only letters, numbers, spaces and hyphens")
  )

/** One Editor.js block: { id, type, data }. */
export const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
})

/** The whole Editor.js output (OutputData). */
export const contentSchema = z.object({
  time: z.number().optional(),
  version: z.string().optional(),
  blocks: z.array(blockSchema),
})

const imageUrlSchema = z.url({
  protocol: /^https?$/,
  error: (issue) =>
    issue.input == null ? "Add a banner image" : "Enter a valid image URL",
})

/* ─────────────── Content checks ─────────────── */

/** Content limit from FR-PUB-03. */
export const MAX_CONTENT_BYTES = 500 * 1024

/** Strip inline HTML (<b>, <a>, …) and see if any text is left. */
const hasText = (value: unknown) =>
  typeof value === "string" && value.replace(/<[^>]*>/g, "").trim().length > 0

/** True when a block actually contains something worth publishing. */
export function isBlockFilled(block: z.infer<typeof blockSchema>) {
  const d = block.data as Record<string, unknown>
  switch (block.type) {
    case "paragraph":
    case "header":
    case "quote":
      return hasText(d.text)
    case "list":
      return Array.isArray(d.items) && d.items.length > 0
    case "code":
      return hasText(d.code)
    case "image":
      return hasText((d.file as { url?: string } | undefined)?.url)
    case "embed":
      return hasText(d.source)
    case "table":
      return Array.isArray(d.content) && d.content.length > 0
    default:
      return false // e.g. a lone delimiter isn't content
  }
}

export const contentSize = (content: unknown) =>
  new TextEncoder().encode(JSON.stringify(content)).length

/* ─────────────── Main schemas ─────────────── */

/** Save Draft / autosave (FR-EDIT-05): everything optional, light limits. */
export const draftBlogSchema = z.object({
  title: z.string().max(120, "Title must be at most 120 characters").optional(),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  bannerUrl: imageUrlSchema.nullable().optional(),
  content: contentSchema
    .refine((c) => contentSize(c) <= MAX_CONTENT_BYTES, "Content is too large")
    .optional(),
  topics: z.array(topicNameSchema).max(5, "Use at most 5 topics").optional(),
})

/** Publish / Update (FR-PUB-03): everything required, strict rules. */
export const publishBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Add a short description")
    .max(200, "Description must be at most 200 characters"),
  bannerUrl: imageUrlSchema,
  content: contentSchema
    .refine((c) => c.blocks.some(isBlockFilled), "Write something before publishing")
    .refine((c) => contentSize(c) <= MAX_CONTENT_BYTES, "Content is too large"),
  topics: z
    .array(topicNameSchema)
    .min(1, "Add at least 1 topic")
    .max(5, "Use at most 5 topics"),
})

/* ─────────────── Endpoint schemas ─────────────── */

/** E26 GET /api/topics?q=&limit= — query values arrive as strings. */
export const topicSearchSchema = z.object({
  q: z.string().trim().max(30).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
})

/** E31 POST /api/uploads — the `purpose` form field. */
export const uploadPurposeSchema = z.enum(["banner", "avatar"])

/** E33 POST /api/uploads/editor/url — Editor.js "paste image URL". */
export const imageUrlUploadSchema = z.object({
  url: z.url({ protocol: /^https?$/, error: "Enter a valid http(s) image URL" }),
})

/* ─────────────── Types ─────────────── */

export type EditorContent = z.infer<typeof contentSchema>
export type DraftBlogValues = z.infer<typeof draftBlogSchema>
export type PublishBlogValues = z.infer<typeof publishBlogSchema>
export type PublishBlogInput = z.input<typeof publishBlogSchema>
export type TopicSearchValues = z.infer<typeof topicSearchSchema>
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>
