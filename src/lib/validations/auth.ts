import * as z from "zod"


const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
])

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Use only letters, numbers, dots, and underscores")
  .transform((value) => value.toLowerCase())
  .refine((value) => !RESERVED_USERNAMES.has(value), {
    message: "That username is reserved",
  })
  
const email = z.string().min(1, "This field is required").email("Enter a valid email address")

const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters")

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
})

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your full name")
    .max(50, "Use at most 50 characters"),
  email,
  password: newPassword,
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
