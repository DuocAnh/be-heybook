'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('coupons', [
      {
        id: 1,
        code: 'WELCOME10',
        name: 'Giảm giá chào mừng thành viên mới',
        description: 'Giảm 10% cho đơn hàng đầu tiên, áp dụng cho đơn hàng từ 200,000đ',
        type: 'PERCENTAGE',
        value: 10.00,
        minOrderAmount: 200000.00,
        maxDiscountAmount: 50000.00,
        usageLimit: 100,
        usedCount: 15,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        code: 'SAVE50K',
        name: 'Giảm giá cố định 50,000đ',
        description: 'Giảm trực tiếp 50,000đ cho đơn hàng từ 500,000đ',
        type: 'FIXED_AMOUNT',
        value: 50000.00,
        minOrderAmount: 500000.00,
        maxDiscountAmount: null,
        usageLimit: 50,
        usedCount: 8,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        code: 'SUMMER2024',
        name: 'Khuyến mãi hè 2024',
        description: 'Giảm 15% cho tất cả sản phẩm sách, áp dụng cho đơn hàng từ 300,000đ',
        type: 'PERCENTAGE',
        value: 15.00,
        minOrderAmount: 300000.00,
        maxDiscountAmount: 100000.00,
        usageLimit: 200,
        usedCount: 45,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        description: 'Giảm 30,000đ phí vận chuyển cho đơn hàng từ 400,000đ',
        type: 'FIXED_AMOUNT',
        value: 30000.00,
        minOrderAmount: 400000.00,
        maxDiscountAmount: null,
        usageLimit: null,
        usedCount: 127,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        code: 'STUDENT20',
        name: 'Ưu đãi sinh viên',
        description: 'Giảm 20% dành riêng cho sinh viên, áp dụng cho đơn hàng từ 150,000đ',
        type: 'PERCENTAGE',
        value: 20.00,
        minOrderAmount: 150000.00,
        maxDiscountAmount: 80000.00,
        usageLimit: 300,
        usedCount: 89,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('coupons', null, {})
  }
}
