"use client"

import { useEffect } from "react"

const VISIBLE_MS = 10_000

/**
 * Records one read after the page has been visible for 10 s in total
 * (FR-READ-04). Time in a background tab doesn't count.
 */
export function ReadTracker({ blogId }: { blogId: string }) {
  useEffect(() => {
    let visibleFor = 0
    let since = document.visibilityState === "visible" ? Date.now() : null
    let done = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const send = () => {
      if (done) return
      done = true
      void fetch(`/api/blogs/${blogId}/reads`, { method: "POST", keepalive: true })
    }

    const schedule = () => {
      clearTimeout(timer)
      if (since !== null && !done) {
        timer = setTimeout(send, Math.max(0, VISIBLE_MS - visibleFor))
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        since = Date.now()
      } else if (since !== null) {
        visibleFor += Date.now() - since
        since = null
      }
      schedule()
    }

    schedule()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [blogId])

  return null
}
