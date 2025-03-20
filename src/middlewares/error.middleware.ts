import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils'
import { z } from 'zod'
import { env } from '../../config/config'

interface FormattedError {
  field: string
  message: string
}

interface ErrorResponse {
  success: boolean
  message: string
  errors?: FormattedError[]
  stack?: string
}

const errorHandler = (
  err: Error & { status?: number } & { errors?: any[] },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
  })

  if (err instanceof z.ZodError) {
    const formattedErrors: FormattedError[] = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))

    res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    })
    return
  }

  const status = err.status || 500
  const response: ErrorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  }
  
  if (env.NODE_ENV !== 'production') {
    response.stack = err.stack
  }
  
  res.status(status).json(response)
}

export default errorHandler