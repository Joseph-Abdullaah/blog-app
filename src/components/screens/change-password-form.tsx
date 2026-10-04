"use client"

import * as React from "react"
import { LockIcon } from "lucide-react"

import { TextField } from "@/components/byline"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

/** Change Password form (S-15). Validates locally; no request is sent yet. */
function ChangePasswordForm() {
  const [errors, setErrors] = React.useState<{
    current?: string
    next?: string
  }>({})
  const [loading, setLoading] = React.useState(false)

  return (
    <form
      noValidate
      className="flex max-w-115 flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = new FormData(form)
        const current = String(data.get("current") ?? "")
        const next = String(data.get("next") ?? "")
        const result = {
          current: current ? undefined : "Enter your current password",
          next: next.length < 8 ? "Use at least 8 characters" : undefined,
        }
        setErrors(result)
        if (result.current || result.next) return
        setLoading(true)
        // TODO: POST /api/account/password
        await new Promise((r) => setTimeout(r, 400))
        setLoading(false)
        form.reset()
        toast.add({ title: "Password changed", type: "success" })
      }}
    >
      <TextField
        name="current"
        type="password"
        label="Current password"
        icon={LockIcon}
        placeholder="Current password"
        autoComplete="current-password"
        error={errors.current}
      />
      <TextField
        name="next"
        type="password"
        label="New password"
        icon={LockIcon}
        placeholder="New password"
        autoComplete="new-password"
        help="At least 8 characters"
        error={errors.next}
      />
      <div>
        <Button type="submit" size="lg" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  )
}

export { ChangePasswordForm }
