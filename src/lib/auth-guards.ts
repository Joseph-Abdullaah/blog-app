import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { cache } from "react"


export const getSession = cache(async () => {
    return await auth.api.getSession({headers: await headers()})
})
