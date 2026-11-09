import type { Metadata } from "next"

import { DashboardShell } from "@/components/byline"
import { EditProfileForm } from "@/components/screens/edit-profile-form"
import { currentUser } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Edit Profile" }

export default function EditProfilePage() {
  return (
    <DashboardShell
      user={currentUser}
      active="Edit Profile"
      unread
      title="Edit Profile"
    >
      <EditProfileForm user={currentUser} />
    </DashboardShell>
  )
}
