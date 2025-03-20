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
    UserAttributes {
  role?: RoleModel
}

export interface UserWithRole extends UserModel {
  role: RoleWithPermissions
}

// Role
export interface RoleAttributes {
  id: number
  name: string
  title: string
  description?: string
  accessLevel: string
}

export interface RoleCreationAttributes
  extends Optional<RoleAttributes, 'id'> {}

export interface RoleModel
  extends Model<RoleAttributes, RoleCreationAttributes>,
    RoleAttributes {
  permissions?: PermissionModel[]
}

export interface RoleWithPermissions extends RoleModel {
  permissions: PermissionModel[]
}

// Permission
export interface PermissionAttributes {
  id: number
  name: string
  description?: string
}

export interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, 'id'> {}

export interface PermissionModel
  extends Model<PermissionAttributes, PermissionCreationAttributes>,
    PermissionAttributes {
  roles?: RoleModel[]
}
