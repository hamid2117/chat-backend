import { z } from 'zod'

export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
})

export const createDirectConversationSchema = z.object({
  userId: z.string().uuid(),
})
export type CreateDirectConversationRequest = z.infer<
  typeof createDirectConversationSchema
>

// Create group conversation schema
export const createGroupConversationSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
  description: z.string().optional(),
  participants: z
    .array(z.string().uuid())
    .min(1, 'Group must have at least one participant'),
})
export type CreateGroupConversationRequest = z.infer<
  typeof createGroupConversationSchema
>

// Update group details schema
export const updateGroupDetailsSchema = z.object({
  groupName: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .optional(),
  description: z.string().optional(),
  groupPicture: z.string().url().optional(),
})
export type UpdateGroupDetailsRequest = z.infer<typeof updateGroupDetailsSchema>

export const addParticipantSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
})
export type AddParticipantRequest = z.infer<typeof addParticipantSchema>

export const updateParticipantRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
})
export type UpdateParticipantRoleRequest = z.infer<
  typeof updateParticipantRoleSchema
>

export const conversationIdSchema = z.object({
  id: z.string().uuid(),
})
export type ConversationIdParam = z.infer<typeof conversationIdSchema>

export const participantIdSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
})
export type ParticipantIdParam = z.infer<typeof participantIdSchema>

export const getConversationsQuerySchema = z.object({
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional()
    .default('10'),
  offset: z
    .string()
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional()
    .default('0'),
  search: z.string().optional(),
  type: z.enum(['DIRECT', 'GROUP']).optional(),
})
export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>
