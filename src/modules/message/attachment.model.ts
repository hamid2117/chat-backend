import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize'
import sequelize from '../../config/db.config'
import Message from './message.model'

interface AttachmentAttributes {
  id: string
  messageId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface AttachmentCreationAttributes
  extends Optional<
    AttachmentAttributes,
    'id' | 'uploadedAt' | 'createdAt' | 'updatedAt'
  > {}

class Attachment
  extends Model<AttachmentAttributes, AttachmentCreationAttributes>
  implements AttachmentAttributes
{
  public id!: string
  public messageId!: string
  public fileUrl!: string
  public fileName!: string
  public fileType!: string
  public fileSize!: number
  public uploadedAt!: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public getMessage!: BelongsToGetAssociationMixin<Message>

  public static associate(models: any): void {
    Attachment.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message',
    })
  }
}

Attachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'Attachments',
    modelName: 'Attachment',
  }
)

export default Attachment
