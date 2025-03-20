import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { Response } from 'express'
import { env } from '../../config/config'

interface JWTPayload {
  id: string
  email: string
  [key: string]: any
}

interface CreateJWTParams {
  payload: JWTPayload
}

interface AttachCookiesParams {
  res: Response
  user: JWTPayload
}

const createJWT = ({ payload }: CreateJWTParams): string => {
  const secret: Secret = env.JWT_SECRET

  const options: SignOptions = {
    expiresIn: env.JWT_LIFETIME as jwt.SignOptions['expiresIn'],
  }

  const token = jwt.sign(payload, secret, options)
  return token
}

const isTokenValid = (token: string): JWTPayload => {
  const secret: Secret = env.JWT_SECRET
  return jwt.verify(token, secret) as JWTPayload
}

const attachCookiesToResponse = ({ res, user }: AttachCookiesParams): void => {
  const token = createJWT({ payload: user })
  const week = 1000 * 60 * 60 * 24 * 7
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + week),
    secure: env.NODE_ENV === 'production',
    signed: true,
  })
}

export { createJWT, isTokenValid, attachCookiesToResponse }
