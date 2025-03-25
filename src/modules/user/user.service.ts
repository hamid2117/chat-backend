import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../../../models'
import CustomError from '../../../errors'
import { env } from '../../../config/config'
import {
  UserModel,
  QueryParams,
  UserQueryOptions,
  UpdateUserData,
  UsersResult,
} from '../../types/modules/user'
import Participant from '../conversation/participant.model'
import Conversation from '../conversation/conversation.model'

const User = db.User

// Define interfaces for type safety

export const getUserById = async (
  id: string | number,
  options: UserQueryOptions = {}
): Promise<UserModel | null> => {
  const queryOptions = {
    attributes: options.attributes || { exclude: ['passwordHash'] },
    ...options,
  }

  return await User.findByPk(id, queryOptions)
}

export const updateUser = async (
  id: string | number,
  updateData: UpdateUserData
): Promise<Omit<UserModel, 'passwordHash'>> => {
  if (updateData.passwordHash) {
    delete updateData.passwordHash
  }

  const [rowsUpdated] = await User.update(updateData, {
    where: { id },
  })

  if (rowsUpdated === 0) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`)
  }

  const updatedUser = await User.findByPk(id)
  if (!updatedUser) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`)
  }

  const userObject = updatedUser.get({ plain: true })
  delete userObject.passwordHash

  return userObject
}

export const getAllUsers = async (
  queryParams: QueryParams = {}
): Promise<UsersResult> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
  } = queryParams

  const offset = (page - 1) * limit

  const whereCondition = search
    ? {
        [Op.or]: [
          { displayName: { [Op.iLike]: `%${search}%` } },
          { userName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {}

  const { rows: users, count } = await User.findAndCountAll({
    where: whereCondition,
    order: [[sortBy, order.toUpperCase()]],
    limit,
    offset,
    attributes: { exclude: ['passwordHash'] },
  })

  return {
    users,
    totalUsers: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  }
}

export const updatePassword = async (
  userId: string | number,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${userId}`)
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid credentials')
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    parseInt(env.SALT_ROUNDS.toString()) || 10
  )

  user.passwordHash = passwordHash

  await user.save()

  return true
}

export const getUsersForConversationByType = async (
  currentUserId: string,
  type: 'group' | 'direct'
): Promise<any[]> => {
  const excludeUserIds = [currentUserId]

  if (type === 'direct') {
    const userParticipations = await Participant.findAll({
      where: {
        userId: currentUserId,
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

    const conversationIds = userParticipations.map((p) => p.conversationId)

    if (conversationIds.length > 0) {
      //  Find all other users in these direct conversations
      const otherParticipants = await Participant.findAll({
        where: {
          conversationId: {
            [Op.in]: conversationIds,
          },
          userId: {
            [Op.ne]: currentUserId,
          },
          isRemoved: false,
        },
      })

      // Add these user IDs to our exclude list
      const otherUserIds = otherParticipants.map((p) => p.userId)
      excludeUserIds.push(...otherUserIds)
    }
  }

  //  Find all users excluding those in excludeUserIds
  const users = await User.findAll({
    where: {
      id: {
        [Op.notIn]: excludeUserIds,
      },
    },
    attributes: {
      exclude: [
        'passwordHash',
        'verificationToken',
        'passwordResetToken',
        'passwordResetExpires',
      ],
    },
  })

  return users
}
