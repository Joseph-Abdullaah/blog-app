"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { TextareaField } from "./text-field"

/** Comment box: textarea with a 1000-character counter and a Comment button. */
function CommentComposer({
  onSubmit,
}: {
  onSubmit?: (content: string) => void | Promise<void>
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
          await onSubmit?.(value)
          setValue("")
          toast.add({ title: "Comment posted", type: "success" })
        } finally {
          setLoading(false)
        }
      }}
    >
      <TextareaField
        label="Add a comment"
        name="comment"
        placeholder="Add a comment"
        maxLength={1000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={!value.trim()}>
          Comment
        </Button>
      </div>
    </form>
  )
}

export { CommentComposer }
