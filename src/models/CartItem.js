import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const CartItem = sequelize.define(
  'CartItem',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price at the time of adding to cart'
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: 'Discount percentage at the time of adding to cart'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'quantity * unitPrice * (100 - discount) / 100'
    }
  },
  {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['cart_id']
      },
      {
        fields: ['product_id']
      },
      {
        unique: true,
        fields: ['cart_id', 'product_id']
      }
    ]
  }
)

export default CartItem
