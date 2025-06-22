'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('book_details', {
      product_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_genre_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'book_genres',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      author: {
        allowNull: false,
        type: Sequelize.STRING
      },
      translator: {
        allowNull: false,
        type: Sequelize.STRING
      },
      language: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      publisher: {
        allowNull: false,
        type: Sequelize.STRING
      },
      publish_year: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      page_count: {
        allowNull: false,
        type: Sequelize.INTEGER
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

    // Tạo index cho book_genre_id
    await queryInterface.addIndex('book_details', ['book_genre_id'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('book_details')
  }
}
