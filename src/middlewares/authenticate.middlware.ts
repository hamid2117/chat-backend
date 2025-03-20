import { Request, Response, NextFunction } from 'express'
import CustomError from '../../errors'
import { isTokenValid } from '../utils'
import { DecodedToken } from '../types/middleware/auth'

const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.signedCookies.token

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid')
  }

  try {
    const { id, email } = isTokenValid(token) as DecodedToken
    req.user = { id, email }
    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid')
  }
}

export default verifyToken
