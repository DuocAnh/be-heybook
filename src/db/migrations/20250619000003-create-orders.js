'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create orders table
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Generated order number like HB2025001'
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total before discounts and shipping'
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      shipping_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Final amount = subtotal - discountAmount + shippingFee'
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'coupons',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      coupon_code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Store coupon code for reference'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'),
        defaultValue: 'PENDING'
      },
      payment_status: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
        defaultValue: 'PENDING'
      },
      payment_method: {
        type: Sequelize.ENUM('COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'),
        allowNull: true
      },
      shipping_address: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'JSON object containing shipping address details'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimated_delivery: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })

    // Create indexes
    await queryInterface.addIndex('orders', ['user_id'])
    await queryInterface.addIndex('orders', ['order_number'])
    await queryInterface.addIndex('orders', ['status'])
    await queryInterface.addIndex('orders', ['payment_status'])
    await queryInterface.addIndex('orders', ['created_at'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders')
  }
}
