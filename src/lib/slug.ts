/** "Hello, World!  It's 2026" → "hello-world-its-2026" */
export function kebab(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"

function randomSuffix(length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")
}

/** Blog slug: kebab(title) cut to 80 chars + "-" + 6 random chars (FR-PUB-05). */
export function blogSlug(title: string) {
  const base = kebab(title).slice(0, 80).replace(/-+$/, "") || "blog"
  return `${base}-${randomSuffix()}`
}

/** Topic slug: lowercase kebab-case (FR-PUB-04). */
export function topicSlug(name: string) {
  return kebab(name).slice(0, 40)
}
