'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove shipping_fee column
    await queryInterface.removeColumn('orders', 'shipping_fee')
    
    // Remove estimated_delivery column
    await queryInterface.removeColumn('orders', 'estimated_delivery')
    
    // Update total_amount comment
    await queryInterface.changeColumn('orders', 'total_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Final amount = subtotal - discountAmount'
    })
  },

  async down(queryInterface, Sequelize) {
    // Add back shipping_fee column
    await queryInterface.addColumn('orders', 'shipping_fee', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    })
    
    // Add back estimated_delivery column
    await queryInterface.addColumn('orders', 'estimated_delivery', {
      type: Sequelize.DATE,
      allowNull: true
    })
    
    // Revert total_amount comment
    await queryInterface.changeColumn('orders', 'total_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Final amount = subtotal - discountAmount + shippingFee'
    })
  }
}
