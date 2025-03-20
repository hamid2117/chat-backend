import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import User from '../user/user.model'
import Conversation from './conversation.model'

interface ParticipantAttributes {
  id: string
  conversationId: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
  isRemoved: boolean
  removedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface ParticipantCreationAttributes
  extends Optional<
    ParticipantAttributes,
    | 'id'
    | 'role'
    | 'joinedAt'
    | 'isRemoved'
    | 'removedAt'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Participant
  extends Model<ParticipantAttributes, ParticipantCreationAttributes>
  implements ParticipantAttributes
{
  public id!: string
  public conversationId!: string
  public userId!: string
  public role!: 'ADMIN' | 'MEMBER'
  public joinedAt!: Date
  public isRemoved!: boolean
  public removedAt?: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getUser!: BelongsToGetAssociationMixin<User>
  public getConversation!: BelongsToGetAssociationMixin<Conversation>

  public static associate(models: any): void {
    Participant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Participant.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
    })
  }
}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Conversations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    role: {
      type: DataTypes.ENUM('ADMIN', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isRemoved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    removedAt: {
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
    tableName: 'Participants',
    modelName: 'Participant',
  }
)

export default Participant
