/**
 * Placeholder data for the UI screens. Replace each export with real queries
 * (see docs/06-DATABASE-SCHEMA.md and docs/08-API-SPEC.md) as the API lands.
 */
import type {
  AuthorSummary,
  BlogStatus,
  NotificationType,
} from "@/components/byline/types"

export type MockUser = AuthorSummary & {
  bio?: string
  email?: string
  blogs: number
  reads: number
  subscribers: number
  socials?: Partial<
    Record<
      "youtube" | "instagram" | "facebook" | "twitter" | "github" | "website",
      string
    >
  >
  joined: string
  subscribed?: boolean
}

export type Block =
  | { type: "paragraph"; data: { text: string } }
  | { type: "header"; data: { level: 2 | 3 | 4; text: string } }
  | {
      type: "list"
      data: { style: "ordered" | "unordered"; items: string[] }
    }
  | { type: "code"; data: { language?: string; code: string } }
  | { type: "quote"; data: { text: string; caption?: string } }
  | { type: "image"; data: { url: string; caption?: string } }
  | { type: "delimiter"; data: Record<string, never> }

export type MockBlog = {
  id: string
  slug: string
  title: string
  description: string
  author: AuthorSummary
  date: string
  topic: string
  topics: string[]
  likes: number
  comments: number
  reads: number
  shares: number
  readTime: number
  bannerUrl?: string
  status: BlogStatus
  blocks: Block[]
}

export type MockComment = {
  id: string
  author: AuthorSummary
  time: string
  content: string
  canDelete?: boolean
  replies?: Omit<MockComment, "replies">[]
}

export type MockNotification = {
  id: string
  type: NotificationType
  isRead: boolean
  actor: AuthorSummary
  blog?: { title: string; slug?: string }
  comment?: string
  date: string
}

export const currentUser: MockUser = {
  name: "Joseph Abdullahi",
  username: "joseph",
  email: "josephabdullaahi@gmail.com",
  bio: "Product engineer writing about slow software, small tools and the habits behind good work.",
  blogs: 12,
  reads: 8400,
  subscribers: 236,
  socials: {
    github: "https://github.com/joseph",
    twitter: "https://x.com/joseph",
    website: "https://joseph.dev",
  },
  joined: "2025-09-27",
}

const amina: MockUser = {
  name: "Amina Yusuf",
  username: "amina",
  bio: "Product designer based in Lisbon.",
  blogs: 18,
  reads: 22100,
  subscribers: 940,
  joined: "2025-03-14",
  subscribed: true,
}
const daniel: MockUser = {
  name: "Daniel Okoro",
  username: "danielo",
  bio: "Design engineer. Writing about systems, type and small tools.",
  blogs: 31,
  reads: 61200,
  subscribers: 2310,
  joined: "2024-11-02",
}
const sara: MockUser = {
  name: "Sara Lindqvist",
  username: "saral",
  bio: "Home baker and sometime food writer.",
  blogs: 9,
  reads: 7800,
  subscribers: 412,
  joined: "2025-06-21",
}

export const users: MockUser[] = [currentUser, amina, daniel, sara]

const designSystemBlocks: Block[] = [
  {
    type: "paragraph",
    data: {
      text: "Our first library was a folder of components that looked right and broke the moment a second team touched them. The second one started somewhere duller: a list of decisions we were willing to defend.",
    },
  },
  { type: "header", data: { level: 2, text: "Start with tokens, not components" } },
  {
    type: "paragraph",
    data: {
      text: "A token is a decision with a name. Once <b>color.surface</b> exists, nobody argues about a hex value again. They argue about whether a card is a surface, which is a far better argument to have.",
    },
  },
  {
    type: "list",
    data: {
      style: "unordered",
      items: [
        "Name by role, never by appearance",
        "Keep light and dark values side by side",
        "Write one line of usage for every token",
      ],
    },
  },
  { type: "header", data: { level: 2, text: "Make the boring parts executable" } },
  {
    type: "code",
    data: {
      language: "css",
      code: ".btn-primary {\n  background: var(--ink);\n  color: var(--on-ink);\n  border-radius: var(--radius-pill);\n}",
    },
  },
  {
    type: "quote",
    data: {
      text: "A design system is a promise that the next screen will take less time than the last one.",
      caption: "Daniel Okoro",
    },
  },
  {
    type: "paragraph",
    data: {
      text: "That promise only holds if the system stays small enough for one person to understand end to end.",
    },
  },
]

const genericBlocks = (intro: string): Block[] => [
  { type: "paragraph", data: { text: intro } },
  { type: "header", data: { level: 2, text: "Where it started" } },
  {
    type: "paragraph",
    data: {
      text: "Placeholder copy for this story. Replace it with the real post body once the editor and API are connected.",
    },
  },
  { type: "delimiter", data: {} },
  {
    type: "paragraph",
    data: { text: "A closing thought, set in the reading serif at a comfortable measure." },
  },
]

export const blogs: MockBlog[] = [
  {
    id: "b1",
    slug: "slow-week-in-lisbon",
    title: "How I plan a slow week in Lisbon",
    description:
      "No checklists, no queues. A loose structure of one morning walk, one long lunch and one thing I would not skip.",
    author: amina,
    date: "2026-09-27",
    topic: "Travel",
    topics: ["Travel", "Life"],
    likes: 128,
    comments: 14,
    reads: 3100,
    shares: 22,
    readTime: 6,
    bannerUrl: "/images/story-lisbon.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks(
      "A loose structure of one morning walk, one long lunch and one thing I would not skip."
    ),
  },
  {
    id: "b2",
    slug: "design-system-that-lasts",
    title: "Notes on building a design system that lasts",
    description:
      "Tokens first, components second, opinions last. What changed after two years of shipping the same library to three teams.",
    author: daniel,
    date: "2026-10-02",
    topic: "Tech",
    topics: ["Tech", "Design", "Writing"],
    likes: 342,
    comments: 3,
    reads: 9800,
    shares: 77,
    readTime: 9,
    bannerUrl: "/images/story-design-system.jpg",
    status: "PUBLISHED",
    blocks: designSystemBlocks,
  },
  {
    id: "b3",
    slug: "sourdough-routine",
    title: "The only sourdough routine I keep coming back to",
    description:
      "A forgiving schedule for people who work all day: mix at night, shape in the morning, bake when you are home.",
    author: sara,
    date: "2026-10-03",
    topic: "Food",
    topics: ["Food"],
    likes: 87,
    comments: 9,
    reads: 2200,
    shares: 12,
    readTime: 5,
    bannerUrl: "/images/story-sourdough.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks(
      "A forgiving schedule for people who work all day: mix at night, shape in the morning, bake when you are home."
    ),
  },
  {
    id: "b4",
    slug: "stopped-chasing-productivity-apps",
    title: "Why I stopped chasing productivity apps",
    description:
      "I tried nine tools in a year. The one that stuck was a paper notebook and a rule about what goes on the first page.",
    author: currentUser,
    date: "2026-10-04",
    topic: "Life",
    topics: ["Life", "Writing"],
    likes: 54,
    comments: 12,
    reads: 1300,
    shares: 9,
    readTime: 4,
    bannerUrl: "/images/story-productivity.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks(
      "I tried nine tools in a year. The one that stuck was a paper notebook."
    ),
  },
  {
    id: "b5",
    slug: "field-guide-postgres-indexes",
    title: "A field guide to Postgres indexes",
    description:
      "When a B-tree is enough, when a trigram index earns its keep, and how to read an EXPLAIN without panic.",
    author: daniel,
    date: "2026-09-12",
    topic: "Tech",
    topics: ["Tech"],
    likes: 211,
    comments: 18,
    reads: 5400,
    shares: 31,
    readTime: 11,
    bannerUrl: "/images/story-design-system.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks(
      "When a B-tree is enough, and when a trigram index earns its keep."
    ),
  },
  {
    id: "b6",
    slug: "six-weekend-side-project",
    title: "Shipping a side project in six weekends",
    description: "A scope, a calendar and a rule: nothing new after week four.",
    author: currentUser,
    date: "2026-09-20",
    topic: "Tech",
    topics: ["Tech", "Career"],
    likes: 120,
    comments: 31,
    reads: 4200,
    shares: 48,
    readTime: 7,
    bannerUrl: "/images/story-lisbon.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks("A scope, a calendar and a rule: nothing new after week four."),
  },
  {
    id: "b7",
    slug: "reading-list-quiet-autumn",
    title: "Reading list for a quiet autumn",
    description:
      "Six books I carried from September into winter, and why each one stayed.",
    author: currentUser,
    date: "2026-09-02",
    topic: "Books",
    topics: ["Books"],
    likes: 33,
    comments: 4,
    reads: 980,
    shares: 6,
    readTime: 5,
    bannerUrl: "/images/story-sourdough.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks("Six books I carried from September into winter."),
  },
  {
    id: "b8",
    slug: "naming-tokens",
    title: "Naming tokens so designers and engineers agree",
    description:
      "A naming scheme that survived three rebrands and a dark theme, with the mistakes that taught us each rule.",
    author: amina,
    date: "2026-09-19",
    topic: "Tech",
    topics: ["Tech", "Design"],
    likes: 96,
    comments: 5,
    reads: 2700,
    shares: 14,
    readTime: 7,
    bannerUrl: "/images/story-lisbon.jpg",
    status: "PUBLISHED",
    blocks: genericBlocks("A naming scheme that survived three rebrands and a dark theme."),
  },
  {
    id: "b9",
    slug: "year-of-daily-notes",
    title: "What I learned from a year of daily notes",
    description: "",
    author: currentUser,
    date: "2026-10-05",
    topic: "Writing",
    topics: [],
    likes: 0,
    comments: 0,
    reads: 0,
    shares: 0,
    readTime: 1,
    status: "DRAFT",
    blocks: [],
  },
]

export const topics = [
  "Travel",
  "Food",
  "Tech",
  "Design",
  "Life",
  "Writing",
  "Books",
  "Photography",
  "Career",
  "Health",
]

export const comments: MockComment[] = [
  {
    id: "c1",
    author: amina,
    time: "2026-10-04T22:00:00Z",
    content:
      "The point about naming by role is the one I wish I had read two years ago.",
    replies: [
      {
        id: "c2",
        author: daniel,
        time: "2026-10-04T23:00:00Z",
        content: "Thank you. It took us a full rebrand to learn it.",
      },
    ],
  },
  {
    id: "c3",
    author: sara,
    time: "2026-10-04T19:00:00Z",
    content:
      "Would love a follow-up on how you handle dark theme contrast checks.",
  },
  {
    id: "c4",
    author: currentUser,
    time: "2026-10-03T12:00:00Z",
    content: "Sharing this with my team today.",
    canDelete: true,
  },
]

export const notifications: MockNotification[] = [
  {
    id: "n1",
    type: "COMMENT",
    isRead: false,
    actor: amina,
    blog: { title: "Shipping a side project in six weekends", slug: "six-weekend-side-project" },
    comment: "The six-weekend cap is such a good constraint.",
    date: "2026-10-04T22:00:00Z",
  },
  {
    id: "n2",
    type: "LIKE",
    isRead: false,
    actor: daniel,
    blog: { title: "Why I stopped chasing productivity apps", slug: "stopped-chasing-productivity-apps" },
    date: "2026-10-04T21:00:00Z",
  },
  { id: "n3", type: "SUBSCRIBE", isRead: false, actor: sara, date: "2026-10-04T19:00:00Z" },
  {
    id: "n4",
    type: "REPLY",
    isRead: true,
    actor: daniel,
    blog: { title: "Reading list for a quiet autumn", slug: "reading-list-quiet-autumn" },
    comment: "Agreed. The third book changed how I read the first two.",
    date: "2026-10-03T12:00:00Z",
  },
  {
    id: "n5",
    type: "SHARE",
    isRead: true,
    actor: amina,
    blog: { title: "Why I stopped chasing productivity apps", slug: "stopped-chasing-productivity-apps" },
    date: "2026-10-02T12:00:00Z",
  },
  {
    id: "n6",
    type: "LIKE",
    isRead: true,
    actor: sara,
    blog: { title: "Shipping a side project in six weekends", slug: "six-weekend-side-project" },
    date: "2026-09-27T12:00:00Z",
  },
]

export const shareChannels = [
  { label: "Copy link", count: 21 },
  { label: "X", count: 11 },
  { label: "LinkedIn", count: 8 },
  { label: "WhatsApp", count: 5 },
  { label: "Facebook", count: 2 },
  { label: "Email", count: 1 },
]

/** Reads per day for the stats chart (last 30 days). */
export const readsOverTime = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  label: new Date(Date.UTC(2026, 8, 5 + i)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }),
  reads: Math.round(70 + i * 3.2 + Math.sin(i / 2) * 12),
}))

export const getBlog = (slug: string) => blogs.find((b) => b.slug === slug)
export const getBlogById = (id: string) => blogs.find((b) => b.id === id)
export const getUser = (username: string) =>
  users.find((u) => u.username === username)
export const publishedBlogs = () => blogs.filter((b) => b.status === "PUBLISHED")
