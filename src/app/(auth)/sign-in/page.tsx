import type { Metadata } from "next"

import { SignInForm } from "@/components/byline"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage() {
  return <SignInForm />
}
