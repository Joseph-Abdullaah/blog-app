import {
  BellIcon,
  CheckIcon,
  ChartNoAxesColumnIcon,
  EyeIcon,
  FileTextIcon,
  HeartIcon,
  type LucideIcon,
  MessageCircleIcon,
  PenLineIcon,
  SearchIcon,
  Share2Icon,
} from "lucide-react"
import Link from "next/link"

import {
  BlogGridCard,
  Logo,
  NotificationItem,
  StatCard,
} from "@/components/byline"
import { LandingNav } from "@/components/landing/landing-nav"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

const h2 =
  "mt-3 mb-4 text-[28px] leading-[1.12] font-semibold tracking-[-0.8px] text-ink sm:text-[32px] lg:text-[40px] lg:tracking-[-1.2px]"
const eyebrow = "text-eyebrow tracking-[1px] text-ink-subtle uppercase"
const lead = "font-serif text-[17px] leading-[1.6] text-ink-subtle sm:text-[19px]"
const section =
  "mx-auto max-w-page px-4 pb-16 sm:px-6 md:pb-20 lg:pb-24"

const stories = [
  {
    slug: "slow-week-in-lisbon",
    title: "How I plan a slow week in Lisbon",
    description:
      "A loose structure of one morning walk, one long lunch and one thing I would not skip.",
    date: "2026-09-27",
    topic: "Travel",
    readTime: 6,
    bannerUrl: "/images/story-lisbon.jpg",
  },
  {
    slug: "design-system-that-lasts",
    title: "Notes on building a design system that lasts",
    description: "Tokens first, components second, opinions last.",
    date: "2026-10-02",
    topic: "Tech",
    readTime: 9,
    bannerUrl: "/images/story-design-system.jpg",
  },
  {
    slug: "sourdough-routine",
    title: "The only sourdough routine I keep coming back to",
    description: "Mix at night, shape in the morning, bake when you are home.",
    date: "2026-10-03",
    topic: "Food",
    readTime: 5,
    bannerUrl: "/images/story-sourdough.jpg",
  },
]

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PenLineIcon,
    title: "A block editor",
    text: "Write with headings, lists, images, code blocks, quotes and tables.",
  },
  {
    icon: FileTextIcon,
    title: "Drafts and preview",
    text: "Save work in progress and see the finished post before it goes live.",
  },
  {
    icon: SearchIcon,
    title: "Search and topics",
    text: "Readers find posts by title or topic, and filter the feed to what they like.",
  },
  {
    icon: HeartIcon,
    title: "Likes and comments",
    text: "Readers can like, comment and reply, one level deep, to keep threads tidy.",
  },
  {
    icon: BellIcon,
    title: "Notifications",
    text: "Hear about new likes, comments, shares and subscribers in one place.",
  },
  {
    icon: ChartNoAxesColumnIcon,
    title: "Post stats",
    text: "Reads, likes, comments and shares for every post, plus reads over time.",
  },
]

const steps = [
  {
    n: "01",
    title: "Write",
    text: "Open the editor, add a cover and start with a title. Drafts save as you go.",
  },
  {
    n: "02",
    title: "Preview and publish",
    text: "Add a short description and up to five topics, check the preview, then publish.",
  },
  {
    n: "03",
    title: "Get read",
    text: "Share the link, follow the numbers and answer comments from your dashboard.",
  },
]

const checklist = [
  "Save drafts and come back later",
  "Preview before you publish",
  "Topics that make your post easy to find",
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-canvas">
      <LandingNav />

      <main>
        {/* Hero */}
        <header className="mx-auto max-w-page px-4 pt-12 pb-14 text-center sm:px-6 sm:pt-16 md:pt-20 md:pb-18 lg:pt-24">
          <p className={eyebrow}>A home for writers and readers</p>
          <h1 className="mx-auto mt-5 mb-6 max-w-3xl text-[38px] leading-[1.06] font-semibold tracking-[-1.4px] text-balance text-ink sm:text-[48px] sm:tracking-[-1.8px] md:text-[56px] lg:text-[64px] lg:tracking-[-2.4px]">
            Write what you know. Be read.
          </h1>
          <p className="mx-auto max-w-xl font-serif text-[18px] leading-[1.55] text-ink-subtle md:text-[20px] lg:text-[22px]">
            Byline is a quiet place to publish. Write with a rich block editor,
            add a cover and topics, and watch the likes, comments and reads come
            in.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button size="lg" render={<Link href="/sign-up" />} nativeButton={false}>
              Start writing
            </Button>
            <Button
              size="lg"
              variant="secondary"
              render={<a href="#stories" />}
              nativeButton={false}
            >
              Browse stories
            </Button>
          </div>
        </header>

        {/* Stories */}
        <section id="stories" className={`${section} scroll-mt-16`}>
          <Card className="rounded-3xl [--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(6)] lg:[--card-spacing:--spacing(8)]">
            <CardContent className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {stories.map((s) => (
                <BlogGridCard key={s.slug} blog={s} className="bg-canvas" />
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section id="features" className={`${section} scroll-mt-16`}>
          <div className="mb-10 max-w-160 sm:mb-12">
            <p className={eyebrow}>Features</p>
            <h2 className={h2}>Everything a blog needs. Nothing it doesn’t.</h2>
            <p className={lead}>
              The tools stay out of the way so the writing is what people see.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="rounded-xl [--card-spacing:--spacing(7)]">
                <CardHeader>
                  <div className="mb-3 grid size-10 place-items-center rounded-lg border border-hairline bg-canvas text-ink">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-title-lg">{title}</CardTitle>
                  <CardDescription className="text-body">{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* The editor */}
        <section
          className={`${section} flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16`}
        >
          <div className="min-w-0 lg:flex-1">
            <p className={eyebrow}>The editor</p>
            <h2 className={h2}>Write with blocks.</h2>
            <p className={`${lead} mb-6`}>
              Headings, lists, images, quotes, tables and code, one block at a
              time. Add a cover banner and short description, then preview
              exactly how readers will see it.
            </p>
            <ul className="flex flex-col gap-3 text-body text-ink-muted">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="size-[18px] shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Card className="min-w-0 rounded-xl bg-canvas [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)] lg:flex-1">
            <CardContent className="flex flex-col gap-4">
              <h3 className="text-reading-h2 text-ink">Start with tokens</h3>
              <p className="font-serif text-[18px] leading-[1.75] text-ink-muted sm:text-reading-body">
                A token is a decision with a name. Write it once, use it
                everywhere.
              </p>
              <ul className="list-disc pl-7 font-serif text-[18px] leading-[1.75] text-ink-muted marker:text-ink-subtle sm:text-reading-body">
                <li>Name by role, not appearance</li>
                <li>Keep light and dark side by side</li>
              </ul>
              <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-1 p-5 font-mono text-code text-ink-muted">
                <code>{`.btn {\n  background: var(--ink);\n  color: var(--on-ink);\n}`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Readers */}
        <section
          className={`${section} flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16`}
        >
          <div className="min-w-0 lg:order-2 lg:flex-1">
            <p className={eyebrow}>Your readers</p>
            <h2 className={h2}>Know who’s reading.</h2>
            <p className={lead}>
              See likes, comments, reads and shares for every post. Get a
              notification when someone likes, comments, shares or subscribes,
              and reply right from your dashboard.
            </p>
          </div>
          <Card className="min-w-0 rounded-xl bg-canvas [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(8)] lg:order-1 lg:flex-1">
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Reads" value={4200} icon={EyeIcon} />
                <StatCard label="Likes" value={120} icon={HeartIcon} />
                <StatCard label="Comments" value={31} icon={MessageCircleIcon} />
                <StatCard label="Shares" value={48} icon={Share2Icon} />
              </div>
              <div>
                <NotificationItem
                  notification={{
                    type: "COMMENT",
                    isRead: false,
                    actor: { name: "Amina Yusuf", username: "amina" },
                    blog: { title: "Shipping a side project in six weekends" },
                    comment: "The six-weekend cap is such a good constraint.",
                    date: "2026-10-04T22:00:00Z",
                  }}
                />
                <NotificationItem
                  notification={{
                    type: "SUBSCRIBE",
                    isRead: true,
                    actor: { name: "Sara Lindqvist", username: "saral" },
                    date: "2026-10-04T19:00:00Z",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section id="how" className={`${section} scroll-mt-16`}>
          <div className="mb-10 max-w-160 sm:mb-12">
            <p className={eyebrow}>How it works</p>
            <h2 className={h2}>From first draft to first reader.</h2>
          </div>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-5">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-hairline-strong pt-5">
                <p className="mb-4 font-mono text-body-sm font-semibold text-ink-subtle">
                  {s.n}
                </p>
                <h3 className="mb-2 text-[20px] leading-[1.3] font-semibold tracking-[-0.3px] text-ink sm:text-[22px]">
                  {s.title}
                </h3>
                <p className="text-body text-ink-subtle">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className={section}>
          <Card className="rounded-3xl text-center [--card-spacing:--spacing(12)] sm:[--card-spacing:--spacing(18)]">
            <CardContent className="px-6 sm:px-8">
              <h2 className={`${h2} mt-0`}>Your first post is a few minutes away.</h2>
              <p className={`${lead} mx-auto mb-8 max-w-130`}>
                Free to join. Write now, publish when you’re ready.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  render={<Link href="/sign-up" />}
                  nativeButton={false}
                >
                  Create your account
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  render={<Link href="/sign-in" />}
                  nativeButton={false}
                >
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mx-auto flex max-w-page flex-col gap-6 border-t border-hairline px-4 pt-6 pb-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-ink-subtle">
          {[
            ["#stories", "Stories"],
            ["#features", "Features"],
            ["#how", "How it works"],
            ["#", "Terms"],
            ["#", "Privacy"],
          ].map(([href, label]) => (
            <a
              key={label}
              href={href}
              className="rounded-xs hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <span className="text-body-sm text-ink-subtle">© 2026 Byline</span>
      </footer>
    </div>
  )
}
