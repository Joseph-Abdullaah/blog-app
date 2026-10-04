"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MailIcon } from "lucide-react"
import { toast } from "../ui/toast"


function VerifyEmailCard() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get("email")
  const from = params.get("from")
  const [cooldown, setCooldown] = useState(30)


  useEffect(() => {
    if (!email) {
      router.replace("/sign-in")
    }
  }, [email, router])

    useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    if (!email || cooldown > 0) return;
    const { error } = await authClient.sendVerificationEmail({
      email,
    });
    if (error) return toast.add({
      title: "Error sending verification email",
      description: error.message,
      type: "error",
    });
    setCooldown(60);
  }

  return (
    <Card className="w-full max-w-100 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col gap-4">
        <div className="grid size-14 place-items-center self-center rounded-full border border-hairline bg-surface-2 text-ink">
          <MailIcon className="size-6" aria-hidden />
        </div>
        <h1 className="text-center text-headline text-ink">Check your inbox</h1>

        {from === "sign-up" ? (
          <p className="text-center text-body leading-[1.6] text-ink-subtle">
            We sent a verification link to{" "}
            <b className="font-semibold break-all text-ink">{email}</b>. Click
            it to finish creating your account.
          </p>
        ) : (
          <p className="text-center text-body leading-[1.6] text-ink-subtle">
            Your email isn’t verified yet. We sent a new link to{" "}
            <b className="font-semibold break-all text-ink">{email}</b>. Click
            it to sign in.
          </p>
        )}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={cooldown > 0}
          onClick={resend}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </Button>
      
        <p className="text-center text-[13px] leading-normal text-ink-subtle">
          Didn’t get it? Check your spam folder. The link expires after a while,
          so use the newest email.
        </p>

        <div className="flex items-center gap-3 text-caption text-ink-subtle">
          <Separator className="flex-1 bg-hairline-strong" />
          or
          <Separator className="flex-1 bg-hairline-strong" />
        </div>

        <p className="text-center text-body-sm text-ink-subtle">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-body-sm"
            render={<Link href="/sign-up" />}
            nativeButton={false}
          >
            Use a different email
          </Button>
          {" · "}
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

export { VerifyEmailCard }
