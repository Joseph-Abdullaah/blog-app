import * as React from "react"

import { Separator } from "@/components/ui/separator"
import type { Block } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/**
 * Inline formatting from the editor: only <b>, <i>, <code> and <mark> are
 * honoured; everything else is rendered as plain text (never as HTML).
 */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(<\/?(?:b|i|code|mark)>)/g)
  const out: React.ReactNode[] = []
  const stack: { tag: string; children: React.ReactNode[] }[] = [
    { tag: "root", children: out },
  ]
  parts.forEach((part, i) => {
    const open = part.match(/^<(b|i|code|mark)>$/)
    const close = part.match(/^<\/(b|i|code|mark)>$/)
    if (open) {
      stack.push({ tag: open[1], children: [] })
    } else if (close && stack.length > 1 && stack.at(-1)!.tag === close[1]) {
      const { tag, children } = stack.pop()!
      const Tag = tag as "b" | "i" | "code" | "mark"
      const cls =
        tag === "code"
          ? "rounded-xs bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]"
          : tag === "mark"
            ? "bg-brand-subtle"
            : undefined
      stack.at(-1)!.children.push(
        <Tag key={i} className={cls}>
          {children}
        </Tag>
      )
    } else if (part) {
      stack.at(-1)!.children.push(part)
    }
  })
  while (stack.length > 1) {
    const { children } = stack.pop()!
    stack.at(-1)!.children.push(...children)
  }
  return out
}

const headings = {
  2: "mt-12 mb-4 text-reading-h2 text-ink",
  3: "mt-10 mb-4 text-reading-h3 text-ink",
  4: "mt-8 mb-4 text-reading-h4 text-ink",
} as const

/** Renders Editor.js-style blocks with the shared reader typography. */
function BlockRenderer({
  blocks,
  className,
}: {
  blocks: Block[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={i}
                className="mb-6 font-serif text-reading-body text-ink-muted"
              >
                {renderInline(block.data.text)}
              </p>
            )
          case "header": {
            const Tag = `h${block.data.level}` as "h2" | "h3" | "h4"
            return (
              <Tag key={i} className={headings[block.data.level]}>
                {renderInline(block.data.text)}
              </Tag>
            )
          }
          case "list": {
            const List = block.data.style === "ordered" ? "ol" : "ul"
            return (
              <List
                key={i}
                className={cn(
                  "mb-6 flex flex-col gap-2 pl-7 font-serif text-reading-body text-ink-muted marker:text-ink-subtle",
                  block.data.style === "ordered" ? "list-decimal" : "list-disc"
                )}
              >
                {block.data.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </List>
            )
          }
          case "code":
            return (
              <pre
                key={i}
                className="mb-6 overflow-x-auto rounded-lg border border-hairline bg-surface-1 p-5 font-mono text-code text-ink-muted"
              >
                <code>{block.data.code}</code>
              </pre>
            )
          case "quote":
            return (
              <blockquote
                key={i}
                className="mb-6 border-l-[3px] border-ink pl-5 font-serif text-reading-body text-ink-muted italic"
              >
                {renderInline(block.data.text)}
                {block.data.caption ? (
                  <footer className="mt-2 font-sans text-body-sm text-ink-subtle not-italic">
                    — {block.data.caption}
                  </footer>
                ) : null}
              </blockquote>
            )
          case "image":
            return (
              <figure key={i} className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.data.url}
                  alt={block.data.caption ?? ""}
                  className="w-full rounded-lg"
                />
                {block.data.caption ? (
                  <figcaption className="mt-2 text-center text-caption text-ink-subtle">
                    {block.data.caption}
                  </figcaption>
                ) : null}
              </figure>
            )
          case "delimiter":
            return (
              <Separator
                key={i}
                className="my-12 h-1 w-12 self-center border-0 bg-transparent bg-[radial-gradient(circle,var(--ink-tertiary)_2px,transparent_2px)] bg-[length:16px_4px]"
              />
            )
        }
      })}
    </div>
  )
}

export { BlockRenderer }
