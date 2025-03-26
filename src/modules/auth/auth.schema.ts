import { z } from 'zod'

export const registerSchema = z.object({
  userName: z.string().min(2, 'userName must be at least 2 characters').max(50),
  displayName: z
    .string()
    .min(2, 'displayName must be at least 2 characters')
    .max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  verificationToken: z.string().min(1, 'Verification token is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterSchema = z.infer<typeof registerSchema>
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
