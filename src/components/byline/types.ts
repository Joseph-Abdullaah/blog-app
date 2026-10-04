export type AuthorSummary = {
  name: string
  username: string
  image?: string | null
}

export type BlogStatus = "DRAFT" | "PUBLISHED"

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "REPLY"
  | "SHARE"
  | "SUBSCRIBE"
  | "NEW_BLOG"
