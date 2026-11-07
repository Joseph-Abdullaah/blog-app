import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { ChangePasswordForm } from "@/components/screens/change-password-form"
import { dashboardContext } from "@/lib/dashboard-context"
import { getMe } from "@/lib/services/users"

export const metadata: Metadata = { title: "Change Password" }

/** S-15 — change password, or set one for Google-only accounts (FR-PROF-05). */
export default async function ChangePasswordPage() {
  const { user, shellUser, unread } = await dashboardContext("/settings/password")
  const me = await getMe(user.id)

  return (
    <DashboardShell user={shellUser} active="Change Password" unread={unread} title="Change Password">
      <ChangePasswordForm hasPassword={me.hasPassword} />
    </DashboardShell>
  )
}
