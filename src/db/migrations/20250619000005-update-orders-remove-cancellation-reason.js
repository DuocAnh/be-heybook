'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop cancellation_reason column
    await queryInterface.removeColumn('orders', 'cancellation_reason')
    
    // Update payment_method enum to only have COD and VNPAY
    await queryInterface.changeColumn('orders', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY'),
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    // Add back cancellation_reason column
    await queryInterface.addColumn('orders', 'cancellation_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    
    // Revert payment_method enum to original values
    await queryInterface.changeColumn('orders', 'payment_method', {
      type: Sequelize.ENUM('COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'),
      allowNull: true
    })
  }
}
