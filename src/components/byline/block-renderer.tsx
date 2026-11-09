import { CheckIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { renderInline } from "./inline-html"

type Block = { id?: string; type: string; data: Record<string, unknown> }

type ListItem =
  | string
  | { content?: string; meta?: { checked?: boolean }; items?: ListItem[] }

const READING = "font-serif text-reading-body text-ink-muted"

const HEADINGS = {
  2: "mt-12 mb-4 text-reading-h2 text-ink",
  3: "mt-10 mb-4 text-reading-h3 text-ink",
  4: "mt-8 mb-4 text-reading-h4 text-ink",
} as const

/** Embeds are limited to the services the editor allows (FR-EDIT-02). */
const EMBED_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "platform.twitter.com",
  "twitter.com",
  "codepen.io",
]

function safeEmbed(src: unknown) {
  if (typeof src !== "string") return null
  try {
    const url = new URL(src)
    return url.protocol === "https:" && EMBED_HOSTS.includes(url.hostname)
      ? url.href
      : null
  } catch {
    return null
  }
}

function safeImage(src: unknown) {
  if (typeof src !== "string") return null
  try {
    const url = new URL(src)
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}

function Caption({ text }: { text: unknown }) {
  const nodes = renderInline(text)
  return nodes.length ? (
    <figcaption className="mt-2 text-center text-caption text-ink-subtle">
      {nodes}
    </figcaption>
  ) : null
}

function ListItems({
  items,
  style,
}: {
  items: ListItem[]
  style: "ordered" | "unordered" | "checklist"
}) {
  if (style === "checklist") {
    return (
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const content = typeof item === "string" ? item : item.content
          const checked = typeof item === "object" && Boolean(item.meta?.checked)
          return (
            <li key={i} className="flex items-start gap-3">
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 grid size-5 shrink-0 place-items-center rounded-xs border border-hairline-strong",
                  checked && "border-ink bg-ink text-on-ink"
                )}
              >
                {checked ? <CheckIcon className="size-3.5" /> : null}
              </span>
              <span className={cn(checked && "text-ink-subtle line-through")}>
                <span className="sr-only">{checked ? "Done: " : "To do: "}</span>
                {renderInline(content)}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  const List = style === "ordered" ? "ol" : "ul"
  return (
    <List
      className={cn(
        "flex flex-col gap-2 pl-7 marker:text-ink-subtle",
        style === "ordered" ? "list-decimal" : "list-disc"
      )}
    >
      {items.map((item, i) => {
        const content = typeof item === "string" ? item : item.content
        const nested = typeof item === "object" ? item.items : undefined
        return (
          <li key={i}>
            {renderInline(content)}
            {nested?.length ? (
              <div className="mt-2">
                <ListItems items={nested} style={style} />
              </div>
            ) : null}
          </li>
        )
      })}
    </List>
  )
}

function renderBlock(block: Block, key: React.Key) {
  const d = block.data ?? {}

  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className={cn("mb-6", READING)}>
          {renderInline(d.text)}
        </p>
      )

    case "header": {
      const level = [2, 3, 4].includes(Number(d.level)) ? (Number(d.level) as 2 | 3 | 4) : 2
      const Tag = `h${level}` as "h2" | "h3" | "h4"
      return (
        <Tag key={key} className={HEADINGS[level]}>
          {renderInline(d.text)}
        </Tag>
      )
    }

    case "list": {
      const style =
        d.style === "ordered" || d.style === "checklist" ? d.style : "unordered"
      const items = Array.isArray(d.items) ? (d.items as ListItem[]) : []
      return (
        <div key={key} className={cn("mb-6", READING)}>
          <ListItems items={items} style={style} />
        </div>
      )
    }

    case "quote":
      return (
        <blockquote
          key={key}
          className={cn("mb-6 border-l-[3px] border-ink pl-5 italic", READING)}
        >
          {renderInline(d.text)}
          {renderInline(d.caption).length ? (
            <footer className="mt-2 font-sans text-body-sm text-ink-subtle not-italic">
              — {renderInline(d.caption)}
            </footer>
          ) : null}
        </blockquote>
      )

    case "code":
      return (
        <pre
          key={key}
          className="mb-6 overflow-x-auto rounded-lg border border-hairline bg-surface-1 p-5 font-mono text-code text-ink-muted"
        >
          <code>{typeof d.code === "string" ? d.code : ""}</code>
        </pre>
      )

    case "image": {
      const src = safeImage((d.file as { url?: string } | undefined)?.url ?? d.url)
      if (!src) return null
      return (
        <figure key={key} className={cn("mb-6", d.stretched === true && "sm:-mx-16")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={typeof d.caption === "string" ? d.caption.replace(/<[^>]*>/g, "") : ""}
            loading="lazy"
            className={cn(
              "w-full rounded-lg",
              d.withBorder === true && "border border-hairline",
              d.withBackground === true && "bg-surface-1 p-6"
            )}
          />
          <Caption text={d.caption} />
        </figure>
      )
    }

    case "embed": {
      const src = safeEmbed(d.embed)
      if (!src) return null
      return (
        <figure key={key} className="mb-6">
          <div className="aspect-video overflow-hidden rounded-lg border border-hairline bg-surface-1">
            <iframe
              src={src}
              title={typeof d.service === "string" ? `${d.service} embed` : "Embedded content"}
              className="size-full"
              loading="lazy"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            />
          </div>
          <Caption text={d.caption} />
        </figure>
      )
    }

    case "table": {
      const rows = Array.isArray(d.content) ? (d.content as unknown[][]) : []
      if (!rows.length) return null
      const [head, ...body] = d.withHeadings === true ? rows : [null, ...rows]
      return (
        <div key={key} className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-body-sm text-ink-muted">
            {head ? (
              <thead>
                <tr className="border-b border-hairline-strong">
                  {head.map((cell, i) => (
                    <th key={i} className="p-3 text-left text-title-sm text-ink">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="border-b border-hairline">
                  {(row ?? []).map((cell, c) => (
                    <td key={c} className="p-3 align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case "delimiter":
      return (
        <div
          key={key}
          role="separator"
          className="my-12 flex justify-center gap-3"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1 rounded-full bg-ink-tertiary" />
          ))}
        </div>
      )

    default:
      return null
  }
}

/** Renders Editor.js blocks with the shared reader typography (S-03). */
function BlockRenderer({
  blocks,
  className,
}: {
  blocks: { id?: string; type: string; data: unknown }[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {blocks.map((block, i) =>
        renderBlock(
          { ...block, data: (block.data ?? {}) as Record<string, unknown> },
          block.id ?? i
        )
      )}
    </div>
  )
}

export { BlockRenderer }
