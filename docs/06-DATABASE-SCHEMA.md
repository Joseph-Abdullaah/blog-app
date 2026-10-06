# Byline — Database Schema

| | |
|---|---|
| Version | 1.0 |
| Database | PostgreSQL 17 on Neon |
| ORM | Prisma ORM 7 (`prisma-client` generator, `@prisma/adapter-neon`) |
| Diagram | [ERD](07-ERD.md) |
| Rules source | [SRS](02-SRS.md) |

---

## 1. Conventions
- Model names PascalCase, table names snake_case via `@@map`; columns camelCase (Prisma default) to match Better Auth.
- Primary keys: `String @id`. Better Auth tables get ids from Better Auth; app tables use `@default(cuid())`.
- All timestamps `DateTime` (`timestamptz` via `@db.Timestamptz(3)`), UTC.
- Denormalized counters on `Blog` (`likesCount`, `commentsCount`, `readsCount`, `sharesCount`) are updated in the same transaction as the source row (NFR-REL-01).
- Deletion: hard delete. Cascades are defined so deleting a `Blog` or `Comment` removes everything referencing it (FR-DASH-03, FR-CMT-04, FR-NOTF-05).

## 2. Enums
| Enum | Values |
|---|---|
| `BlogStatus` | `DRAFT`, `PUBLISHED` |
| `NotificationType` | `LIKE`, `COMMENT`, `REPLY`, `SHARE`, `SUBSCRIBE`, `NEW_BLOG` |
| `ShareChannel` | `COPY_LINK`, `X`, `FACEBOOK`, `LINKEDIN`, `WHATSAPP`, `EMAIL` |

## 3. Prisma schema — `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // Connection URL lives in prisma.config.ts (Prisma 7).
  // pg_trgm extension + trigram indexes are created in a raw SQL migration (§4).
}

// ───────────── Enums ─────────────
enum BlogStatus {
  DRAFT
  PUBLISHED
}

enum NotificationType {
  LIKE
  COMMENT
  REPLY
  SHARE
  SUBSCRIBE
  NEW_BLOG
}

enum ShareChannel {
  COPY_LINK
  X
  FACEBOOK
  LINKEDIN
  WHATSAPP
  EMAIL
}

// ───────────── Better Auth core ─────────────
model User {
  id            String   @id
  name          String   @db.VarChar(50)
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?  // avatar URL (Vercel Blob)
  createdAt     DateTime @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)

  // Byline profile fields (Better Auth additionalFields)
  username  String  @unique @db.VarChar(30)
  bio       String? @db.VarChar(200)
  youtube   String? @db.VarChar(255)
  instagram String? @db.VarChar(255)
  facebook  String? @db.VarChar(255)
  twitter   String? @db.VarChar(255)
  github    String? @db.VarChar(255)
  website   String? @db.VarChar(255)

  sessions Session[]
  accounts Account[]

  blogs                  Blog[]
  likes                  Like[]
  comments               Comment[]
  reads                  Read[]
  shares                 Share[]
  subscriptions          Subscription[] @relation("Subscriber")
  subscribers            Subscription[] @relation("Author")
  notificationsReceived  Notification[] @relation("Recipient")
  notificationsTriggered Notification[] @relation("Actor")

  @@map("user")
}

model Session {
  id        String   @id
  token     String   @unique
  expiresAt DateTime @db.Timestamptz(3)
  ipAddress String?
  userAgent String?
  userId    String
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String    // "credential" | "google"
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime? @db.Timestamptz(3)
  refreshTokenExpiresAt DateTime? @db.Timestamptz(3)
  scope                 String?
  password              String?   // hashed; null for Google-only accounts
  createdAt             DateTime  @default(now()) @db.Timestamptz(3)
  updatedAt             DateTime  @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @db.Timestamptz(3)
  createdAt  DateTime @default(now()) @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @db.Timestamptz(3)

  @@index([identifier])
  @@map("verification")
}

// ───────────── Content ─────────────
model Blog {
  id              String     @id @default(cuid())
  authorId        String
  slug            String?    @unique @db.VarChar(90) // set on first publish
  title           String     @default("") @db.VarChar(120)
  description     String     @default("") @db.VarChar(200)
  bannerUrl       String?
  content         Json       @default("{\"blocks\":[]}") // Editor.js OutputData
  status          BlogStatus @default(DRAFT)
  readTimeMinutes Int        @default(0)
  likesCount      Int        @default(0)
  commentsCount   Int        @default(0)
  readsCount      Int        @default(0)
  sharesCount     Int        @default(0)
  publishedAt     DateTime?  @db.Timestamptz(3)
  createdAt       DateTime   @default(now()) @db.Timestamptz(3)
  updatedAt       DateTime   @updatedAt @db.Timestamptz(3)

  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  topics        BlogTopic[]
  likes         Like[]
  comments      Comment[]
  reads         Read[]
  shares        Share[]
  notifications Notification[]

  @@index([status, publishedAt(sort: Desc)])
  @@index([authorId, status, updatedAt(sort: Desc)])
  @@map("blog")
}

model Topic {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(30)
  slug      String   @unique @db.VarChar(40)
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  blogs BlogTopic[]

  @@map("topic")
}

model BlogTopic {
  blogId  String
  topicId String

  blog  Blog  @relation(fields: [blogId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@id([blogId, topicId])
  @@index([topicId])
  @@map("blog_topic")
}

// ───────────── Interactions ─────────────
model Like {
  id        String   @id @default(cuid())
  userId    String
  blogId    String
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  blog Blog @relation(fields: [blogId], references: [id], onDelete: Cascade)

  @@unique([userId, blogId])
  @@index([blogId])
  @@map("like")
}

model Comment {
  id        String   @id @default(cuid())
  blogId    String
  authorId  String
  parentId  String?  // null = top-level; otherwise id of a top-level comment
  content   String   @db.VarChar(1000)
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  blog          Blog           @relation(fields: [blogId], references: [id], onDelete: Cascade)
  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent        Comment?       @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[]      @relation("Replies")
  notifications Notification[]

  @@index([blogId, parentId, createdAt(sort: Desc)])
  @@index([parentId, createdAt])
  @@map("comment")
}

model Read {
  id        String   @id @default(cuid())
  blogId    String
  userId    String?
  visitorId String   @db.VarChar(36)
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  blog Blog  @relation(fields: [blogId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([blogId, visitorId, createdAt(sort: Desc)])
  @@index([blogId, createdAt])
  @@map("read")
}

model Share {
  id        String       @id @default(cuid())
  blogId    String
  userId    String?
  visitorId String       @db.VarChar(36)
  channel   ShareChannel
  createdAt DateTime     @default(now()) @db.Timestamptz(3)

  blog Blog  @relation(fields: [blogId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([blogId, channel])
  @@map("share")
}

model Subscription {
  id           String   @id @default(cuid())
  subscriberId String
  authorId     String
  createdAt    DateTime @default(now()) @db.Timestamptz(3)

  subscriber User @relation("Subscriber", fields: [subscriberId], references: [id], onDelete: Cascade)
  author     User @relation("Author", fields: [authorId], references: [id], onDelete: Cascade)

  @@unique([subscriberId, authorId])
  @@index([authorId])
  @@map("subscription")
}

model Notification {
  id          String           @id @default(cuid())
  type        NotificationType
  recipientId String
  actorId     String
  blogId      String?
  commentId   String?          // the comment/reply that triggered COMMENT/REPLY
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now()) @db.Timestamptz(3)

  recipient User     @relation("Recipient", fields: [recipientId], references: [id], onDelete: Cascade)
  actor     User     @relation("Actor", fields: [actorId], references: [id], onDelete: Cascade)
  blog      Blog?    @relation(fields: [blogId], references: [id], onDelete: Cascade)
  comment   Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@index([recipientId, createdAt(sort: Desc)])
  @@index([recipientId, isRead])
  @@index([recipientId, type, createdAt(sort: Desc)])
  @@index([actorId, blogId, type, createdAt]) // SHARE 24 h de-dup, LIKE removal
  @@map("notification")
}
```

## 4. Raw SQL migration — search indexes
Create with `prisma migrate dev --create-only --name search_indexes`, then add:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX blog_title_trgm_idx       ON "blog"  USING gin (title gin_trgm_ops);
CREATE INDEX blog_description_trgm_idx ON "blog"  USING gin (description gin_trgm_ops);
CREATE INDEX topic_name_trgm_idx       ON "topic" USING gin (name gin_trgm_ops);
CREATE INDEX user_username_trgm_idx    ON "user"  USING gin (username gin_trgm_ops);
CREATE INDEX user_name_trgm_idx        ON "user"  USING gin (name gin_trgm_ops);
```

## 5. Field rules (enforced in Zod — `src/lib/validations`)
| Model.field | Rule | Requirement |
|---|---|---|
| `User.name` | 1–50 | FR-AUTH-01 |
| `User.username` | `^[a-z0-9_]{3,30}$`, unique, not reserved | FR-PROF-02 |
| `User.bio` | ≤ 200 | FR-PROF-01 |
| `User.youtube…website` | optional `https://` URL ≤ 255 | FR-PROF-01 |
| `Blog.title` | draft ≤ 120 · publish 3–120 | FR-EDIT-05, FR-PUB-03 |
| `Blog.description` | draft ≤ 200 · publish 1–200 | FR-EDIT-05, FR-PUB-03 |
| `Blog.bannerUrl` | required to publish | FR-PUB-03 |
| `Blog.content` | Editor.js `{ time?, blocks[], version? }`; publish ≥ 1 non-empty block; ≤ 500 KB | FR-PUB-03 |
| `Blog.slug` | `kebab(title)[0..80]-[a-z0-9]{6}`; immutable after set | FR-PUB-05/06 |
| `Topic.name` | 2–30, `^[A-Za-z0-9 -]+$`; `slug` = kebab lowercase | FR-PUB-04 |
| `BlogTopic` | 1–5 per blog to publish | FR-PUB-03 |
| `Comment.content` | 1–1000; `parentId` must reference a top-level comment of the same blog | FR-CMT-01/02 |
| `Read`/`Share.visitorId` | UUID from `bl_vid` cookie | FR-READ-04, FR-SHR-02 |

## 6. Transactional operations
| Operation | Writes (one `$transaction`) |
|---|---|
| Like (E17) | insert `Like` (skip on unique conflict) → `likesCount + 1` → insert `Notification LIKE` |
| Unlike (E18) | delete `Like` → `likesCount - 1` → delete `Notification` (type LIKE, actor, blog) |
| Comment (E22) | insert `Comment` → `commentsCount + 1` → insert `Notification COMMENT` or `REPLY` |
| Delete comment (E24) | count replies → delete `Comment` (cascades replies + notifications) → `commentsCount - (1 + replies)` |
| Read (E19) | check last 24 h → insert `Read` → `readsCount + 1` |
| Share (E20) | insert `Share` → `sharesCount + 1` → maybe insert `Notification SHARE` |
| Publish (E12) | update `Blog` fields → upsert `Topic`s → replace `BlogTopic`s → set status/slug/publishedAt/readTime → (first publish) `createMany` `NEW_BLOG` notifications |
| Subscribe (E6) | insert `Subscription` (skip on conflict) → insert `Notification SUBSCRIBE` |
| Unsubscribe (E7) | delete `Subscription` → delete unread `Notification SUBSCRIBE` (actor, recipient) |

## 7. Seed (`prisma/seed.ts`)
3 users (`amina`, `yusuf`, `demo`, password `Password123!`), 12 topics (Technology, Travel, Food, Design, Programming, Networking, Productivity, Health, Education, Business, Culture, Science), 15 published blogs + 3 drafts with sample Editor.js content covering every block type, likes/comments/reads/shares and matching notifications.
