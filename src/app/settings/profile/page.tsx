import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { EditProfileForm } from "@/components/screens/edit-profile-form"
import { dashboardContext } from "@/lib/dashboard-context"
import { getMe } from "@/lib/services/users"

export const metadata: Metadata = { title: "Edit Profile" }

/** S-14 — edit name, username, bio, avatar and social links. */
export default async function EditProfilePage() {
  const { user, shellUser, unread } = await dashboardContext("/settings/profile")
  const me = await getMe(user.id)

  return (
    <DashboardShell user={shellUser} active="Edit Profile" unread={unread} title="Edit Profile">
      <EditProfileForm me={me} />
    </DashboardShell>
  )
}
