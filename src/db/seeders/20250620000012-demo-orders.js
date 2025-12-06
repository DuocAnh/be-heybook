'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('orders', [
      {
        id: 1,
        order_number: 'HB2024001',
        user_id: 2, // user1@gmail.com
        subtotal: 650000.00,
        discount_amount: 50000.00,
        total_amount: 600000.00,
        coupon_id: 2, // SAVE50K
        coupon_code: 'SAVE50K',
        status: 'DELIVERED',
        payment_method: 'VNPAY',
        payment_status: 'PAID',
        shipping_address: JSON.stringify({
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          address: '456 Nguyen Van Cu, District 1, Ho Chi Minh City'
        }),
        notes: 'Giao hàng trong giờ hành chính',
        created_at: new Date('2024-11-16'),
        updated_at: new Date('2024-11-20')
      },
      {
        id: 2,
        order_number: 'HB2024002',
        user_id: 3, // user2@gmail.com
        subtotal: 380000.00,
        discount_amount: 57000.00,
        total_amount: 323000.00,
        coupon_id: 3, // SUMMER2024 (15%)
        coupon_code: 'SUMMER2024',
        status: 'PROCESSING',
        payment_method: 'COD',
        payment_status: 'PENDING',
        shipping_address: JSON.stringify({
          name: 'Trần Thị B',
          phone: '0912345678',
          address: '789 Le Loi, District 3, Ho Chi Minh City'
        }),
        notes: null,
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2024-12-01')
      },
      {
        id: 3,
        order_number: 'HB2024003',
        user_id: 2, // user1@gmail.com
        subtotal: 245000.00,
        discount_amount: 24500.00,
        total_amount: 220500.00,
        coupon_id: 1, // WELCOME10
        coupon_code: 'WELCOME10',
        status: 'SHIPPED',
        payment_method: 'VNPAY',
        payment_status: 'PAID',
        shipping_address: JSON.stringify({
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          address: '456 Nguyen Van Cu, District 1, Ho Chi Minh City'
        }),
        notes: 'Gọi trước khi giao',
        created_at: new Date('2024-12-10'),
        updated_at: new Date('2024-12-12')
      },
      {
        id: 4,
        order_number: 'HB2024004',
        user_id: 3, // user2@gmail.com
        subtotal: 460000.00,
        discount_amount: 30000.00,
        total_amount: 430000.00,
        coupon_id: 4, // FREESHIP
        coupon_code: 'FREESHIP',
        status: 'CONFIRMED',
        payment_method: 'VNPAY',
        payment_status: 'PAID',
        shipping_address: JSON.stringify({
          name: 'Trần Thị B',
          phone: '0912345678',
          address: '789 Le Loi, District 3, Ho Chi Minh City'
        }),
        notes: 'Đóng gói cẩn thận',
        created_at: new Date('2024-12-15'),
        updated_at: new Date('2024-12-16')
      },
      {
        id: 5,
        order_number: 'HB2024005',
        user_id: 2, // user1@gmail.com
        subtotal: 180000.00,
        discount_amount: 36000.00,
        total_amount: 144000.00,
        coupon_id: 5, // STUDENT20
        coupon_code: 'STUDENT20',
        status: 'CANCELLED',
        payment_method: 'COD',
        payment_status: 'FAILED',
        shipping_address: JSON.stringify({
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          address: '456 Nguyen Van Cu, District 1, Ho Chi Minh City'
        }),
        notes: 'Khách hàng yêu cầu hủy',
        created_at: new Date('2024-12-05'),
        updated_at: new Date('2024-12-06')
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('orders', null, {})
  }
}
