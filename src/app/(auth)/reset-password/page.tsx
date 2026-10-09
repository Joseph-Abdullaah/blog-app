import type { Metadata } from "next"

import { ResetPasswordForm } from "@/components/byline"

export const metadata: Metadata = { title: "Reset password" }

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
