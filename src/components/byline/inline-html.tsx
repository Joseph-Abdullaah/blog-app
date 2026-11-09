import * as React from "react"

/**
 * Turns Editor.js inline HTML into React elements using an allow-list
 * (FR-READ-02): b, i, a[href], code, mark, br. Anything else is dropped but its
 * text is kept. Nothing is injected as raw HTML, so markup can't run scripts.
 */

const ALIASES: Record<string, string> = { strong: "b", em: "i" }
const ALLOWED = new Set(["b", "i", "a", "code", "mark", "br"])

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

function decode(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return ENTITIES[entity.toLowerCase()] ?? match
  })
}

/** Only http(s) and mailto links survive. */
function safeHref(attrs: string) {
  const match = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const raw = decode(match?.[2] ?? match?.[3] ?? match?.[4] ?? "").trim()
  try {
    const url = new URL(raw)
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

type Node = { tag: string; href?: string | null; children: React.ReactNode[] }

const MARK_CLASS = "rounded-xs bg-brand-subtle px-0.5 text-inherit"
const CODE_CLASS = "rounded-xs bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink"
const LINK_CLASS = "text-brand underline underline-offset-3 hover:text-brand-hover"

function element(node: Node, key: number): React.ReactNode {
  switch (node.tag) {
    case "b":
      return <b key={key}>{node.children}</b>
    case "i":
      return <i key={key}>{node.children}</i>
    case "code":
      return (
        <code key={key} className={CODE_CLASS}>
          {node.children}
        </code>
      )
    case "mark":
      return (
        <mark key={key} className={MARK_CLASS}>
          {node.children}
        </mark>
      )
    case "a":
      return node.href ? (
        <a
          key={key}
          href={node.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={LINK_CLASS}
        >
          {node.children}
        </a>
      ) : (
        <React.Fragment key={key}>{node.children}</React.Fragment>
      )
    default:
      return <React.Fragment key={key}>{node.children}</React.Fragment>
  }
}

export function renderInline(html: unknown): React.ReactNode[] {
  if (typeof html !== "string" || !html) return []

  const root: Node = { tag: "root", children: [] }
  const stack: Node[] = [root]
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)|</g
  let key = 0

  for (const match of html.matchAll(pattern)) {
    const [, closing, rawTag, attrs, text] = match
    const top = stack[stack.length - 1]

    if (text !== undefined || !rawTag) {
      top.children.push(decode(text ?? "<"))
      continue
    }

    const tag = ALIASES[rawTag.toLowerCase()] ?? rawTag.toLowerCase()
    if (!ALLOWED.has(tag)) continue // drop the tag, keep surrounding text

    if (tag === "br") {
      top.children.push(<br key={key++} />)
      continue
    }

    if (closing) {
      const index = stack.findLastIndex((n) => n.tag === tag)
      if (index <= 0) continue
      while (stack.length > index) {
        const node = stack.pop()!
        stack[stack.length - 1].children.push(element(node, key++))
      }
    } else {
      stack.push({ tag, href: tag === "a" ? safeHref(attrs) : undefined, children: [] })
    }
  }

  // Close anything left open.
  while (stack.length > 1) {
    const node = stack.pop()!
    stack[stack.length - 1].children.push(element(node, key++))
  }
  return root.children
}

/** Plain text of inline HTML (read time, previews). */
export function inlineText(html: unknown) {
  return typeof html === "string"
    ? decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim()
    : ""
}
