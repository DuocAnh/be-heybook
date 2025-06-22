'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      category_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      discount: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      stock: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      cover_image_url: {
        allowNull: false,
        type: Sequelize.STRING(500)
      },
      dimension: {
        allowNull: true,
        type: Sequelize.STRING
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('BOOK', 'STATIONERY')
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

    // Tạo index cho performance
    await queryInterface.addIndex('products', ['category_id'])
    await queryInterface.addIndex('products', ['type'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products')
  }
}
