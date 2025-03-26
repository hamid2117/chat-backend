import { Model, Optional } from 'sequelize'

export interface UserAttributes {
  id: number
  displayName: string
  userName: string
  email: string
  passwordHash: string
  roleId: number
  profilePicture?: string | null
  isVerified: boolean
  verificationToken?: string
  verifiedAt?: Date
  passwordResetToken?: string | null
  passwordResetExpires?: Date | null
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

export interface UserModel
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  order?: string
  search?: string
}

export interface UserQueryOptions {
  attributes?:
    | {
        exclude?: string[]
      }
    | string[]
  include?: any[]
  [key: string]: any
}

export interface UpdateUserData {
  name?: string
  email?: string
  profilePicture?: string
  roleId?: number
  [key: string]: any
}

export interface UsersResult {
  users: UserModel[]
  totalUsers: number
  totalPages: number
  currentPage: number
}
