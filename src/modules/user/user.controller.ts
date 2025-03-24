import { Request, Response, NextFunction } from 'express'
import * as userService from './user.service'
import {
  successResponse,
  attachCookiesToResponse,
  handleFileUpload,
  getPublicUrl,
  deleteFile,
} from '../../utils'

import CustomError from '../../../errors'
import {
  UserQueryParams,
  UserUpdateRequest,
  PasswordUpdateRequest,
} from '../../types/modules/user/user.types'
import {
  userIdSchema,
  updateUserSchema,
  updatePasswordSchema,
  getUsersQuerySchema,
} from './user.schema'
import db from '../../../models'
import { UserModel } from '../../types/modules/user'

export const getAllUsers = async (
  req: Request<{}, {}, {}, UserQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams = getUsersQuerySchema.parse(req.query)

    const users = await userService.getAllUsers(queryParams)
    res.status(200).json(successResponse(users))
  } catch (err) {
    next(err)
  }
}

export const getSingleUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = userIdSchema.parse({ id: req.params.id })

    const user = await userService.getUserById(id, {
      attributes: {
        exclude: [
          'passwordHash',
          'verificationToken',
          'passwordResetToken',
          'passwordResetExpires',
        ],
      },
    })

    if (!user) {
      throw new CustomError.NotFoundError(`No user with id: ${id}`)
    }

    res.status(200).json(successResponse(user))
  } catch (err) {
    next(err)
  }
}

export const showCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.user?.id || '', {
      attributes: {
        exclude: [
          'id',
          'roleId',
          'passwordHash',
          'verificationToken',
          'passwordResetToken',
          'passwordResetExpires',
        ],
      },
    })

    res.status(200).json(successResponse(user))
  } catch (err) {
    next(err)
  }
}

export const updateUser = async (
  req: Request<{ id: string }, {}, UserUpdateRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = userIdSchema.parse({ id: req.params.id })

    if (String(id) !== req.user?.id) {
      throw new CustomError.UnauthorizedError(
        'You are not allowed to update this user'
      )
    }

    let profilePicturePath: string | null = null
    let currentUser: UserModel | null = null

    const contentType = req.headers['content-type'] || ''
    if (contentType.includes('multipart/form-data')) {
      currentUser = await userService.getUserById(id)
      if (!currentUser) {
        throw new CustomError.NotFoundError(`No user with id: ${id}`)
      }

      profilePicturePath = await handleFileUpload(req, {
        directory: 'profiles',
        fieldName: 'profilePicture',
        fileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      })

      if (profilePicturePath && currentUser.profilePicture) {
        deleteFile(currentUser.profilePicture)
      }
    }

    // Parse and validate the update data
    const updateData = updateUserSchema.parse({
      ...req.body,
      profilePicture: profilePicturePath || undefined,
    })

    // Update the user
    const user = await userService.updateUser(id, updateData)

    // Generate token and attach to response
    if (req.body?.email || req.body?.name) {
      const tokenUser = {
        id: String(user.id),
        displayName: user.displayName,
        userName: user.userName,
        email: user.email,
      }
      attachCookiesToResponse({ res, user: tokenUser })
    }

    let responseData = { ...user }
    if (user.profilePicture) {
      responseData.profilePictureUrl = getPublicUrl(req, user.profilePicture)
    }

    res.status(200).json(successResponse(responseData))
  } catch (err) {
    next(err)
  }
}
export const updateUserPassword = async (
  req: Request<{}, {}, PasswordUpdateRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body)

    const userId = req.user?.id || ''
    await userService.updatePassword(userId, oldPassword, newPassword)

    res.status(200).json(successResponse(null, 'Password updated successfully'))
  } catch (err) {
    next(err)
  }
}
