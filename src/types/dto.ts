/** Shared API data shapes — docs/08-API-SPEC.md §2. Dates are ISO strings. */

export type AuthorSummary = {
  id: string
  name: string
  username: string
  image: string | null
}

export type TopicDTO = { id: string; name: string; slug: string }

export type Socials = {
  youtube: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  github: string | null
  website: string | null
}

export type EditorJsData = {
  time?: number
  version?: string
  blocks: { id?: string; type: string; data: Record<string, unknown> }[]
}

export type BlogStatus = "DRAFT" | "PUBLISHED"

export type BlogCard = {
  id: string
  slug: string
  title: string
  description: string
  bannerUrl: string
  topics: TopicDTO[]
  readTimeMinutes: number
  likesCount: number
  commentsCount: number
  readsCount: number
  sharesCount: number
  publishedAt: string
  author: AuthorSummary
}

export type BlogDetail = BlogCard & {
  content: EditorJsData
  updatedAt: string
  viewer: { liked: boolean; isAuthor: boolean; subscribedToAuthor: boolean }
}

/** Owner view of a blog, drafts and published. */
export type EditableBlog = {
  id: string
  slug: string | null
  status: BlogStatus
  title: string
  description: string
  bannerUrl: string | null
  content: EditorJsData
  topics: TopicDTO[]
  publishedAt: string | null
  updatedAt: string
}

export type DashboardBlog = {
  id: string
  slug: string | null
  status: BlogStatus
  title: string
  bannerUrl: string | null
  likesCount: number
  commentsCount: number
  readsCount: number
  sharesCount: number
  publishedAt: string | null
  updatedAt: string
}

export type CommentDTO = {
  id: string
  blogId: string
  parentId: string | null
  content: string
  createdAt: string
  author: AuthorSummary
  repliesCount: number
  /** Viewer is the comment author or the blog's author. */
  canDelete: boolean
}

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "REPLY"
  | "SHARE"
  | "SUBSCRIBE"
  | "NEW_BLOG"

export type NotificationDTO = {
  id: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  actor: AuthorSummary
  blog: { id: string; slug: string; title: string } | null
  comment: {
    id: string
    content: string
    parentId: string | null
    parentContent: string | null
  } | null
}

export type Me = {
  id: string
  name: string
  email: string
  username: string
  image: string | null
  bio: string | null
  socials: Socials
  hasPassword: boolean
  createdAt: string
}

export type PublicProfile = {
  id: string
  name: string
  username: string
  image: string | null
  bio: string | null
  socials: Socials
  joinedAt: string
  stats: { blogsCount: number; totalReads: number; subscribersCount: number }
  viewer: { isSelf: boolean; subscribed: boolean }
}

export type UserSearchResult = AuthorSummary & {
  bio: string | null
  viewer: { subscribed: boolean }
}

export type ShareChannel =
  | "COPY_LINK"
  | "X"
  | "FACEBOOK"
  | "LINKEDIN"
  | "WHATSAPP"
  | "EMAIL"

export type BlogStats = {
  totals: { reads: number; likes: number; comments: number; shares: number }
  /** 30 entries, zero-filled, YYYY-MM-DD. */
  readsByDay: { date: string; count: number }[]
  /** All six channels. */
  sharesByChannel: { channel: ShareChannel; count: number }[]
  recentComments: CommentDTO[]
}

export type Paginated<T> = { data: T[]; meta: { nextCursor: string | null } }
