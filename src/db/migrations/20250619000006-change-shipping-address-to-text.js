'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change shipping_address from JSON to TEXT
    await queryInterface.changeColumn('orders', 'shipping_address', {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'Full shipping address as text string'
    })
  },

  async down(queryInterface, Sequelize) {
    // Revert shipping_address back to JSON
    await queryInterface.changeColumn('orders', 'shipping_address', {
      type: Sequelize.JSON,
      allowNull: false,
      comment: 'JSON object containing shipping address details'
    })
  }
}
