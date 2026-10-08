import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { cache } from "react"


export const getSession = cache(async () => {
    return await auth.api.getSession({headers: await headers()})
})

export async function requireUser(next?: string) {
    const session = await getSession()
    if (!session) {
        redirect(next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in");
    }
    return session.user
}

export async function getUser(){
    const session = await getSession()
    return session?.user
}