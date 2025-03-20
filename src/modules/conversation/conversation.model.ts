import {
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
  HasOneGetAssociationMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import User from '../user/user.model'
import Participant from './participant.model'
import Message from '../message/message.model'
import GroupDetail from './groupDetail.model'

interface ConversationAttributes {
  id: string
  type: 'DIRECT' | 'GROUP'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string
  public type!: 'DIRECT' | 'GROUP'
  public createdBy!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getCreator!: BelongsToGetAssociationMixin<User>
  public getParticipants!: HasManyGetAssociationsMixin<Participant>
  public getMessages!: HasManyGetAssociationsMixin<Message>
  public getGroupDetail!: HasOneGetAssociationMixin<GroupDetail>

  public static associate(models: any): void {
    Conversation.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    })
    Conversation.hasMany(models.Participant, {
      foreignKey: 'conversationId',
      as: 'participants',
    })
    Conversation.hasMany(models.Message, {
      foreignKey: 'conversationId',
      as: 'messages',
    })
    Conversation.hasOne(models.GroupDetail, {
      foreignKey: 'conversationId',
      as: 'groupDetail',
    })
  }
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('DIRECT', 'GROUP'),
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    tableName: 'Conversations',
    modelName: 'Conversation',
  }
)

export default Conversation
