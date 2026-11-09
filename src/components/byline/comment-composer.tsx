"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { TextareaField } from "./text-field"

/** Comment box: textarea with a 1000-character counter and a Comment button. */
function CommentComposer({
  onSubmit,
  label = "Add a comment",
  placeholder = "Add a comment",
  submitLabel = "Comment",
  successMessage = "Comment posted",
  autoFocus,
  onCancel,
}: {
  /** Return `false` (or throw) to keep the text, e.g. when the request failed. */
  onSubmit?: (content: string) => boolean | void | Promise<boolean | void>
  label?: string
  placeholder?: string
  submitLabel?: string
  successMessage?: string
  autoFocus?: boolean
  onCancel?: () => void
}) {
  const [value, setValue] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!value.trim()) return
        setLoading(true)
        try {
          if ((await onSubmit?.(value.trim())) === false) return
          setValue("")
          toast.add({ title: successMessage, type: "success" })
        } catch {
          // The caller reports the error; keep the text so nothing is lost.
        } finally {
          setLoading(false)
        }
      }}
    >
      <TextareaField
        label={label}
        name="comment"
        placeholder={placeholder}
        maxLength={1000}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading} disabled={!value.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export { CommentComposer }
