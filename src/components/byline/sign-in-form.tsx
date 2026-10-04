"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { signInSchema, type SignInValues } from "@/lib/validations/auth"
import { Logo } from "./logo"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  async function handleGoogleSignIn() {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home"
    })
    if (error) {
      toast.add({
        title: "Error signing in with Google",
        description: error.message,
        type: "error",
      })
    }
  }

  async function onSubmit(values: SignInValues) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      
    }, {
    onError: (ctx) => {
        if (ctx.error.status === 403) {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}&from=sign-in`)
        }
      },
    onSuccess: () => router.push("/home"),
    },
    
  )

    if (error) {
      toast.add({
        title: "Error signing in",
        type: "error",
        description: error.message,
      })
    } else {
      toast.add({
        title: "Signed in successfully",
        type: "success",
      })
    }
  }

  return (
    <Card className="w-full max-w-100 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col gap-4">
        <Logo wordmark={false} size={40} className="self-center" />
        <h1 className="text-center text-headline text-ink">Welcome back</h1>

        <form
          id="sign-in-form"
          noValidate
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-in-email" className="sr-only">
                    Email
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <MailIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="sign-in-email"
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
                  <FieldLabel htmlFor="sign-in-password" className="sr-only">
                    Password
                  </FieldLabel>
                  <InputGroup className="bg-canvas">
                    <InputGroupAddon>
                      <LockIcon aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="sign-in-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="current-password"
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
          <div className="-mt-1.5 text-right">
            <Button
              variant="link"
              className="h-auto p-0 text-body-sm"
              render={<Link href="/forgot-password" />}
              nativeButton={false}
            >
              Forgot password?
            </Button>
          </div>
          <Button
            type="submit"
            size="lg"
            loading={form.formState.isSubmitting}
            className="w-full"
          >
            Sign in
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
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>

        <p className="text-center text-body-sm text-ink-subtle">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href="/sign-up" />}
            nativeButton={false}
          >
            Sign up
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}

export { SignInForm }
