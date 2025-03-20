import { Request, Response, NextFunction } from 'express'

export type AuthenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

export interface DecodedToken {
  id: string
  email: string
  iat: number
  exp: number
}
