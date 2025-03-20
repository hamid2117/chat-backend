import { createJWT, isTokenValid, attachCookiesToResponse } from './jwt'
import sendVerificationEmail from './sendVerficationEmail'
import sendResetPasswordEmail from './sendResetPasswordEmail'
import createHash from './createHash'
import { errorResponse, successResponse } from './responseHandler'
import logger from './logger'

export {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
  errorResponse,
  successResponse,
  logger,
}
