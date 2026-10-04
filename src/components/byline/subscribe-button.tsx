"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

/** Subscribe / Subscribed toggle. Local state only until the API is wired up. */
function SubscribeButton({
  subscribed: initial = false,
  name,
}: {
  subscribed?: boolean
  /** Used in the toast, e.g. "Subscribed to Amina". */
  name?: string
}) {
  const [subscribed, setSubscribed] = React.useState(initial)

  return (
    <Button
      variant="secondary"
      size="sm"
      aria-pressed={subscribed}
      onClick={() => {
        setSubscribed(!subscribed)
        if (name) {
          toast.add({
            title: subscribed ? `Unsubscribed from ${name}` : `Subscribed to ${name}`,
            type: "success",
          })
        }
      }}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  )
}

export { SubscribeButton }
