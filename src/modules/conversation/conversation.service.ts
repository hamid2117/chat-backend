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

const { User, Conversation, Participant, GroupDetail, Message } = db

export const getConversations = async (
  userId: string,
  query: GetConversationsQuery
) => {
  const { limit, offset, search, type } = query

  // Find all conversations where user is a participant
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

  // Build where clause
  const whereClause: any = {
    id: { [Op.in]: conversationIds },
  }

  // Add type filter if provided
  if (type) {
    whereClause.type = type
  }

  // Get conversations with latest message and participants
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
            attributes: ['id', 'name', 'profilePicture'],
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
        attributes: ['id', 'name'],
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
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    order: [['updatedAt', 'DESC']],
  })

  // Format the response data
  const formattedRows = rows.map((conversation) => {
    // For direct chats, get the other user
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
      // For direct chats, show the other user's name
      name:
        conversation.type === 'DIRECT'
          ? otherUser?.name || 'Unknown User'
          : conversation.groupDetail?.groupName || 'Unnamed Group',
      // For direct chats, show the other user's profile picture
      picture:
        conversation.type === 'DIRECT'
          ? otherUser?.profilePicture || null
          : conversation.groupDetail?.groupPicture || null,
      description: conversation.groupDetail?.description,
      participants: conversation.participants.map((p) => ({
        userId: p.userId,
        user: {
          id: p.user.id,
          name: p.user.name,
          profilePicture: p.user.profilePicture,
        },
      })),
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
            attributes: ['id', 'name', 'profilePicture', 'email'],
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
        attributes: ['id', 'name'],
      },
    ],
  })

  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  // Format the response data
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
        ? otherUser?.profilePicture
        : conversation.groupDetail?.groupPicture,
    description: conversation.groupDetail?.description,
    participants:
      conversation.type === 'DIRECT'
        ? conversation.participants.find((data) => {
            return data.userId !== userId
          })
        : conversation.participants.map((p) => ({
            userId: p.userId,
            role: p.role,
            user: {
              id: p.user.id,
              name: p.user.name,
              email: p.user.email,
              profilePicture: p.user.profilePicture,
            },
          })),
    isAdmin: participant.role === 'ADMIN',
  }
}

export const createDirectConversation = async (
  currentUserId: string,
  { userId }: CreateDirectConversationRequest
) => {
  // Prevent creating chat with self
  if (currentUserId === userId) {
    throw new CustomError.BadRequestError(
      'Cannot create conversation with yourself'
    )
  }

  // Check if other user exists
  const otherUser = await User.findByPk(userId)
  if (!otherUser) {
    throw new CustomError.NotFoundError('User not found')
  }

  // Check if direct conversation already exists between these users
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

  // Group participations by conversationId and find if both users are in the same conversation
  const conversationCounts = existingParticipations.reduce((acc, p) => {
    acc[p.conversationId] = (acc[p.conversationId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // If both users are already in a direct conversation
  for (const [conversationId, count] of Object.entries(conversationCounts)) {
    if (count === 2) {
      // Return the existing conversation
      return await getConversationById(conversationId, currentUserId)
    }
  }

  // Create new direct conversation
  const conversation = await Conversation.create({
    type: 'DIRECT',
    createdBy: currentUserId,
  })

  // Add both users as participants
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

  return await getConversationById(conversation.id, currentUserId)
}

export const createGroupConversation = async (
  currentUserId: string,
  { name, description, participants }: CreateGroupConversationRequest
) => {
  // Ensure unique participants
  const uniqueParticipants = [...new Set(participants)]

  // Check if all participants exist
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

  // Create group conversation transaction
  const transaction = await db.sequelize.transaction()

  try {
    // Create conversation
    const conversation = await Conversation.create(
      {
        type: 'GROUP',
        createdBy: currentUserId,
      },
      { transaction }
    )

    // Create group details
    await GroupDetail.create(
      {
        conversationId: conversation.id,
        groupName: name,
        description,
      },
      { transaction }
    )

    // Add creator as admin
    await Participant.create(
      {
        conversationId: conversation.id,
        userId: currentUserId,
        role: 'ADMIN',
        joinedAt: new Date(),
      },
      { transaction }
    )

    // Add other participants
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
    return await getConversationById(conversation.id, currentUserId)
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
  // Check if conversation exists and is a group
  const conversation = await Conversation.findOne({
    where: {
      id: conversationId,
      type: 'GROUP',
    },
  })

  if (!conversation) {
    throw new CustomError.NotFoundError('Group conversation not found')
  }

  // Check if user is a participant and has admin role
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

  // Update group details
  const groupDetail = await GroupDetail.findOne({
    where: { conversationId },
  })

  if (!groupDetail) {
    throw new CustomError.NotFoundError('Group details not found')
  }

  // Update only the provided fields
  if (updateData.groupName) {
    groupDetail.groupName = updateData.groupName
  }

  if (updateData.description !== undefined) {
    groupDetail.description = updateData.description
  }

  if (updateData.groupPicture) {
    groupDetail.groupPicture = updateData.groupPicture
  }

  await groupDetail.save()
  return await getConversationById(conversationId, currentUserId)
}

export const addParticipant = async (
  conversationId: string,
  currentUserId: string,
  { userId, role }: AddParticipantRequest
) => {
  // Check if conversation exists
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  // For direct conversations, only allow 2 participants
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

  // Check if current user is a participant and has admin role
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

  // Check if user to add exists
  const user = await User.findByPk(userId)
  if (!user) {
    throw new CustomError.NotFoundError('User not found')
  }

  // Check if user is already a participant
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
    // Create new participant
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
  // Check if conversation exists
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  // Verify current user is admin
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

  // Find participant to update
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

  // Update role
  participant.role = role
  await participant.save()

  return await getConversationById(conversationId, currentUserId)
}

export const removeParticipant = async (
  conversationId: string,
  participantUserId: string,
  currentUserId: string
) => {
  // Check if conversation exists
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  // Direct conversations cannot have participants removed (they end the conversation)
  if (conversation.type === 'DIRECT') {
    throw new CustomError.BadRequestError(
      'Cannot remove participants from direct conversations'
    )
  }

  // Verify current user has permission (is admin or removing self)
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

  // Find participant to remove
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

  // If the last admin is leaving, promote another member to admin if possible
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

  // Remove participant (soft delete)
  participant.isRemoved = true
  participant.removedAt = new Date()
  await participant.save()

  // If removing self, return success
  if (isSelfRemoval) {
    return { success: true, message: 'You have left the conversation' }
  }

  // Otherwise return updated conversation
  return await getConversationById(conversationId, currentUserId)
}

export const deleteConversation = async (
  conversationId: string,
  currentUserId: string
) => {
  // Check if conversation exists
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new CustomError.NotFoundError('Conversation not found')
  }

  // Check if user is creator or admin
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

  // For direct conversations, just mark all participants as removed
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

  // For group conversations, delete the conversation, group details, and participants
  const transaction = await db.sequelize.transaction()

  try {
    // Delete group details
    await GroupDetail.destroy({
      where: { conversationId },
      transaction,
    })

    // Mark all participants as removed
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

    // Mark all messages as deleted
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

    // Soft delete the conversation itself
    conversation.updatedAt = new Date()
    await conversation.save({ transaction })

    await transaction.commit()
    return { success: true, message: 'Conversation deleted successfully' }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
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
}
