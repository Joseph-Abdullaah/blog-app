"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/auth"
import { Logo } from "./logo"
import { authClient } from "@/lib/auth-client"
import { toast } from "../ui/toast"

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })


  async function onSubmit(values: ResetPasswordValues) {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      throw new Error("Missing token")
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token
    })

    if (error) {
      toast.add({
        title: "Error resetting password",
        description: error.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Success",
        description: "Your password has been reset. You can now sign in with your new password.",
        type: "success",
      })
    }
    
  }
  return (
    <Card className="w-full max-w-100 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col gap-4">
        <Logo wordmark={false} size={40} className="self-center" />
        <h1 className="text-center text-headline text-ink">
          Choose a new password
        </h1>

        <form
          id="reset-password-form"
          noValidate
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password" className="sr-only">
                    New password
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <LockIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>At least 8 characters</FieldDescription>
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password-confirm" className="sr-only">
                    Confirm new password
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <LockIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="reset-password-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        aria-pressed={showConfirm}
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        {showConfirm ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <Button
            type="submit"
            size="lg"
            loading={form.formState.isSubmitting}
            className="w-full"
          >
            Reset password
          </Button>
        </form>

        <p className="text-center text-body-sm text-ink-subtle">
          <Button
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            Back to sign in
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}

export { ResetPasswordForm }
