import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Store product name at time of order'
    },
    productImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Store product image URL at time of order'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price per unit at time of order'
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: 'Discount percentage at time of order'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'quantity * unitPrice * (100 - discount) / 100'
    }
  },
  {
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      }
    ]
  }
)

export default OrderItem
