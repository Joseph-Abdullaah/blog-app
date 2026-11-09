"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { TextField } from "@/components/byline"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Use at most 128 characters"),
})

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

/**
 * Change Password (S-15, FR-PROF-05): requires the current password and signs
 * out other sessions. Google-only accounts get a link to set one instead.
 */
function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  if (!hasPassword) {
    return (
      <Alert className="max-w-115">
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>Your account uses Google sign-in, so it has no password yet.</span>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href="/forgot-password" />}
            nativeButton={false}
          >
            Set password
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  async function submit(values: ChangePasswordValues) {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    })
    if (error) {
      if (error.code === "INVALID_PASSWORD") {
        form.setError("currentPassword", { message: "Current password is incorrect" })
      } else {
        toast.add({
          title: "Couldn't change your password",
          description: error.message,
          type: "error",
        })
      }
      return
    }
    form.reset()
    toast.add({
      title: "Password changed",
      description: "You were signed out on your other devices.",
      type: "success",
    })
  }

  return (
    <form noValidate className="flex max-w-115 flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
      <Controller
        name="currentPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="password"
            label="Current password"
            icon={LockIcon}
            placeholder="Current password"
            autoComplete="current-password"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="newPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="password"
            label="New password"
            icon={LockIcon}
            placeholder="New password"
            autoComplete="new-password"
            help="At least 8 characters"
            error={fieldState.error?.message}
          />
        )}
      />
      <div>
        <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
          Change Password
        </Button>
      </div>
    </form>
  )
}

export { ChangePasswordForm }
