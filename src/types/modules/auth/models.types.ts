import { Model, Optional } from 'sequelize'

// User
export interface UserAttributes {
  id: string
  name: string
  email: string
  passwordHash: string
  isVerified: boolean
  verifiedAt?: Date
  verificationToken?: string
  passwordResetToken?: string | null
  passwordResetExpires?: Date | null
  roleId?: number
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

export interface UserModel
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}
