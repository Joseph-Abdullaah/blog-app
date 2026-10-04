"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth"
import { Logo } from "./logo"
import { authClient } from "@/lib/auth-client"
import { toast } from "../ui/toast"


function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

 async function handleGoogleSignUp() {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home"
    })
    if (error) {
      toast.add({
        title: "Error signing up with Google",
        description: error.message,
        type: "error",
      })
    } else {
      toast.add({
        title: "Check your email",
        description: "A sign-in link has been sent to your email address.",
        type: "success"
      })
    }
 }

  async function onSubmit(values: SignUpValues) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    },
    {
      onSuccess: () => {
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}&from=sign-up`);
      }
    }
  )

    if (error) {
      toast.add({
        title: "Error signing up",
        type: "error",
        description: error.message,
      })
      return
    }

  }

  return (
    <Card className="w-full max-w-100 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col gap-4">
        <Logo wordmark={false} size={40} className="self-center" />
        <h1 className="text-center text-headline text-ink">Join Byline</h1>

        <form
          id="sign-up-form"
          noValidate
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-name" className="sr-only">
                    Full name
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <UserIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="sign-up-name"
                      placeholder="Full name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-email" className="sr-only">
                    Email
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <MailIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="sign-up-email"
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

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-password" className="sr-only">
                    Password
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <LockIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="sign-up-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
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
            Create account
          </Button>
        </form>

        <div className="flex items-center gap-3 text-caption text-ink-subtle">
          <Separator className="flex-1 bg-hairline-strong" />
          or
          <Separator className="flex-1 bg-hairline-strong" />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogleSignUp}
        >
          Continue with Google
        </Button>

        <p className="text-center text-body-sm text-ink-subtle">
          Already have an account?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            Sign in
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}

export { SignUpForm }
