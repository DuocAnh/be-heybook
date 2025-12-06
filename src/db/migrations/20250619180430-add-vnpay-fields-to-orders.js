'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'vnp_transaction_no', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'VNPay transaction number'
    })

    await queryInterface.addColumn('orders', 'vnp_response_code', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'VNPay response code'
    })

    await queryInterface.addColumn('orders', 'paid_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when payment was completed'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'vnp_transaction_no')
    await queryInterface.removeColumn('orders', 'vnp_response_code')
    await queryInterface.removeColumn('orders', 'paid_at')
  }
}
