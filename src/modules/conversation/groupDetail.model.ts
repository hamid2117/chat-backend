import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import Conversation from './conversation.model'

interface GroupDetailAttributes {
  id: string
  conversationId: string
  groupName: string
  groupPicture?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface GroupDetailCreationAttributes
  extends Optional<
    GroupDetailAttributes,
    'id' | 'groupPicture' | 'description' | 'createdAt' | 'updatedAt'
  > {}

class GroupDetail
  extends Model<GroupDetailAttributes, GroupDetailCreationAttributes>
  implements GroupDetailAttributes
{
  public id!: string
  public conversationId!: string
  public groupName!: string
  public groupPicture?: string
  public description?: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getConversation!: BelongsToGetAssociationMixin<Conversation>

  public static associate(models: any): void {
    GroupDetail.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
    })
  }
}

GroupDetail.init(
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
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupPicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'GroupDetails',
    modelName: 'GroupDetail',
  }
)

export default GroupDetail
