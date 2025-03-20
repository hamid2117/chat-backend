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

  const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
    where: { id },
    returning: true,
    plain: true,
  })

  if (rowsUpdated === 0)
    throw new CustomError.NotFoundError(`No user with id: ${id}`)

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
          { name: { [Op.iLike]: `%${search}%` } },
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
