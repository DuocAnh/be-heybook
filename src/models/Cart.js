import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const Cart = sequelize.define(
  'Cart',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'coupons',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ABANDONED', 'CONVERTED'),
      defaultValue: 'ACTIVE'
    }
  },
  {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['session_id']
      },
      {
        fields: ['status']
      }
    ]
  }
)

export default Cart
