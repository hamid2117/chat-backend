import {
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import Conversation from '../conversation/conversation.model'
import Participant from '../conversation/participant.model'
import Message from '../message/message.model'
import UserToken from '../auth/userToken.model'

interface UserAttributes {
  id: string
  name: string
  email: string
  passwordHash: string
  isVerified: boolean
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string
  public name!: string
  public email!: string
  public passwordHash!: string
  public isVerified!: boolean
  public profilePicture?: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getConversations!: HasManyGetAssociationsMixin<Conversation>
  public getParticipations!: HasManyGetAssociationsMixin<Participant>
  public getMessages!: HasManyGetAssociationsMixin<Message>
  public getTokens!: HasManyGetAssociationsMixin<UserToken>

  public static associate(models: any): void {
    User.hasMany(models.Conversation, {
      foreignKey: 'createdBy',
      as: 'conversations',
    })
    User.hasMany(models.Participant, {
      foreignKey: 'userId',
      as: 'participations',
    })
    User.hasMany(models.Message, { foreignKey: 'senderId', as: 'messages' })
    User.hasMany(models.UserToken, { foreignKey: 'userId', as: 'tokens' })
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profilePicture: {
      type: DataTypes.STRING,
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
    indexes: [{ unique: true, fields: ['email'] }],
    tableName: 'Users',
    modelName: 'User',
  }
)

export default User
