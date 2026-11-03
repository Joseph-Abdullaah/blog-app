import type { Metadata } from "next"

import { VerifyEmailCard } from "@/components/byline"

export const metadata: Metadata = { title: "Verify your email" }

export default function VerifyEmailPage() {
  return <VerifyEmailCard />
}
