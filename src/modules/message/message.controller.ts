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
} from './message.schema'

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createMessageSchema.parse(req.body)
    const senderId = req.user.id

    const messageData = {
      ...validatedData,
      senderId,
      textContent:
        validatedData.textContent === null
          ? undefined
          : validatedData.textContent,
    }

    const message = await messageService.createMessage(messageData)

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    })
  } catch (error) {
    next(error)
  }
}

export const getConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params and query
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { limit = 50, offset = 0 } = paginationSchema.parse(req.query)

    const { messages, count } = await messageService.getMessagesByConversation(
      conversationId,
      limit,
      offset
    )

    return res.status(200).json({
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params
    const { messageId } = messageIdParamSchema.parse(req.params)
    const message = await messageService.getMessageById(messageId)

    return res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: message,
    })
  } catch (error) {
    next(error)
  }
}

export const updateMessageContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params and body
    const { messageId } = messageIdParamSchema.parse(req.params)
    const updateData = updateMessageSchema.parse(req.body)
    const senderId = req.user.id

    // Handle null to undefined conversion if needed for this operation too
    const messageUpdateData = {
      ...updateData,
      textContent:
        updateData.textContent === null ? undefined : updateData.textContent,
    }

    const updatedMessage = await messageService.updateMessage(
      messageId,
      senderId,
      messageUpdateData
    )

    return res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteMessageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params
    const { messageId } = messageIdParamSchema.parse(req.params)
    const senderId = req.user.id

    await messageService.deleteMessage(messageId, senderId)

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getMessageAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params
    const { messageId } = messageIdParamSchema.parse(req.params)
    const attachments = await messageService.getMessageAttachments(messageId)

    return res.status(200).json({
      success: true,
      message: 'Attachments retrieved successfully',
      data: attachments,
    })
  } catch (error) {
    next(error)
  }
}

export const notifyTypingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params and body
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { isTyping } = typingStatusSchema.parse(req.body)
    const userId = req.user.id

    messageService.notifyTyping(userId, conversationId, isTyping)

    return res.status(200).json({
      success: true,
      message: 'Typing status updated',
    })
  } catch (error) {
    next(error)
  }
}

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate params and body
    const { conversationId } = conversationIdParamSchema.parse(req.params)
    const { messageIds } = markAsReadSchema.parse(req.body)
    const userId = req.user.id

    await messageService.markMessagesAsRead(conversationId, userId, messageIds)

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (error) {
    next(error)
  }
}
