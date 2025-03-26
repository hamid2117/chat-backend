import bcrypt from 'bcrypt'
import crypto from 'crypto'
import CustomError from '../../../errors'
import db from '../../../models'
import {
  sendResetPasswordEmail,
  createHash,
  sendVerificationEmail,
} from '../../utils'
import { env } from '../../../config/config'
import {
  RegisterRequest,
  VerifyEmailRequest,
  LoginRequest,
  ResetPasswordRequest,
  LoginServiceResponse,
} from '../../types/modules/auth/auth.types'

const { User, UserToken } = db

const register = async ({
  email,
  userName,
  displayName,
  password,
}: RegisterRequest): Promise<void> => {
  const emailAlreadyExists = await User.findOne({ where: { email } })
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }

  const passwordHash = await bcrypt.hash(password, env.SALT_ROUNDS)
  const verificationToken = crypto.randomBytes(40).toString('hex')

  const user = await User.create({
    userName,
    displayName,
    email,
    passwordHash,
    isVerified: false,
  })

  const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

  await UserToken.create({
    userId: user.id,
    verificationToken,
    verificationExpiresAt,
  })

  await sendVerificationEmail({
    name: user.displayName,
    email: user.email,
    verificationToken: verificationToken,
  })
}

const verifyEmail = async ({
  verificationToken,
  email,
}: VerifyEmailRequest): Promise<void> => {
  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed')
  }

  // Find the token in UserToken model
  const userToken = await UserToken.findOne({
    where: {
      userId: user.id,
      verificationToken,
    },
  })

  if (!userToken || !userToken.verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed')
  }

  // Check if token is expired
  if (
    userToken.verificationExpiresAt &&
    userToken.verificationExpiresAt < new Date()
  ) {
    throw new CustomError.UnauthenticatedError('Verification token expired')
  }

  // Update user verified status
  user.isVerified = true
  user.verifiedAt = new Date()
  await user.save()

  // Clear verification token
  userToken.verificationToken = null
  userToken.verificationExpiresAt = null
  await userToken.save()
}

const login = async ({
  email,
  password,
}: LoginRequest): Promise<LoginServiceResponse> => {
  const user = await User.findOne({
    where: { email },
  })

  if (!user) {
    throw new CustomError.UnauthenticatedError('No user found with that email')
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Email not verified')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new CustomError.UnauthenticatedError('Incorrect password')

  return {
    user,
  }
}

const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ where: { email } })

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')
    const tenMinutes = 1000 * 60 * 10
    const passwordResetExpiresAt = new Date(Date.now() + tenMinutes)

    // Find or create a token record
    let userToken = await UserToken.findOne({ where: { userId: user.id } })

    if (!userToken) {
      userToken = await UserToken.create({
        userId: user.id,
        passwordResetToken: createHash(passwordToken),
        passwordResetExpiresAt,
      })
    } else {
      userToken.passwordResetToken = createHash(passwordToken)
      userToken.passwordResetExpiresAt = passwordResetExpiresAt
      await userToken.save()
    }

    // Send email
    await sendResetPasswordEmail({
      name: user.displayName,
      email: user.email,
      token: passwordToken,
      origin: env.ORIGIN,
    })
  }
}

const resetPassword = async ({
  token,
  email,
  password,
}: ResetPasswordRequest): Promise<void> => {
  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new CustomError.NotFoundError('User not found')
  }

  const userToken = await UserToken.findOne({ where: { userId: user.id } })

  if (!userToken) {
    throw new CustomError.BadRequestError(
      'Invalid or expired password reset token'
    )
  }

  const currentDate = new Date()

  if (
    userToken.passwordResetToken === createHash(token) &&
    userToken.passwordResetExpiresAt &&
    userToken.passwordResetExpiresAt > currentDate
  ) {
    // Update password
    const passwordHash = await bcrypt.hash(password, env.SALT_ROUNDS)
    user.passwordHash = passwordHash
    await user.save()

    // Clear reset token
    userToken.passwordResetToken = null
    userToken.passwordResetExpiresAt = null
    await userToken.save()
  } else {
    throw new CustomError.BadRequestError(
      'Invalid or expired password reset token'
    )
  }
}

export = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
}
