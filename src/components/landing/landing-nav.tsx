"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/byline"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const links = [
  { href: "#stories", label: "Stories" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
]

/** Landing nav: inline links from md, a sheet menu below. */
function LandingNav() {
  return (
    <header className="border-b border-hairline">
      <nav
        aria-label="Main"
        className="mx-auto flex h-navbar max-w-wide items-center gap-4 px-4 sm:px-6 md:gap-8 lg:px-8"
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              render={<a href={l.href} />}
              nativeButton={false}
            >
              {l.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            Sign in
          </Button>
          <Button render={<Link href="/sign-up" />} nativeButton={false}>
            Get started
          </Button>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="md:hidden"
                />
              }
            >
              <MenuIcon aria-hidden />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <SheetClose
                    key={l.href}
                    nativeButton={false}
                    render={
                      <Button
                        variant="ghost"
                        className="justify-start"
                        render={<a href={l.href} />}
                        nativeButton={false}
                      />
                    }
                  >
                    {l.label}
                  </SheetClose>
                ))}
                <SheetClose
                  nativeButton={false}
                  render={
                    <Button
                      variant="ghost"
                      className="justify-start sm:hidden"
                      render={<Link href="/sign-in" />}
                      nativeButton={false}
                    />
                  }
                >
                  Sign in
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export { LandingNav }
