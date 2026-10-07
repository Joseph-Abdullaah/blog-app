import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { Resend } from "resend"
import ResetPasswordEmail from "@/components/email/reset-password-email"
import VerifyEmail from "@/components/email/verify-email"
import { generateUniqueUsername } from "@/lib/username";

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            void resend.emails.send({
                from: "Byline <onboarding@resend.dev>",
                to: user.email,
                subject: "Verify your email address",
                react: VerifyEmail({ verificationUrl: url }),
            })
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            void resend.emails.send({
                from: "Byline <onboarding@resend.dev>",
                to: user.email,
                subject: "Reset your Byline password",
                react: ResetPasswordEmail({ resetUrl: url }),
            })
        }
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => ({
                    data: { ...user, username: await generateUniqueUsername(user.email) },
                }),
            },
        },
    },
    plugins: [username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (username) => {
            const reservedUsernames = [
                "admin",
                "administrator",
                "support",
            ]
            return (/^[a-zA-Z0-9_.]+$/.test(username) && !reservedUsernames.includes(username))
        },
        displayUsernameValidator: (displayUsername) => {
            return /^[a-zA-Z0-9_-]+$/.test(displayUsername)
        },
        usernameNormalization: (username) => username.toLowerCase(),
        displayUsernameNormalization: (displayUsername) => displayUsername.toLowerCase(),
        
        
    }), nextCookies() ]

})