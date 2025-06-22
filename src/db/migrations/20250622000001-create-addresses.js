'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      recipient_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Tên người nhận'
      },
      recipient_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email người nhận'
      },
      recipient_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Số điện thoại người nhận'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Địa chỉ chi tiết'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Địa chỉ mặc định'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    // Add indexes
    await queryInterface.addIndex('addresses', ['user_id'])
    await queryInterface.addIndex('addresses', ['user_id', 'is_default'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addresses')
  }
}
