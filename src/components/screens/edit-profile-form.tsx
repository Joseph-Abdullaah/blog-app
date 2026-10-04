"use client"

import * as React from "react"
import {
  AtSignIcon,
  BirdIcon,
  BookOpenIcon,
  CameraIcon,
  GitBranchIcon,
  GlobeIcon,
  MailIcon,
  PlayIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react"

import { TextareaField, TextField, UserAvatar } from "@/components/byline"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import type { MockUser } from "@/lib/mock-data"

/** Edit Profile form (S-14). Saves to a toast until the API is connected. */
function EditProfileForm({ user }: { user: MockUser }) {
  const [loading, setLoading] = React.useState(false)

  return (
    <form
      className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        // TODO: PATCH /api/profile with new FormData(e.currentTarget)
        await new Promise((r) => setTimeout(r, 400))
        setLoading(false)
        toast.add({ title: "Profile updated", type: "success" })
      }}
    >
      <div className="flex flex-col items-center gap-4 md:w-40 md:shrink-0">
        <UserAvatar name={user.name} src={user.image} size="3xl" />
        <Button type="button" variant="secondary">
          <UploadIcon aria-hidden />
          Upload
        </Button>
      </div>

      <div className="flex max-w-160 min-w-0 flex-1 flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="name"
            label="Name"
            icon={UserIcon}
            defaultValue={user.name}
          />
          <TextField
            name="email"
            label="Email"
            icon={MailIcon}
            defaultValue={user.email}
            readOnly
          />
        </div>
        <TextField
          name="username"
          label="Username"
          icon={AtSignIcon}
          defaultValue={user.username}
          help="Username is used to find you and appears on your profile"
        />
        <TextareaField
          name="bio"
          label="Bio"
          maxLength={200}
          defaultValue={user.bio}
        />
        <h2 className="mt-2 text-title-sm text-ink">Social links</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="youtube"
            label="YouTube"
            hideLabel
            icon={PlayIcon}
            placeholder="https://youtube.com/…"
            defaultValue={user.socials?.youtube}
          />
          <TextField
            name="instagram"
            label="Instagram"
            hideLabel
            icon={CameraIcon}
            placeholder="https://instagram.com/…"
            defaultValue={user.socials?.instagram}
          />
          <TextField
            name="facebook"
            label="Facebook"
            hideLabel
            icon={BookOpenIcon}
            placeholder="https://facebook.com/…"
            defaultValue={user.socials?.facebook}
          />
          <TextField
            name="twitter"
            label="X"
            hideLabel
            icon={BirdIcon}
            placeholder="https://x.com/…"
            defaultValue={user.socials?.twitter}
          />
          <TextField
            name="github"
            label="GitHub"
            hideLabel
            icon={GitBranchIcon}
            placeholder="https://github.com/…"
            defaultValue={user.socials?.github}
          />
          <TextField
            name="website"
            label="Website"
            hideLabel
            icon={GlobeIcon}
            placeholder="https://…"
            defaultValue={user.socials?.website}
          />
        </div>
        <div className="mt-2">
          <Button type="submit" size="lg" loading={loading}>
            Update
          </Button>
        </div>
      </div>
    </form>
  )
}

export { EditProfileForm }
