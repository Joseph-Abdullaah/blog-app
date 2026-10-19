import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

import { put } from "@vercel/blob"
import { imageSize } from "image-size"

import { ApiError } from "@/lib/errors"

const MB = 1024 * 1024

/** Upload rules per purpose (FR-EDIT-03/04, FR-PROF-04). */
const RULES = {
  banner: { folder: "banners", maxBytes: 5 * MB, types: ["jpg", "png", "webp"] },
  avatar: { folder: "avatars", maxBytes: 2 * MB, types: ["jpg", "png", "webp"] },
  content: { folder: "content", maxBytes: 5 * MB, types: ["jpg", "png", "webp", "gif"] },
} as const

export type UploadKind = keyof typeof RULES

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
}

const LABEL: Record<UploadKind, string> = {
  banner: "JPG, PNG or WebP",
  avatar: "JPG, PNG or WebP",
  content: "JPG, PNG, WebP or GIF",
}

export type UploadedImage = { url: string; width: number; height: number }

/**
 * Validate an image by its real bytes (not the client's MIME type), then store
 * it at `{folder}/{userId}/{uuid}.{ext}` on Vercel Blob.
 */
export async function uploadImage(
  userId: string,
  kind: UploadKind,
  bytes: Uint8Array
): Promise<UploadedImage> {
  const rule = RULES[kind]
  const limitMb = rule.maxBytes / MB

  if (bytes.byteLength > rule.maxBytes) {
    throw new ApiError("PAYLOAD_TOO_LARGE", `Image must be ${limitMb} MB or smaller`)
  }

  let info: ReturnType<typeof imageSize>
  try {
    info = imageSize(bytes)
  } catch {
    throw new ApiError("UNSUPPORTED_MEDIA_TYPE", `Use a ${LABEL[kind]} image`)
  }
  const ext = info.type === "jpeg" ? "jpg" : info.type
  if (!ext || !(rule.types as readonly string[]).includes(ext)) {
    throw new ApiError("UNSUPPORTED_MEDIA_TYPE", `Use a ${LABEL[kind]} image`)
  }

  const blob = await put(
    `${rule.folder}/${userId}/${crypto.randomUUID()}.${ext}`,
    Buffer.from(bytes),
    { access: "public", contentType: MIME[ext] }
  )

  return { url: blob.url, width: info.width ?? 0, height: info.height ?? 0 }
}

/** Read a `File` from multipart form data, or throw 422. */
export async function fileBytes(form: FormData, field: string) {
  const file = form.get(field)
  if (!(file instanceof File) || file.size === 0) {
    throw ApiError.validation("Choose an image to upload", { [field]: "Required" })
  }
  return new Uint8Array(await file.arrayBuffer())
}

/* ─────────────── Fetch by URL (E33) ─────────────── */

function isPrivateIPv4(ip: string) {
  const [a, b] = ip.split(".").map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isPrivateAddress(ip: string) {
  if (isIP(ip) === 4) return isPrivateIPv4(ip)
  const v6 = ip.toLowerCase()
  if (v6.startsWith("::ffff:")) return isPrivateIPv4(v6.slice(7))
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb")
  )
}

/**
 * Download a remote image for re-hosting: http(s) only, public hosts only,
 * no redirects, 10 s timeout, 5 MB cap (API spec E33).
 */
export async function fetchRemoteImage(rawUrl: string) {
  const url = new URL(rawUrl)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw ApiError.validation("Enter a valid http(s) image URL")
  }

  const host = url.hostname.replace(/^\[|\]$/g, "")
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => [])
  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
    throw ApiError.validation("That image URL can't be used")
  }

  let response: Response
  try {
    response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "image/*" },
    })
  } catch {
    throw ApiError.validation("Couldn't download that image")
  }
  if (!response.ok || !response.body) {
    throw ApiError.validation("Couldn't download that image")
  }

  const max = RULES.content.maxBytes
  if (Number(response.headers.get("content-length") ?? 0) > max) {
    throw new ApiError("PAYLOAD_TOO_LARGE", "Image must be 5 MB or smaller")
  }

  // Stream with a hard cap in case content-length is missing or wrong.
  const chunks: Uint8Array[] = []
  let total = 0
  const reader = response.body.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > max) {
      await reader.cancel()
      throw new ApiError("PAYLOAD_TOO_LARGE", "Image must be 5 MB or smaller")
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}
