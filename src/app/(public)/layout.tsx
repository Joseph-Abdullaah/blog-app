import { Metadata } from "next"

import { Navbar } from "@/components/byline"
import { getUser } from "@/lib/auth-guards"


export const metadata: Metadata = {
    title: "Blogs",
    description: "A reading-first blogging platform.",
}

export default async function BlogsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const sessionUser = await getUser()
  const user = sessionUser && sessionUser.username ? {
    name: sessionUser.name,
    username: sessionUser.username,
    image: sessionUser.image,
  } : null

    return (
        <div className="min-h-svh bg-canvas">
            <Navbar user={user} unread />
            {children}
        </div>
    )
}