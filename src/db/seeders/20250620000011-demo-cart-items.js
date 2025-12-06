'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('cart_items', [
      // Cart 1 - user1@gmail.com (ACTIVE)
      {
        cart_id: 1,
        product_id: 1, // Sách
        quantity: 2,
        unit_price: 120000.00,
        discount: 0.00,
        total_price: 240000.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cart_id: 1,
        product_id: 3, // Sách khác
        quantity: 1,
        unit_price: 245000.00,
        discount: 0.00,
        total_price: 245000.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Cart 2 - user2@gmail.com (ACTIVE)
      {
        cart_id: 2,
        product_id: 6, // Văn phòng phẩm
        quantity: 1,
        unit_price: 85000.00,
        discount: 0.00,
        total_price: 85000.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cart_id: 2,
        product_id: 2, // Sách
        quantity: 1,
        unit_price: 235000.00,
        discount: 0.00,
        total_price: 235000.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('cart_items', null, {})
  }
}
