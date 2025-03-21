import { Request, Response, NextFunction } from 'express'
import * as messageService from './message.service'
import {
  createMessageSchema,
  updateMessageSchema,
  conversationIdParamSchema,
  messageIdParamSchema,
  paginationSchema,
  typingStatusSchema,
  markAsReadSchema,
  // Import the types
  CreateMessageInput,
  UpdateMessageInput,
  PaginationParams,
  MessageIdParam,
  ConversationIdParam,
  TypingStatusInput,
  MarkAsReadInput,
} from './message.schema'
import {
  successResponse,
  handleFileUpload,
  getPublicUrl,
  deleteFile,
} from '../../utils'

export const createMessage = async (
  req: Request<{}, {}, CreateMessageInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contentType = req.headers['content-type'] || ''
    const hasAttachments = contentType.includes('multipart/form-data')

    const validatedData = createMessageSchema.parse(req.body)
    const senderId = req.user.id

    let uploadedAttachments: Array<{
      fileUrl: string
      fileName: string
      fileType: string
      fileSize: number
    }> = []

    if (hasAttachments) {
      if (validatedData.contentType === 'IMAGE') {
        const filePath = await handleFileUpload(req, {
          directory: 'messages/images',
          fieldName: 'image',
          fileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maxSize: 10 * 1024 * 1024, // 10MB
        })

        if (filePath && req.file) {
          uploadedAttachments.push({
            fileUrl: filePath,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
          })
        }
      } else if (validatedData.contentType === 'FILE') {
        const filePath = await handleFileUpload(req, {
          directory: 'messages/files',
          fieldName: 'file',
          maxSize: 50 * 1024 * 1024, // 50MB
        })

        if (filePath && req.file) {
          uploadedAttachments.push({
            fileUrl: filePath,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
          })
        }
      } else if (
        validatedData.contentType === 'TEXT' &&
        req.files &&
        Array.isArray(req.files)
      ) {
        for (const file of req.files) {
          // need to handle this by multer to support multiple files
          uploadedAttachments.push({
            fileUrl: file.path,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
          })
        }
      }
    }

    const messageData = {
      ...validatedData,
      senderId,
      textContent:
        validatedData.textContent === null
          ? undefined
          : validatedData.textContent,
      attachments:
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    }

    const message = await messageService.createMessage(messageData)

    const responseData = {
      ...message,
      attachments: message.attachments?.map((attachment) => ({
        ...attachment,
        fileUrl: getPublicUrl(req, attachment.fileUrl),
      })),
    }

    res
      .status(201)
      .json(successResponse(responseData, 'Message sent successfully'))
  } catch (error) {
    next(error)
  }
}

export const getConversationMessages = async (
  req: Request<ConversationIdParam, {}, {}, PaginationParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { limit = 50, offset = 0 } = paginationSchema.parse(req.query)

    const { messages, count } = await messageService.getMessagesByConversation(
      conversationId,
      limit,
      offset
    )

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          total: count,
          limit,
          offset,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getMessage = async (
  req: Request<MessageIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = messageIdParamSchema.parse(req.params)
    const message = await messageService.getMessageById(messageId)

    res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: message,
    })
  } catch (error) {
    next(error)
  }
}

export const updateMessageContent = async (
  req: Request<MessageIdParam, {}, UpdateMessageInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = messageIdParamSchema.parse(req.params)
    const updateData = updateMessageSchema.parse(req.body)
    const senderId = req.user.id

    const updatedMessage = await messageService.updateMessage(
      messageId,
      senderId,
      updateData
    )

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteMessageHandler = async (
  req: Request<MessageIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = messageIdParamSchema.parse(req.params)
    const senderId = req.user.id

    await messageService.deleteMessage(messageId, senderId)

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getMessageAttachments = async (
  req: Request<MessageIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = messageIdParamSchema.parse(req.params)
    const attachments = await messageService.getMessageAttachments(messageId)

    res.status(200).json({
      success: true,
      message: 'Attachments retrieved successfully',
      data: attachments,
    })
  } catch (error) {
    next(error)
  }
}

export const notifyTypingStatus = async (
  req: Request<ConversationIdParam, {}, TypingStatusInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { isTyping } = typingStatusSchema.parse(req.body)
    const userId = req.user.id

    messageService.notifyTyping(userId, conversationId, isTyping)

    res.status(200).json({
      success: true,
      message: 'Typing status updated',
    })
  } catch (error) {
    next(error)
  }
}

export const markAsRead = async (
  req: Request<ConversationIdParam, {}, MarkAsReadInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { messageIds } = markAsReadSchema.parse(req.body)
    const userId = req.user.id

    await messageService.markMessagesAsRead(conversationId, userId, messageIds)

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (error) {
    next(error)
  }
}
