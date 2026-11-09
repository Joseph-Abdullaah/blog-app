"use client"

import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

/** Subscribe / Subscribed toggle (E6/E7). Guests are sent to sign-in. */
function SubscribeButton({
  subscribed: initial = false,
  name,
  username,
  onChange,
}: {
  subscribed?: boolean
  /** Used in the toast, e.g. "Subscribed to Amina". */
  name?: string
  /** Whose author to (un)subscribe; without it the button is display-only. */
  username?: string
  onChange?: (state: { subscribed: boolean; subscribersCount: number }) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [subscribed, setSubscribed] = React.useState(initial)
  const [busy, setBusy] = React.useState(false)

  async function toggle() {
    if (!username) return setSubscribed(!subscribed)
    const next = !subscribed
    setSubscribed(next)
    setBusy(true)
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}/subscription`, {
        method: next ? "PUT" : "DELETE",
      })
      if (res.status === 401) {
        setSubscribed(!next)
        router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }
      const body = (await res.json()) as {
        data?: { subscribed: boolean; subscribersCount: number }
        error?: { message: string }
      }
      if (!res.ok || !body.data) throw new Error(body.error?.message)
      setSubscribed(body.data.subscribed)
      onChange?.(body.data)
      if (name) {
        toast.add({
          title: body.data.subscribed ? `Subscribed to ${name}` : `Unsubscribed from ${name}`,
          type: "success",
        })
      }
    } catch (error) {
      setSubscribed(!next)
      toast.add({
        title: "Couldn't update your subscription",
        description: (error as Error).message || "Try again.",
        type: "error",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      aria-pressed={subscribed}
      disabled={busy}
      onClick={() => void toggle()}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  )
}

export { SubscribeButton }
