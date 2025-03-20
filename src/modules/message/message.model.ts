import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import User from '../user/user.model'
import Conversation from './../conversation/conversation.model'
import Attachment from './attachment.model'

type ContentType = 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO' | 'CODE'

interface MessageAttributes {
  id: string
  conversationId: string
  senderId: string
  contentType: ContentType
  textContent?: string
  sentAt: Date
  editedAt?: Date
  isEdited: boolean
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface MessageCreationAttributes
  extends Optional<
    MessageAttributes,
    | 'id'
    | 'contentType'
    | 'textContent'
    | 'sentAt'
    | 'editedAt'
    | 'isEdited'
    | 'isDeleted'
    | 'deletedAt'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: string
  public conversationId!: string
  public senderId!: string
  public contentType!: ContentType
  public textContent?: string
  public sentAt!: Date
  public editedAt?: Date
  public isEdited!: boolean
  public isDeleted!: boolean
  public deletedAt?: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Association methods
  public getSender!: BelongsToGetAssociationMixin<User>
  public getConversation!: BelongsToGetAssociationMixin<Conversation>
  public getAttachments!: HasManyGetAssociationsMixin<Attachment>

  public static associate(models: any): void {
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' })
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
    })
    Message.hasMany(models.Attachment, {
      foreignKey: 'messageId',
      as: 'attachments',
    })
  }
}

Message.init(
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
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    contentType: {
      type: DataTypes.ENUM('TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO', 'CODE'),
      allowNull: false,
      defaultValue: 'TEXT',
    },
    textContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deletedAt: {
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
    tableName: 'Messages',
    modelName: 'Message',
  }
)

export default Message
