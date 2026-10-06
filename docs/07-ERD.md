# Byline — Entity Relationship Diagram

| | |
|---|---|
| Version | 1.0 |
| Source of truth | [Database Schema](06-DATABASE-SCHEMA.md) — this diagram mirrors it 1:1 |

---

## 1. Diagram

```mermaid
erDiagram
  USER ||--o{ SESSION : "has"
  USER ||--o{ ACCOUNT : "has"
  USER ||--o{ BLOG : "writes"
  USER ||--o{ LIKE : "gives"
  USER ||--o{ COMMENT : "writes"
  USER |o--o{ READ : "makes (optional)"
  USER |o--o{ SHARE : "makes (optional)"
  USER ||--o{ SUBSCRIPTION : "subscriber"
  USER ||--o{ SUBSCRIPTION : "author"
  USER ||--o{ NOTIFICATION : "recipient"
  USER ||--o{ NOTIFICATION : "actor"

  BLOG ||--o{ BLOG_TOPIC : "tagged"
  TOPIC ||--o{ BLOG_TOPIC : "tags"
  BLOG ||--o{ LIKE : "receives"
  BLOG ||--o{ COMMENT : "receives"
  BLOG ||--o{ READ : "receives"
  BLOG ||--o{ SHARE : "receives"
  BLOG |o--o{ NOTIFICATION : "about"

  COMMENT |o--o{ COMMENT : "parent of (replies)"
  COMMENT |o--o{ NOTIFICATION : "about"

  USER {
    string id PK
    string name
    string email UK
    boolean emailVerified
    string image
    string username UK
    string bio
    string youtube
    string instagram
    string facebook
    string twitter
    string github
    string website
    datetime createdAt
    datetime updatedAt
  }
  SESSION {
    string id PK
    string token UK
    datetime expiresAt
    string ipAddress
    string userAgent
    string userId FK
  }
  ACCOUNT {
    string id PK
    string accountId
    string providerId
    string userId FK
    string password
  }
  VERIFICATION {
    string id PK
    string identifier
    string value
    datetime expiresAt
  }
  BLOG {
    string id PK
    string authorId FK
    string slug UK
    string title
    string description
    string bannerUrl
    json content
    enum status "DRAFT | PUBLISHED"
    int readTimeMinutes
    int likesCount
    int commentsCount
    int readsCount
    int sharesCount
    datetime publishedAt
    datetime createdAt
    datetime updatedAt
  }
  TOPIC {
    string id PK
    string name
    string slug UK
    datetime createdAt
  }
  BLOG_TOPIC {
    string blogId PK, FK
    string topicId PK, FK
  }
  LIKE {
    string id PK
    string userId FK
    string blogId FK
    datetime createdAt
  }
  COMMENT {
    string id PK
    string blogId FK
    string authorId FK
    string parentId FK
    string content
    datetime createdAt
    datetime updatedAt
  }
  READ {
    string id PK
    string blogId FK
    string userId FK
    string visitorId
    datetime createdAt
  }
  SHARE {
    string id PK
    string blogId FK
    string userId FK
    string visitorId
    enum channel "COPY_LINK | X | FACEBOOK | LINKEDIN | WHATSAPP | EMAIL"
    datetime createdAt
  }
  SUBSCRIPTION {
    string id PK
    string subscriberId FK
    string authorId FK
    datetime createdAt
  }
  NOTIFICATION {
    string id PK
    enum type "LIKE | COMMENT | REPLY | SHARE | SUBSCRIBE | NEW_BLOG"
    string recipientId FK
    string actorId FK
    string blogId FK
    string commentId FK
    boolean isRead
    datetime createdAt
  }
```
`VERIFICATION` has no relations (Better Auth tokens for password reset).

## 2. Relationships & cardinality

| # | Relationship | Cardinality | FK | On delete |
|---|---|---|---|---|
| R1 | User → Session | 1 : N | `session.userId` | Cascade |
| R2 | User → Account | 1 : N (credential, google) | `account.userId` | Cascade |
| R3 | User → Blog (author) | 1 : N | `blog.authorId` | Cascade |
| R4 | Blog ↔ Topic via BlogTopic | M : N (publish: 1–5 per blog) | `blog_topic.blogId`, `blog_topic.topicId` | Cascade |
| R5 | User → Like ← Blog | 1 : N each; unique `(userId, blogId)` | `like.userId`, `like.blogId` | Cascade |
| R6 | User → Comment ← Blog | 1 : N each | `comment.authorId`, `comment.blogId` | Cascade |
| R7 | Comment → Comment (replies) | 1 : N, one level deep | `comment.parentId` | Cascade |
| R8 | Blog → Read; User → Read (optional) | 1 : N; 0..1 : N | `read.blogId`, `read.userId` | Cascade; SetNull |
| R9 | Blog → Share; User → Share (optional) | 1 : N; 0..1 : N | `share.blogId`, `share.userId` | Cascade; SetNull |
| R10 | User (subscriber) → Subscription ← User (author) | M : N self-relation; unique `(subscriberId, authorId)` | `subscription.subscriberId`, `subscription.authorId` | Cascade |
| R11 | User → Notification (recipient, actor) | 1 : N each | `notification.recipientId`, `notification.actorId` | Cascade |
| R12 | Blog → Notification | 0..1 : N | `notification.blogId` | Cascade |
| R13 | Comment → Notification | 0..1 : N | `notification.commentId` | Cascade |

## 3. Notification field usage

| `type` | `actorId` | `recipientId` | `blogId` | `commentId` |
|---|---|---|---|---|
| `LIKE` | liker | blog author | ✓ | — |
| `COMMENT` | commenter | blog author | ✓ | new comment |
| `REPLY` | replier | parent comment author | ✓ | new reply (parent via `comment.parentId`) |
| `SHARE` | sharer (signed in) | blog author | ✓ | — |
| `SUBSCRIBE` | subscriber | author | — | — |
| `NEW_BLOG` | author | each subscriber | ✓ | — |
