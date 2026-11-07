"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { TextareaField, TextField, UserAvatar } from "@/components/byline"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  profileFormSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@/lib/validations/profile"
import type { Me, Socials } from "@/types/dto"

const SOCIALS: { key: keyof Socials; label: string; icon: LucideIcon; placeholder: string }[] = [
  { key: "youtube", label: "YouTube", icon: PlayIcon, placeholder: "https://youtube.com/…" },
  { key: "instagram", label: "Instagram", icon: CameraIcon, placeholder: "https://instagram.com/…" },
  { key: "facebook", label: "Facebook", icon: BookOpenIcon, placeholder: "https://facebook.com/…" },
  { key: "twitter", label: "X", icon: BirdIcon, placeholder: "https://x.com/…" },
  { key: "github", label: "GitHub", icon: GitBranchIcon, placeholder: "https://github.com/…" },
  { key: "website", label: "Website", icon: GlobeIcon, placeholder: "https://…" },
]

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const AVATAR_SIZE = 400

/** Center-crop to a square and scale to 400×400 WebP (FR-PROF-04). */
async function squareAvatar(file: File) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE
    )
  bitmap.close()
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error())), "image/webp", 0.9)
  )
}

type Availability =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; message: string }

/** Edit Profile (S-14, FR-PROF-01…04). */
function EditProfileForm({ me }: { me: Me }) {
  const router = useRouter()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [image, setImage] = React.useState(me.image)
  const [uploading, setUploading] = React.useState(false)
  const [availability, setAvailability] = React.useState<Availability>({ state: "idle" })

  const defaults: ProfileFormInput = {
    name: me.name,
    username: me.username,
    bio: me.bio ?? "",
    socials: {
      youtube: me.socials.youtube ?? "",
      instagram: me.socials.instagram ?? "",
      facebook: me.socials.facebook ?? "",
      twitter: me.socials.twitter ?? "",
      github: me.socials.github ?? "",
      website: me.socials.website ?? "",
    },
  }

  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaults,
  })
  const username = useWatch({ control: form.control, name: "username" })

  // Debounced availability check (FR-PROF-03).
  React.useEffect(() => {
    const value = username.trim().toLowerCase()
    if (!value || value === me.username) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setAvailability({ state: "checking" })
      try {
        const res = await fetch(
          `/api/users/username-available?username=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        )
        const body = (await res.json()) as {
          data?: { available: boolean; message: string | null }
        }
        if (!body.data) return setAvailability({ state: "idle" })
        setAvailability(
          body.data.available
            ? { state: "available" }
            : { state: "unavailable", message: body.data.message ?? "That username can't be used" }
        )
      } catch {
        // Aborted or offline: the server checks again on save.
      }
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [username, me.username])

  const usernameUnchanged = username.trim().toLowerCase() === me.username
  const usernameHelp = usernameUnchanged
    ? "Username is used to find you and appears on your profile"
    : availability.state === "checking"
      ? "Checking…"
      : availability.state === "available"
        ? "Username is available"
        : "Username is used to find you and appears on your profile"

  async function chooseAvatar(file: File | undefined) {
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.add({ title: "Use a JPG, PNG or WebP image", type: "error" })
      return
    }
    setUploading(true)
    try {
      const cropped = await squareAvatar(file)
      if (cropped.size > 2 * 1024 * 1024) throw new Error("Image must be 2 MB or smaller")
      const data = new FormData()
      data.append("file", cropped, "avatar.webp")
      data.append("purpose", "avatar")
      const res = await fetch("/api/uploads", { method: "POST", body: data })
      const body = (await res.json()) as { data?: { url: string }; error?: { message: string } }
      if (!res.ok || !body.data) throw new Error(body.error?.message ?? "Upload failed")
      setImage(body.data.url)
    } catch (error) {
      toast.add({
        title: "Couldn't upload your photo",
        description: (error as Error).message,
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  async function submit(values: ProfileFormValues) {
    if (availability.state === "unavailable" && !usernameUnchanged) {
      form.setError("username", { message: availability.message })
      return
    }

    // Send only what changed.
    const changes: Record<string, unknown> = {}
    if (values.name !== me.name) changes.name = values.name
    if (values.username !== me.username) changes.username = values.username
    if ((values.bio || null) !== me.bio) changes.bio = values.bio
    if (image !== me.image) changes.image = image
    const socials = Object.fromEntries(
      SOCIALS.map(({ key }) => [key, values.socials[key]]).filter(
        ([key, value]) => value !== me.socials[key as keyof Socials]
      )
    )
    if (Object.keys(socials).length) changes.socials = socials

    if (!Object.keys(changes).length) {
      toast.add({ title: "No changes to save", type: "info" })
      return
    }

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    })
    const body = (await res.json().catch(() => ({}))) as {
      data?: Me
      error?: { message: string; fields?: Record<string, string> }
    }
    if (!res.ok || !body.data) {
      if (res.status === 409) {
        form.setError("username", { message: body.error?.message ?? "That username is taken" })
      } else if (body.error?.fields) {
        for (const [key, message] of Object.entries(body.error.fields)) {
          if (key === "name" || key === "username" || key === "bio") form.setError(key, { message })
        }
      } else {
        toast.add({ title: "Couldn't update your profile", description: body.error?.message, type: "error" })
      }
      return
    }
    toast.add({ title: "Profile updated", type: "success" })
    form.reset({ ...values, bio: values.bio ?? "" } as ProfileFormInput)
    router.refresh()
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12"
      onSubmit={form.handleSubmit(submit)}
    >
      <div className="flex flex-col items-center gap-4 md:w-40 md:shrink-0">
        <UserAvatar name={me.name} src={image} size="3xl" />
        <Button
          type="button"
          variant="secondary"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon aria-hidden />
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void chooseAvatar(e.target.files?.[0])
            e.target.value = ""
          }}
        />
      </div>

      <div className="flex max-w-160 min-w-0 flex-1 flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                icon={UserIcon}
                autoComplete="name"
                error={fieldState.error?.message}
              />
            )}
          />
          <TextField
            name="email"
            label="Email"
            icon={MailIcon}
            defaultValue={me.email}
            readOnly
          />
        </div>

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Username"
              icon={AtSignIcon}
              autoComplete="username"
              help={usernameHelp}
              helpTone={!usernameUnchanged && availability.state === "available" ? "success" : "default"}
              error={
                fieldState.error?.message ??
                (!usernameUnchanged && availability.state === "unavailable"
                  ? availability.message
                  : undefined)
              }
            />
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField
              {...field}
              label="Bio"
              maxLength={200}
              error={fieldState.error?.message}
            />
          )}
        />

        <h2 className="mt-2 text-title-sm text-ink">Social links</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <Controller
              key={s.key}
              name={`socials.${s.key}`}
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  label={s.label}
                  hideLabel
                  icon={s.icon}
                  placeholder={s.placeholder}
                  inputMode="url"
                  error={fieldState.error?.message}
                />
              )}
            />
          ))}
        </div>

        <div className="mt-2">
          <Button type="submit" size="lg" loading={form.formState.isSubmitting} disabled={uploading}>
            Update
          </Button>
        </div>
      </div>
    </form>
  )
}

export { EditProfileForm }
