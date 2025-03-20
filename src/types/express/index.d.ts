export type UserPermissions = string[]

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id?: string
      email?: string
      permissions: UserPermissions
    }
  }
}
