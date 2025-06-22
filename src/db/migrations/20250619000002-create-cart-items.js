'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create cart_items table
    await queryInterface.createTable('cart_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cart_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carts',
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Price at the time of adding to cart'
      },
      discount: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: 'Discount percentage at the time of adding to cart'
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
    await queryInterface.addIndex('cart_items', ['cart_id'])
    await queryInterface.addIndex('cart_items', ['product_id'])
    await queryInterface.addIndex('cart_items', ['cart_id', 'product_id'], { unique: true })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cart_items')
  }
}
