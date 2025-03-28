import CustomError from '../../../errors'
import db from '../../../models'
import { Op } from 'sequelize'
import {
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  UpdateGroupDetailsRequest,
  AddParticipantRequest,
  UpdateParticipantRoleRequest,
  GetConversationsQuery,
} from './conversation.schema'
import { getPublicUrl } from '../../utils'
import { getSocket } from '../../utils/socket'
import { Server as SocketIOServer } from 'socket.io'

const { User, Conversation, Participant, GroupDetail, Message } = db
const io = (): SocketIOServer => getSocket()

export const getConversations = async (
  userId: string,
  query: GetConversationsQuery
) => {
  const { limit, offset, search: _serach, type } = query

  const participations = await Participant.findAll({
    where: {
      userId,
      isRemoved: false,
    },
    attributes: ['conversationId'],
  })

  const conversationIds = participations.map((p) => p.conversationId)

  if (conversationIds.length === 0) {
    return { rows: [], count: 0 }
  }

  const whereClause: any = {
    id: { [Op.in]: conversationIds },
  }

  if (type) {
    whereClause.type = type
  }

  const { rows, count } = await Conversation.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: Participant,
        as: 'participants',
        where: {
          isRemoved: false,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'displayName', 'profilePicture', 'email'],
          },
        ],
      },
      {
        model: GroupDetail,
        as: 'groupDetail',
        required: false,
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'displayName'],
      },
      {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['sentAt', 'DESC']],
        required: false,
        where: {
          isDeleted: false,
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'displayName'],
          },
        ],
      },
    ],
    order: [['updatedAt', 'DESC']],
  })

  const userParticipations = await Participant.findAll({
    where: {
      userId,
      isRemoved: false,
      conversationId: { [Op.in]: conversationIds },
    },
  })

  // Create a map of conversationId -> lastSeenAt for quick lookup
  const lastSeenMap = userParticipations.reduce((acc, p) => {
    acc[p.conversationId] = p.lastSeenAt || new Date(0)
    return acc
  }, {} as Record<string, Date>)

  const unreadCountPromises = conversationIds.map(async (conversationId) => {
    const lastSeen = lastSeenMap[conversationId] || new Date(0)

    const count = await Message.count({
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        sentAt: { [Op.gt]: lastSeen },
        isDeleted: false,
      },
    })

    return { conversationId, count }
  })

  const unreadCounts = await Promise.all(unreadCountPromises)
  const unreadCountMap = unreadCounts.reduce(
    (acc, { conversationId, count }) => {
      acc[conversationId] = count
      return acc
    },
    {} as Record<string, number>
  )

  const formattedRows = rows.map((conversation) => {
    let otherUser: any = null
    if (conversation.type === 'DIRECT') {
      otherUser = conversation.participants.find(
        (p) => p.userId !== userId
      )?.user
    }

    return {
      id: conversation.id,
      type: conversation.type,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      createdBy: conversation.creator,
      name:
        conversation.type === 'DIRECT'
          ? otherUser?.name || 'Unknown User'
          : conversation.groupDetail?.groupName || 'Unnamed Group',
      picture:
        conversation.type === 'DIRECT'
          ? getPublicUrl(otherUser?.profilePicture) || null
          : getPublicUrl(conversation.groupDetail?.groupPicture) || null,
      description: conversation.groupDetail?.description,
      participants: conversation.participants.map((p) => ({
        userId: p.userId,
        user: {
          id: p.user.id,
          displayName: p.user.displayName,
          profilePicture: p.user.profilePicture,
          email: p.user.email,
          profilePictureUrl: getPublicUrl(p.user.profilePicture),
        },
      })),
      unreadCount: unreadCountMap[conversation.id] || 0,
    }
  })

  return {
    rows: formattedRows,
    count,
  }
}

export const getConversationById = async (
  conversationId: string,
  userId: string
) => {
  const participant = await Participant.findOne({
    where: {
      conversationId,
      userId,
      isRemoved: false,
    },
  })

  if (!participant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  // Get conversation with details
  const conversation = await Conversation.findOne({
    where: { id: conversationId },
    include: [
      {
        model: Participant,
        as: 'participants',
        where: {
          isRemoved: false,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'displayName', 'profilePicture', 'email'],
          },
        ],
      },
      {
        model: GroupDetail,
        as: 'groupDetail',
        required: false,
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'displayName'],
      },
    ],
  })

  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  const otherUser =
    conversation.type === 'DIRECT'
      ? conversation.participants.find((p) => p.userId !== userId)?.user
      : null

  return {
    id: conversation.id,
    type: conversation.type,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    createdBy: conversation.creator,
    name:
      conversation.type === 'DIRECT'
        ? otherUser?.name
        : conversation.groupDetail?.groupName,
    picture:
      conversation.type === 'DIRECT'
        ? getPublicUrl(otherUser?.profilePicture)
        : getPublicUrl(conversation.groupDetail?.groupPicture),
    description: conversation.groupDetail?.description,
    participants:
      conversation.type === 'DIRECT'
        ? [
            conversation.participants.find((data) => {
              return data.id !== userId
            }),
          ]
        : conversation.participants.map((p) => ({
            userId: p.userId,
            role: p.role,
            user: {
              id: p.user.id,
              displayName: p.user.displayName,
              email: p.user.email,
              profilePicture: getPublicUrl(p.user.profilePicture),
            },
          })),
    isAdmin: participant.role === 'ADMIN',
  }
}

export const createDirectConversation = async (
  currentUserId: string,
  { userId }: CreateDirectConversationRequest
) => {
  if (currentUserId === userId) {
    throw new CustomError.BadRequestError(
      'Cannot create conversation with yourself'
    )
  }

  const otherUser = await User.findByPk(userId)
  if (!otherUser) {
    throw new CustomError.NotFoundError('User not found')
  }

  const existingParticipations = await Participant.findAll({
    where: {
      userId: [currentUserId, userId],
      isRemoved: false,
    },
    include: [
      {
        model: Conversation,
        as: 'conversation',
        where: {
          type: 'DIRECT',
        },
        required: true,
      },
    ],
  })

  const conversationCounts = existingParticipations.reduce((acc, p) => {
    acc[p.conversationId] = (acc[p.conversationId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // If both users are already in a direct conversation
  for (const [conversationId, count] of Object.entries(conversationCounts)) {
    if (count === 2) {
      return await getConversationById(conversationId, currentUserId)
    }
  }

  const conversation = await Conversation.create({
    type: 'DIRECT',
    createdBy: currentUserId,
  })

  await Participant.bulkCreate([
    {
      conversationId: conversation.id,
      userId: currentUserId,
      role: 'ADMIN',
      joinedAt: new Date(),
    },
    {
      conversationId: conversation.id,
      userId,
      role: 'MEMBER',
      joinedAt: new Date(),
    },
  ])

  const conversationDetails = await getConversationById(
    conversation.id,
    currentUserId
  )

  io().to(`user:${userId}`).emit('new_conversation', {
    conversation: conversationDetails,
    initiatedBy: currentUserId,
  })

  return conversationDetails
}

export const createGroupConversation = async (
  currentUserId: string,
  { name, description, participants }: CreateGroupConversationRequest
) => {
  const uniqueParticipants = [...new Set(participants)]

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: uniqueParticipants,
      },
    },
  })

  if (users.length !== uniqueParticipants.length) {
    throw new CustomError.BadRequestError('One or more users do not exist')
  }

  const transaction = await db.sequelize.transaction()

  try {
    const conversation = await Conversation.create(
      {
        type: 'GROUP',
        createdBy: currentUserId,
      },
      { transaction }
    )

    await GroupDetail.create(
      {
        conversationId: conversation.id,
        groupName: name,
        description,
      },
      { transaction }
    )

    await Participant.create(
      {
        conversationId: conversation.id,
        userId: currentUserId,
        role: 'ADMIN',
        joinedAt: new Date(),
      },
      { transaction }
    )

    if (uniqueParticipants.length > 0) {
      const participantRecords = uniqueParticipants
        .filter((id) => id !== currentUserId) // Filter out current user, already added as admin
        .map((userId) => ({
          conversationId: conversation.id,
          userId,
          role: 'MEMBER',
          joinedAt: new Date(),
        }))

      if (participantRecords.length > 0) {
        await Participant.bulkCreate(participantRecords, { transaction })
      }
    }

    await transaction.commit()
    const conversationDetails = await getConversationById(
      conversation.id,
      currentUserId
    )

    const allParticipants = [
      ...uniqueParticipants.filter((id) => id !== currentUserId),
    ]

    allParticipants.forEach((participantId) => {
      io().to(`user:${participantId}`).emit('new_conversation', {
        conversation: conversationDetails,
        initiatedBy: currentUserId,
      })
    })

    return conversationDetails
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const updateGroupDetails = async (
  conversationId: string,
  currentUserId: string,
  updateData: UpdateGroupDetailsRequest
) => {
  const conversation = await Conversation.findOne({
    where: {
      id: conversationId,
      type: 'GROUP',
    },
  })

  if (!conversation) {
    throw new CustomError.NotFoundError('Group conversation not found')
  }

  const participant = await Participant.findOne({
    where: {
      conversationId,
      userId: currentUserId,
      isRemoved: false,
    },
  })

  if (!participant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  if (participant.role !== 'ADMIN') {
    throw new CustomError.UnauthorizedError(
      'Only admins can update group details'
    )
  }

  const transaction = await db.sequelize.transaction()

  try {
    const groupDetail = await GroupDetail.findOne({
      where: { conversationId },
      transaction,
    })

    if (!groupDetail) {
      await transaction.rollback()
      throw new CustomError.NotFoundError('Group details not found')
    }

    if (updateData.name) {
      groupDetail.groupName = updateData.name
    }

    if (updateData.description !== undefined) {
      groupDetail.description = updateData.description
    }

    if (updateData.groupPicture) {
      groupDetail.groupPicture = updateData.groupPicture
    }

    await groupDetail.save({ transaction })

    if (updateData.participants !== undefined) {
      const uniqueParticipants = updateData.participants
        ? [...new Set(updateData.participants)]
        : []

      if (uniqueParticipants.length > 0) {
        const users = await User.findAll({
          where: {
            id: {
              [Op.in]: uniqueParticipants,
            },
          },
          transaction,
        })

        if (users.length !== uniqueParticipants.length) {
          await transaction.rollback()
          throw new CustomError.BadRequestError(
            'One or more users do not exist'
          )
        }
      }

      const existingParticipants = await Participant.findAll({
        where: {
          conversationId,
          isRemoved: false,
        },
        transaction,
      })

      const existingParticipantIds = existingParticipants.map((p) => p.userId)

      const participantsToRemove = existingParticipants.filter(
        (p) =>
          p.userId !== currentUserId && !uniqueParticipants.includes(p.userId)
      )

      const newParticipantIds = uniqueParticipants.filter(
        (id) => !existingParticipantIds.includes(id)
      )

      if (participantsToRemove.length > 0) {
        for (const participant of participantsToRemove) {
          participant.isRemoved = true
          participant.removedAt = new Date()
          await participant.save({ transaction })
        }
      }

      if (newParticipantIds.length > 0) {
        const participantRecords = newParticipantIds.map((userId) => ({
          conversationId,
          userId,
          role: 'MEMBER',
          joinedAt: new Date(),
        }))

        await Participant.bulkCreate(participantRecords, { transaction })
      }
    }

    await transaction.commit()
    return await getConversationById(conversationId, currentUserId)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const addParticipant = async (
  conversationId: string,
  currentUserId: string,
  { userId, role }: AddParticipantRequest
) => {
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  if (conversation.type === 'DIRECT') {
    const participantCount = await Participant.count({
      where: {
        conversationId,
        isRemoved: false,
      },
    })

    if (participantCount >= 2) {
      throw new CustomError.BadRequestError(
        'Cannot add more participants to a direct conversation'
      )
    }
  }

  const currentParticipant = await Participant.findOne({
    where: {
      conversationId,
      userId: currentUserId,
      isRemoved: false,
    },
  })

  if (!currentParticipant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  if (currentParticipant.role !== 'ADMIN') {
    throw new CustomError.UnauthorizedError('Only admins can add participants')
  }

  const user = await User.findByPk(userId)
  if (!user) {
    throw new CustomError.NotFoundError('User not found')
  }

  const existingParticipant = await Participant.findOne({
    where: {
      conversationId,
      userId,
    },
  })

  if (existingParticipant) {
    // If removed, re-add them
    if (existingParticipant.isRemoved) {
      existingParticipant.isRemoved = false
      existingParticipant.removedAt = null
      existingParticipant.role = role
      existingParticipant.joinedAt = new Date()
      await existingParticipant.save()
    } else {
      throw new CustomError.BadRequestError('User is already a participant')
    }
  } else {
    await Participant.create({
      conversationId,
      userId,
      role,
      joinedAt: new Date(),
    })
  }

  return await getConversationById(conversationId, currentUserId)
}

export const updateParticipantRole = async (
  conversationId: string,
  participantUserId: string,
  currentUserId: string,
  { role }: UpdateParticipantRoleRequest
) => {
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  const currentParticipant = await Participant.findOne({
    where: {
      conversationId,
      userId: currentUserId,
      isRemoved: false,
    },
  })

  if (!currentParticipant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  if (currentParticipant.role !== 'ADMIN') {
    throw new CustomError.UnauthorizedError(
      'Only admins can update participant roles'
    )
  }

  const participant = await Participant.findOne({
    where: {
      conversationId,
      userId: participantUserId,
      isRemoved: false,
    },
  })

  if (!participant) {
    throw new CustomError.NotFoundError('Participant not found')
  }

  participant.role = role
  await participant.save()

  return await getConversationById(conversationId, currentUserId)
}

export const removeParticipant = async (
  conversationId: string,
  participantUserId: string,
  currentUserId: string
) => {
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  if (conversation.type === 'DIRECT') {
    throw new CustomError.BadRequestError(
      'Cannot remove participants from direct conversations'
    )
  }

  const currentParticipant = await Participant.findOne({
    where: {
      conversationId,
      userId: currentUserId,
      isRemoved: false,
    },
  })

  if (!currentParticipant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  const isSelfRemoval = currentUserId === participantUserId
  const isAdmin = currentParticipant.role === 'ADMIN'

  if (!isSelfRemoval && !isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Only admins can remove other participants'
    )
  }

  const participant = await Participant.findOne({
    where: {
      conversationId,
      userId: participantUserId,
      isRemoved: false,
    },
  })

  if (!participant) {
    throw new CustomError.NotFoundError('Participant not found')
  }

  if (isAdmin && isSelfRemoval) {
    const adminCount = await Participant.count({
      where: {
        conversationId,
        role: 'ADMIN',
        isRemoved: false,
      },
    })

    if (adminCount === 1) {
      // Find another participant to promote
      const anotherParticipant = await Participant.findOne({
        where: {
          conversationId,
          userId: { [Op.ne]: currentUserId },
          isRemoved: false,
        },
      })

      if (anotherParticipant) {
        anotherParticipant.role = 'ADMIN'
        await anotherParticipant.save()
      }
    }
  }

  participant.isRemoved = true
  participant.removedAt = new Date()
  await participant.save()

  if (isSelfRemoval) {
    return { success: true, message: 'You have left the conversation' }
  }

  return await getConversationById(conversationId, currentUserId)
}

export const deleteConversation = async (
  conversationId: string,
  currentUserId: string
) => {
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  const participant = await Participant.findOne({
    where: {
      conversationId,
      userId: currentUserId,
      isRemoved: false,
    },
  })

  if (!participant) {
    throw new CustomError.UnauthorizedError(
      'You are not a participant in this conversation'
    )
  }

  const isCreator = conversation.createdBy === currentUserId
  const isAdmin = participant.role === 'ADMIN'

  if (!isCreator && !isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Only the creator or admins can delete a conversation'
    )
  }

  if (conversation.type === 'DIRECT') {
    await Participant.update(
      {
        isRemoved: true,
        removedAt: new Date(),
      },
      {
        where: {
          conversationId,
          isRemoved: false,
        },
      }
    )
    return { success: true, message: 'Conversation deleted successfully' }
  }

  const transaction = await db.sequelize.transaction()

  try {
    await GroupDetail.destroy({
      where: { conversationId },
      transaction,
    })

    await Participant.update(
      {
        isRemoved: true,
        removedAt: new Date(),
      },
      {
        where: {
          conversationId,
          isRemoved: false,
        },
        transaction,
      }
    )

    await Message.update(
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        where: {
          conversationId,
          isDeleted: false,
        },
        transaction,
      }
    )

    conversation.updatedAt = new Date()
    await conversation.save({ transaction })

    await transaction.commit()
    return { success: true, message: 'Conversation deleted successfully' }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
export const markConversationSeen = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  // Update the lastSeenAt timestamp
  await Participant.update(
    { lastSeenAt: new Date() },
    {
      where: {
        conversationId,
        userId,
        isRemoved: false,
      },
    }
  )

  io().to(`conversation:${conversationId}`).emit('conversation_seen', {
    conversationId,
    userId,
    timestamp: new Date(),
  })
}

export default {
  getConversations,
  getConversationById,
  createDirectConversation,
  createGroupConversation,
  updateGroupDetails,
  addParticipant,
  updateParticipantRole,
  removeParticipant,
  deleteConversation,
  markConversationSeen,
}
