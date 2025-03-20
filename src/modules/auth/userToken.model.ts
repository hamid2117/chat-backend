import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import User from '../user/user.model'

interface UserTokenAttributes {
  id: string
  userId: string
  verificationToken?: string
  verificationExpiresAt?: Date
  passwordResetToken?: string
  passwordResetExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface UserTokenCreationAttributes
  extends Optional<UserTokenAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserToken
  extends Model<UserTokenAttributes, UserTokenCreationAttributes>
  implements UserTokenAttributes
{
  public id!: string
  public userId!: string
  public verificationToken?: string
  public verificationExpiresAt?: Date
  public passwordResetToken?: string
  public passwordResetExpiresAt?: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getUser!: BelongsToGetAssociationMixin<User>

  public static associate(models: any): void {
    UserToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
  }
}

UserToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'UserTokens',
    modelName: 'UserToken',
  }
)

export default UserToken
