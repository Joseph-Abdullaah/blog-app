import type { Metadata } from "next"

import { SignUpForm } from "@/components/byline"

export const metadata: Metadata = { title: "Sign up" }

export default function SignUpPage() {
  return <SignUpForm />
}
