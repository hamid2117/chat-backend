import { Request, Response, NextFunction } from 'express'

export type AuthenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

export type AuthorizationMiddleware = (
  permission: string
) => (req: Request, res: Response, next: NextFunction) => Promise<void>

export interface DecodedToken {
  id: string
  email: string
  permissions: string[]
  iat: number
  exp: number
}
