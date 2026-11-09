"use client"

import * as React from "react"
import {
  BellIcon,
  FileTextIcon,
  HeartIcon,
  MailIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import {
  AuthorRow,
  BlogGridCard,
  BlogListItem,
  CommentItem,
  ConfirmDialog,
  DashboardBlogRow,
  EditorBar,
  EmptyState,
  FilterChip,
  IconButton,
  InteractionBar,
  Navbar,
  NotificationItem,
  ProfileCard,
  SearchInput,
  SideNav,
  SignInForm,
  SignUpForm,
  StatCard,
  TextField,
  TextareaField,
  TopicChip,
  UserAvatar,
  UserListItem,
} from "@/components/byline"

const colors = [
  "canvas",
  "surface-1",
  "surface-2",
  "surface-3",
  "hairline",
  "hairline-strong",
  "ink",
  "ink-muted",
  "ink-subtle",
  "ink-tertiary",
  "brand",
  "brand-hover",
  "brand-subtle",
  "success",
  "warning",
  "danger",
  "like",
] as const

const author = { name: "Mara Okafor", username: "mara" }
const blog = {
  slug: "dark-sky",
  title: "The Brightest Stars in the Darkest Sky",
  description:
    "New Zealand's Dark Sky Project at Lake Tekapo, and why the quiet is the point.",
  author,
  date: "2026-06-18",
  topic: "Travel",
  likes: 1280,
  readTime: 6,
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6 py-12">
      <h2 className="text-eyebrow uppercase text-ink-subtle">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const [filter, setFilter] = React.useState("All")

  return (
    <div className="min-h-svh bg-canvas">
      <Navbar user={author} unread />
      <main className="mx-auto max-w-wide divide-y divide-hairline px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 py-12">
          <h1 className="text-display-lg text-ink">Byline design system</h1>
          <p className="font-serif text-reading-lead text-ink-subtle">
            Tokens and components, composed from shadcn/ui. Press{" "}
            <kbd className="rounded-xs bg-surface-2 px-1.5 font-mono text-code">d</kbd>{" "}
            to toggle dark mode.
          </p>
        </header>

        <Section title="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {colors.map((c) => (
              <div key={c} className="flex flex-col gap-2">
                <div
                  className="h-14 rounded-md border border-hairline"
                  style={{ background: `var(--${c})` }}
                />
                <span className="text-caption text-ink-subtle">{c}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="flex flex-col gap-4">
            <p className="text-display-lg text-ink">Display large</p>
            <p className="text-display-md text-ink">Display medium</p>
            <p className="text-headline text-ink">Headline</p>
            <p className="text-title-lg text-ink">Title large</p>
            <p className="text-body text-ink-muted">Body — default UI text.</p>
            <p className="text-body-sm text-ink-subtle">Body small — meta lines.</p>
            <p className="text-eyebrow uppercase text-ink-subtle">Eyebrow</p>
            <p className="max-w-read font-serif text-reading-body text-ink-muted">
              Reading body in Source Serif 4. Traveling always gives this woman
              food for thought.
            </p>
            <p className="font-mono text-code text-ink-muted">npm create byline@latest</p>
          </div>
        </Section>

        <Section title="Buttons & chips">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Publish</Button>
            <Button variant="secondary">Save Draft</Button>
            <Button variant="ghost">Preview</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button>
              <MailIcon aria-hidden />
              With icon
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <IconButton icon={SearchIcon} label="Search" />
            <IconButton icon={BellIcon} label="Notifications" filled dot />
            <IconButton icon={HeartIcon} label="Like" size="sm" />
            <TopicChip href="/search?topic=Travel">Travel</TopicChip>
            <TopicChip onRemove={() => {}}>Removable</TopicChip>
            {["All", "Latest", "Trending"].map((f) => (
              <FilterChip key={f} selected={filter === f} onClick={() => setFilter(f)}>
                {f}
              </FilterChip>
            ))}
            <Badge>Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
          </div>
        </Section>

        <Section title="Forms">
          <div className="grid max-w-read gap-4">
            <SearchInput />
            <TextField label="Email" icon={MailIcon} placeholder="you@example.com" />
            <TextField label="Password" type="password" defaultValue="hunter2hunter2" />
            <TextField
              label="Username"
              defaultValue="mara"
              help="Available"
              helpTone="success"
            />
            <TextField label="Email" error="Email or password is incorrect" />
            <TextareaField label="Bio" maxLength={200} placeholder="Tell readers about you" />
          </div>
        </Section>

        <Section title="Tabs, progress, skeleton, empty">
          <Tabs defaultValue="latest">
            <TabsList>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid max-w-read gap-4">
            <Progress value={64} />
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
          <EmptyState
            icon={FileTextIcon}
            title="No blogs yet"
            description="Write your first story and it will show up here."
          >
            <Button>Write</Button>
          </EmptyState>
        </Section>

        <Section title="Feedback">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => toast.add({ title: "Draft saved", type: "success" })}
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.add({ title: "Couldn't publish", description: "Try again.", type: "error" })
              }
            >
              Error toast
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline">
                  <Trash2Icon aria-hidden />
                  Delete blog
                </Button>
              }
              title="Delete this blog?"
              description="This can't be undone."
              confirmLabel="Delete"
              destructive
              onConfirm={() => toast.add({ title: "Blog deleted", type: "success" })}
            />
          </div>
        </Section>

        <Section title="Blog">
          <div className="grid gap-12 lg:grid-cols-[1fr_var(--spacing-rail)]">
            <div>
              <BlogListItem blog={blog} />
              <BlogListItem blog={{ ...blog, slug: "two", title: "A second story" }} />
            </div>
            <div className="grid gap-4">
              <BlogGridCard blog={blog} />
            </div>
          </div>
          <div className="max-w-read">
            <AuthorRow author={author} date="2026-06-18" readTime={6} />
            <InteractionBar likes={1280} comments={42} className="mt-6" />
            <CommentItem
              comment={{ id: "1", author, time: "2026-10-01", content: "Beautiful write-up.", canDelete: true }}
              replies={[
                { id: "2", author: { name: "Sam Lee", username: "sam" }, time: "2026-10-02", content: "Agreed!" },
              ]}
            />
          </div>
        </Section>

        <Section title="People & notifications">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <UserListItem user={{ ...author, bio: "Writes about travel and slow living.", subscribed: false }} />
              <NotificationItem
                notification={{
                  type: "COMMENT",
                  isRead: false,
                  actor: { name: "Sam Lee", username: "sam" },
                  blog: { title: blog.title, slug: blog.slug },
                  comment: "Beautiful write-up.",
                  date: "2026-10-04T22:00:00Z",
                }}
              />
              <NotificationItem
                notification={{
                  type: "SUBSCRIBE",
                  isRead: true,
                  actor: { name: "Ada Park", username: "ada" },
                  date: "2026-09-27",
                }}
              />
              <div className="flex items-center gap-3 py-4">
                {(["xs", "sm", "default", "lg", "xl"] as const).map((s) => (
                  <UserAvatar key={s} name="Mara Okafor" size={s} />
                ))}
              </div>
            </div>
            <ProfileCard
              isSelf
              user={{
                ...author,
                blogs: 24,
                reads: 18400,
                subscribers: 1200,
                bio: "Writes about travel and slow living.",
                socials: { website: "https://example.com", github: "https://github.com" },
                joined: "2025-09-27",
              }}
            />
          </div>
        </Section>

        <Section title="Dashboard">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total reads" value={18400} />
            <StatCard label="Likes" value={1280} icon={HeartIcon} />
            <StatCard label="Subscribers" value={1200} />
          </div>
          <div className="grid gap-12 lg:grid-cols-[var(--spacing-sidenav)_1fr]">
            <SideNav active="Blogs" unread />
            <div>
              <DashboardBlogRow
                blog={{ id: "1", status: "PUBLISHED", title: blog.title, published: "2026-06-18", likes: 1280, comments: 42, reads: 18400, shares: 96 }}
                actions={<Button variant="ghost" size="sm">Edit</Button>}
              />
              <DashboardBlogRow
                blog={{ id: "2", status: "DRAFT", title: "Untitled thoughts", updated: "2026-10-03" }}
              />
            </div>
          </div>
          <EditorBar title={blog.title} dirty />
        </Section>

        <Section title="Auth">
          <div className="flex flex-wrap gap-8">
            <SignInForm />
            <SignUpForm />
          </div>
        </Section>
      </main>
    </div>
  )
}
