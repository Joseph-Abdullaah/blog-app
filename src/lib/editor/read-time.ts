import type { EditorJsData } from "@/types/dto"

const WORDS_PER_MINUTE = 200

const strip = (value: unknown) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, " ") : ""

type ListItem = string | { content?: string; items?: ListItem[] }

function listText(items: unknown): string {
  if (!Array.isArray(items)) return ""
  return (items as ListItem[])
    .map((item) =>
      typeof item === "string"
        ? strip(item)
        : `${strip(item.content)} ${listText(item.items)}`
    )
    .join(" ")
}

/** All readable text in the content (paragraphs, headings, lists, quotes, tables, code). */
export function contentText(content: EditorJsData) {
  return content.blocks
    .map(({ type, data }) => {
      switch (type) {
        case "paragraph":
        case "header":
          return strip(data.text)
        case "quote":
          return `${strip(data.text)} ${strip(data.caption)}`
        case "list":
          return listText(data.items)
        case "table":
          return Array.isArray(data.content)
            ? (data.content as unknown[][]).flat().map(strip).join(" ")
            : ""
        case "code":
          return typeof data.code === "string" ? data.code : ""
        case "image":
        case "embed":
          return strip(data.caption)
        default:
          return ""
      }
    })
    .join(" ")
}

/** Minutes to read, at least 1 (FR-PUB-05). */
export function readTimeMinutes(content: EditorJsData) {
  const words = contentText(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
