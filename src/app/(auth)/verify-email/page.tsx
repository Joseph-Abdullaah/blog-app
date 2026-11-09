import type { Metadata } from "next"
import { Suspense } from "react"

import { VerifyEmailCard } from "@/components/byline"

export const metadata: Metadata = { title: "Verify your email" }

/** The card reads `?email=&from=` with useSearchParams, which needs a Suspense boundary. */
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailCard />
    </Suspense>
  )
}
