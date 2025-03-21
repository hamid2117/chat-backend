import { z } from 'zod'

export const userIdSchema = z.object({
  id: z.string().uuid(),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  profilePicture: z.string().optional(),
})

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(50, 'New password must be less than 50 characters'),
})

export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => Number(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Number(val) || 10)
    .optional(),
  sortBy: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
})

// Export TypeScript types derived from Zod schemas
export type UserIdParams = z.infer<typeof userIdSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>
