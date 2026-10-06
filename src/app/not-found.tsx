import type { Metadata } from "next"
import Link from "next/link"

import { Logo } from "@/components/byline"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Logo wordmark={false} size={40} />
        <h1 className="mt-2 text-display-md text-ink">Page not found</h1>
        <p className="max-w-105 text-title-sm font-normal text-ink-subtle">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Button
          size="lg"
          className="mt-4"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Go home
        </Button>
      </main>
    </div>
  )
}
