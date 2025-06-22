import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const Address = sequelize.define(
  'Address',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    recipientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Tên người nhận'
    },
    recipientEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email người nhận'
    },
    recipientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Số điện thoại người nhận'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Địa chỉ chi tiết'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Địa chỉ mặc định'
    }
  },
  {
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['user_id', 'is_default']
      }
    ]
  }
)

export default Address
