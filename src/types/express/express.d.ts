import 'express-serve-static-core'

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
        email: string
      }
      filePath?: string
    }
  }
}
