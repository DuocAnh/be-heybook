import { DataTypes } from 'sequelize'
import sequelize from '~/config/mySQL'

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Generated order number like HB2025001'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total before discounts and shipping'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Final amount = subtotal - discountAmount'
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
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Store coupon code for reference'
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED'
      ),
      defaultValue: 'PENDING'
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING'
    },
    paymentMethod: {
      type: DataTypes.ENUM('COD', 'VNPAY'),
      allowNull: true
    },
    // VNPay payment fields
    vnpTransactionNo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'VNPay transaction number'
    },
    vnpResponseCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'VNPay response code'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when payment was completed'
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Full shipping address as text string'
    },
    recipientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the person receiving the order'
    },
    recipientEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email of the person receiving the order'
    },
    recipientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Phone number of the person receiving the order'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['order_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['payment_status']
      },
      {
        fields: ['created_at']
      }
    ]
  }
)

export default Order
