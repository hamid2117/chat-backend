import { Request, Response, NextFunction } from 'express'
import authService from './auth.service'
import { successResponse, attachCookiesToResponse } from '../../utils'
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema'
import { env } from '../../../config/config'
import {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthPayload,
  LoginResponseData,
} from '../../types/modules/auth/auth.types'

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    registerSchema.parse(req.body)
    await authService.register(req.body)
    res
      .status(201)
      .json(
        successResponse(
          null,
          'Success! Please check your email to verify account'
        )
      )
  } catch (err) {
    next(err)
  }
}

export const verifyEmail = async (
  req: Request<{}, {}, VerifyEmailRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    verifyEmailSchema.parse(req.body)
    await authService.verifyEmail(req.body)
    res.status(200).json(successResponse(null, 'Email verified successfully.'))
  } catch (err) {
    next(err)
  }
}

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    loginSchema.parse(req.body)
    const { user } = await authService.login(req.body)

    const payload: AuthPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    }

    attachCookiesToResponse({ res, user: payload })

    res.status(200).json(
      successResponse<LoginResponseData>(
        {
          email: user.email,
          name: user.name,
          isVarified: user.isVerified,
        },
        'Login successful.'
      )
    )
  } catch (err) {
    next(err)
  }
}

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
    })
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(0),
    })

    res.status(200).json(successResponse(null, 'Logout successful.'))
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(req.body.email)
    res
      .status(200)
      .json(
        successResponse(
          null,
          'Please check your email for reset password link.'
        )
      )
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    resetPasswordSchema.parse(req.body)
    await authService.resetPassword(req.body)
    res.status(200).json(successResponse(null, 'Password has been reset.'))
  } catch (err) {
    next(err)
  }
}
