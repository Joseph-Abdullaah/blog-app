import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { ChangePasswordForm } from "@/components/screens/change-password-form"
import { currentUser } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Change Password" }

export default function ChangePasswordPage() {
  return (
    <DashboardShell
      user={currentUser}
      active="Change Password"
      unread
      title="Change Password"
    >
      <ChangePasswordForm />
    </DashboardShell>
  )
}
