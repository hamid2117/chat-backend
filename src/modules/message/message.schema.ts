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
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB max
const MAX_ATTACHMENTS = 10

const attachmentSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().max(255),
  fileType: z.string().max(100),
  fileSize: z.number().max(MAX_FILE_SIZE),
})

export const createMessageSchema = z
  .object({
    conversationId: z.string().uuid(),
    contentType: z.enum(CONTENT_TYPES).default('TEXT'),
    textContent: z.string().max(MAX_TEXT_LENGTH).nullish(),
    attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS).optional(),
  })
  .refine(
    (data) => {
      if (data.contentType === 'TEXT' && !data.textContent) {
        return false
      }

      // File-based messages must have attachments
      if (
        ['IMAGE', 'FILE', 'VOICE', 'VIDEO'].includes(data.contentType) &&
        (!data.attachments || data.attachments.length === 0)
      ) {
        return false
      }

      return true
    },
    {
      message:
        'Invalid message data: Text messages require text content, and file-based messages require attachments',
    }
  )

export const updateMessageSchema = z.object({
  textContent: z.string().max(MAX_TEXT_LENGTH).optional(),
})

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

export const messageIdParamSchema = z.object({
  messageId: z.string().uuid(),
})

export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid(),
})

export const typingStatusSchema = z.object({
  isTyping: z.boolean(),
})

export const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
})
