"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth"
import { Logo } from "./logo"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "../ui/toast"

function ForgotPasswordForm() {
  const [sent, setSent] = useState<boolean>(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })


  async function onSubmit(values: ForgotPasswordValues) {
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    })

    if (error) {
      toast.add({
        title: "Error",
        description: error.message,
        type: "error",
      })
      return
      
    } else {
      toast.add({
        title: "Success",
        description: "If an account exists for that email, a reset link is on its way.",
        type: "success",
      })
    }

    setSent(true)
  }

  return (
    <Card className="w-full max-w-100 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col gap-4">
        <Logo wordmark={false} size={40} className="self-center" />
        <h1 className="text-center text-headline text-ink">
          {sent ? "Check your email" : "Forgot your password?"}
        </h1>
        <p className="text-center text-body text-ink-subtle">
          {sent
            ? "If an account exists for that email, a reset link is on its way."
            : "Enter the email you signed up with and we will send a link to choose a new one."}
        </p>

        {sent ? null : (
          <form
            id="forgot-password-form"
            noValidate
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="forgot-password-email" className="sr-only">
                    Email
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <MailIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="forgot-password-email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Button
              type="submit"
              size="lg"
              loading={form.formState.isSubmitting}
              className="w-full"
            >
              Send reset link
            </Button>
          </form>
        )}

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

export { ForgotPasswordForm }
