import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import type { BlogStatus } from "./types"

/** 64px editor bar: mark + title, status, unsaved indicator, Preview / Save Draft / Publish. */
function EditorBar({
  title,
  status = "DRAFT",
  savedAt,
  dirty = false,
  saving = false,
  publishing = false,
  onPreview,
  onSaveDraft,
  onPublish,
  className,
}: {
  title?: string
  status?: BlogStatus
  /** e.g. "2m ago". */
  savedAt?: string
  dirty?: boolean
  saving?: boolean
  publishing?: boolean
  onPreview?: () => void
  onSaveDraft?: () => void
  onPublish?: () => void
  className?: string
}) {
  const published = status === "PUBLISHED"

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-navbar border-b border-hairline bg-canvas/85 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-wide items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo wordmark={false} />
        <span className="min-w-0 flex-1 truncate text-title-sm text-ink sm:max-w-60 sm:flex-none">
          {title || "Untitled"}
        </span>
        <Badge variant={published ? "brand" : "secondary"} className="hidden sm:inline-flex">
          {published ? "Published" : "Draft"}
        </Badge>
        <span
          aria-live="polite"
          className={cn(
            "hidden text-caption sm:inline",
            dirty ? "text-warning" : "text-ink-subtle"
          )}
        >
          {dirty ? "Unsaved changes" : savedAt ? `Saved ${savedAt}` : null}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={onPreview}>
            Preview
          </Button>
          <Button variant="secondary" loading={saving} onClick={onSaveDraft}>
            {published ? "Unpublish" : "Save Draft"}
          </Button>
          <Button loading={publishing} onClick={onPublish}>
            {published ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </header>
  )
}

export { EditorBar }
