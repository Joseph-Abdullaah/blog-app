import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/** Byline type-scale tokens (see globals.css). Teaches tailwind-merge that `text-<token>` is a font size, not a color. */
const bylineFontSizes = [
  "display-lg",
  "display-md",
  "display-sm",
  "headline",
  "title-lg",
  "title",
  "title-sm",
  "body",
  "body-sm",
  "label",
  "caption",
  "eyebrow",
  "reading-lead",
  "reading-body",
  "reading-sm",
  "reading-h2",
  "reading-h3",
  "reading-h4",
  "code",
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: bylineFontSizes }],
      rounded: [{ rounded: ["pill"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
