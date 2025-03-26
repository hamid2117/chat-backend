import { z } from 'zod'

// Constants for validation
const CONTENT_TYPES = [
  'TEXT',
  'IMAGE',
  'FILE',
  'VOICE',
  'VIDEO',
  'CODE',
] as const
const MAX_TEXT_LENGTH = 10000

export const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  contentType: z.enum(CONTENT_TYPES).default('TEXT'),
  textContent: z.string().max(MAX_TEXT_LENGTH).nullish(),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

export const updateMessageSchema = z.object({
  textContent: z.string().max(MAX_TEXT_LENGTH).optional(),
})

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>

export const paginationSchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(100).default(50))
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(0).default(0))
    .optional(),
})

export type PaginationParams = z.infer<typeof paginationSchema>

export const messageIdParamSchema = z.object({
  messageId: z.string().uuid(),
})

export type MessageIdParam = z.infer<typeof messageIdParamSchema>

export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid(),
})

export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>

export const typingStatusSchema = z.object({
  isTyping: z.boolean(),
})

export type TypingStatusInput = z.infer<typeof typingStatusSchema>

export const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
