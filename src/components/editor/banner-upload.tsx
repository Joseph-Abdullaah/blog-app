"use client"

import { ImageIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const ACCEPT = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string }

/** XHR so the progress bar can follow the upload (fetch can't report it). */
function uploadBanner(file: File, onProgress: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)
    form.append("purpose", "banner")

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/uploads")
    xhr.responseType = "json"
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const body = xhr.response as
        | { data?: { url: string }; error?: { message: string } }
        | null
      if (xhr.status >= 200 && xhr.status < 300 && body?.data) {
        resolve(body.data.url)
      } else {
        reject(new Error(body?.error?.message ?? "Upload failed. Try again."))
      }
    }
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."))
    xhr.send(form)
  })
}

/** 16:9 banner: empty · dragging · uploading · filled · error (S-09, FR-EDIT-04). */
export function BannerUpload({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState<UploadState>({ kind: "idle" })

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!ACCEPT.includes(file.type)) {
      setState({ kind: "error", message: "Use a JPG, PNG or WebP image" })
      return
    }
    if (file.size > MAX_BYTES) {
      setState({ kind: "error", message: "Image must be 5 MB or smaller" })
      return
    }
    setState({ kind: "uploading", progress: 0 })
    try {
      const url = await uploadBanner(file, (progress) =>
        setState({ kind: "uploading", progress })
      )
      setState({ kind: "idle" })
      onChange(url)
    } catch (error) {
      setState({ kind: "error", message: (error as Error).message })
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT.join(",")}
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => {
        void handleFile(e.target.files?.[0])
        e.target.value = ""
      }}
    />
  )

  if (value && state.kind !== "uploading") {
    return (
      <div className="group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Blog banner"
          className="aspect-video w-full rounded-lg border border-hairline object-cover"
        />
        <div className="absolute right-3 bottom-3 flex gap-2 opacity-100 transition-opacity duration-fast sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
        {input}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-label="Upload blog banner"
        disabled={state.kind === "uploading"}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFile(e.dataTransfer.files?.[0])
        }}
        className={cn(
          "flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline-strong bg-surface-1 px-6 text-center text-ink-subtle transition-colors duration-fast hover:bg-surface-2",
          dragging && "border-brand bg-brand-subtle",
          state.kind === "error" && "border-danger"
        )}
      >
        {state.kind === "uploading" ? (
          <div className="flex w-full max-w-60 flex-col gap-2">
            <span className="text-title-sm text-ink">Blog Banner</span>
            <Progress value={state.progress} aria-label="Upload progress" />
            <span className="text-caption">Uploading… {state.progress}%</span>
          </div>
        ) : (
          <>
            <ImageIcon className="size-7" aria-hidden />
            <span className="text-title-sm text-ink">Blog Banner</span>
            <span className="text-body-sm">
              {dragging
                ? "Drop to upload"
                : "Click or drop an image · JPG, PNG or WebP · up to 5 MB"}
            </span>
          </>
        )}
      </button>
      {state.kind === "error" ? (
        <p role="alert" className="text-caption text-danger">
          {state.message}
        </p>
      ) : null}
      {input}
    </div>
  )
}
