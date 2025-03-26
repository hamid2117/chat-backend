import { Transaction } from 'sequelize'
import { Server as SocketIOServer } from 'socket.io'
import Message from './message.model'
import Attachment from './attachment.model'
import User from '../user/user.model'
import { getSocket } from '../../utils/socket'
import { getPublicUrl } from '../../utils'
import { Request } from 'express'
import { CreateMessageInput } from './message.schema'

// Types
type ContentType = 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO' | 'CODE'

interface CreateMessageDTO {
  conversationId: string
  senderId: string
  contentType: ContentType
  textContent?: string
  attachments?: Array<{
    fileUrl: string
    fileName: string
    fileType: string
    fileSize: number
  }>
}

interface UpdateMessageDTO {
  textContent?: string
  isDeleted?: boolean
}

interface MessageWithDetails {
  id: string
  conversationId: string
  senderId: string
  contentType: ContentType
  textContent?: string
  sentAt: Date
  isEdited: boolean
  isDeleted: boolean
  sender?: any
  attachments?: any[]
  createdAt: Date
  updatedAt: Date
}

const io = (): SocketIOServer => getSocket()

/**
 * Create a new message with optional attachments
 */
export const createMessage = async (
  messageData: CreateMessageDTO,
  req: Request<{}, {}, CreateMessageInput>,
  transaction?: Transaction
): Promise<MessageWithDetails> => {
  const t = transaction || (await Message.sequelize!.transaction())
  let isCommitTransaction: boolean = false
  try {
    // Create the message
    const message = await Message.create(
      {
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        contentType: messageData.contentType,
        textContent: messageData.textContent,
      },
      { transaction: t }
    )

    // Create attachments if provided
    if (messageData.attachments && messageData.attachments.length > 0) {
      await Promise.all(
        messageData.attachments.map((attachment) =>
          Attachment.create(
            {
              messageId: message.id,
              ...attachment,
            },
            { transaction: t }
          )
        )
      )
    }

    if (!transaction) {
      await t.commit()
      isCommitTransaction = true
    }

    const messageWithDetails = await getMessageById(message.id)

    const responseData = {
      ...messageWithDetails,
      attachments: messageWithDetails.attachments?.map((attachment) => ({
        ...attachment,
        fileUrl: getPublicUrl(attachment.fileUrl, req),
      })),
    }

    io()
      .to(`conversation:${messageData.conversationId}`)
      .emit('new_message', responseData)

    return responseData
  } catch (error) {
    if (!transaction && !isCommitTransaction) await t.rollback()
    throw error
  }
}

export const getMessageById = async (
  messageId: string
): Promise<MessageWithDetails> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'displayName', 'email', 'profilePicture'],
      },
      {
        model: Attachment,
        as: 'attachments',
      },
    ],
  })

  if (!message) {
    throw new Error('Message not found')
  }

  return message.toJSON() as MessageWithDetails
}

export const getMessagesByConversation = async (
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: MessageWithDetails[]; count: number }> => {
  const { rows, count } = await Message.findAndCountAll({
    where: { conversationId, isDeleted: false },
    limit,
    offset,
    order: [['sentAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'displayName', 'email', 'profilePicture'],
      },
      {
        model: Attachment,
        as: 'attachments',
      },
    ],
  })

  return {
    messages: rows
      .map((message) => message.toJSON() as MessageWithDetails)
      .map((message) => ({
        ...message,
        attachments: message.attachments?.map((attachment) => ({
          ...attachment,
          fileUrl: getPublicUrl(attachment.fileUrl),
        })),
      }))
      .reverse(),
    count,
  }
}

export const updateMessage = async (
  messageId: string,
  senderId: string,
  updateData: UpdateMessageDTO
): Promise<MessageWithDetails> => {
  const message = await Message.findByPk(messageId)

  if (!message) {
    throw new Error('Message not found')
  }

  if (message.senderId !== senderId) {
    throw new Error('Unauthorized: You can only edit your own messages')
  }

  const updates: any = {}

  if (updateData.textContent !== undefined) {
    updates.textContent = updateData.textContent
    updates.isEdited = true
    updates.editedAt = new Date()
  }

  if (updateData.isDeleted !== undefined) {
    updates.isDeleted = updateData.isDeleted
    if (updateData.isDeleted) {
      updates.deletedAt = new Date()
    }
  }

  await message.update(updates)

  const updatedMessage = await getMessageById(messageId)

  // Emit socket event
  io()
    .to(`conversation:${message.conversationId}`)
    .emit(
      updateData.isDeleted ? 'message_deleted' : 'message_updated',
      updatedMessage
    )

  return updatedMessage
}

/**
 * Soft delete a message
 */
export const deleteMessage = async (
  messageId: string,
  senderId: string
): Promise<void> => {
  await updateMessage(messageId, senderId, { isDeleted: true })
}

/**
 * Get attachments for a message
 */
export const getMessageAttachments = async (
  messageId: string
): Promise<any[]> => {
  const attachments = await Attachment.findAll({
    where: { messageId },
  })

  return attachments.map((attachment) => attachment.toJSON())
}

/**
 * Mark a user as typing in a conversation
 */
export const notifyTyping = (
  userId: string,
  conversationId: string,
  isTyping: boolean
): void => {
  io().to(`conversation:${conversationId}`).emit('typing_status', {
    userId,
    conversationId,
    isTyping,
  })
}

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
  messageIds: string[]
): Promise<void> => {
  io().to(`conversation:${conversationId}`).emit('messages_read', {
    conversationId,
    userId,
    messageIds,
  })
}
