'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('carts', [
      {
        id: 1,
        user_id: 2, // user1@gmail.com
        total_amount: 485000.00,
        discount_amount: 48500.00,
        final_amount: 436500.00,
        coupon_id: 1, // WELCOME10
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        user_id: 3, // user2@gmail.com
        total_amount: 320000.00,
        discount_amount: 0.00,
        final_amount: 320000.00,
        coupon_id: null,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        user_id: 2, // user1@gmail.com (giỏ hàng cũ đã chuyển đổi)
        total_amount: 650000.00,
        discount_amount: 50000.00,
        final_amount: 600000.00,
        coupon_id: 2, // SAVE50K
        status: 'CONVERTED',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-16')
      },
      {
        id: 4,
        user_id: 3, // user2@gmail.com (giỏ hàng bị bỏ)
        total_amount: 180000.00,
        discount_amount: 0.00,
        final_amount: 180000.00,
        coupon_id: null,
        status: 'ABANDONED',
        created_at: new Date('2024-10-20'),
        updated_at: new Date('2024-10-25')
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('carts', null, {})
  }
}
