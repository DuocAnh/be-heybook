import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'messages',
    timestamps: true, // Nếu bạn muốn Sequelize tạo createdAt, updatedAt
    underscored: true, // Sẽ sinh ra created_at thay vì createdAt
    indexes: [
      {
        fields: ['sender']
      },
      {
        fields: ['receiver']
      }
    ]
  }
)

export default Message
