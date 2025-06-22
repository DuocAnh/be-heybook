'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create order_items table
    await queryInterface.createTable('order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Store product name at time of order'
      },
      product_image: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Store product image URL at time of order'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Price per unit at time of order'
      },
      discount: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Discount percentage at time of order'
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'quantity * unitPrice * (100 - discount) / 100'
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
    await queryInterface.addIndex('order_items', ['order_id'])
    await queryInterface.addIndex('order_items', ['product_id'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_items')
  }
}
