'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('order_items', [
      // Order 1 - HB2024001 (DELIVERED)
      {
        order_id: 1,
        product_id: 4,
        product_name: 'Tâm Lý Học Tội Phạm - Phác Họa Chân Dung Kẻ Phạm Tội',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734539974/heybook/products/zrnjm8i7aytx9hjr73yc.jpg',
        quantity: 2,
        unit_price: 195000.00,
        discount: 0.00,
        total_price: 390000.00,
        created_at: new Date('2024-11-16'),
        updated_at: new Date('2024-11-16')
      },
      {
        order_id: 1,
        product_id: 6,
        product_name: 'Bộ Bút Chì Màu Chuyên Nghiệp 72 Màu',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734540126/heybook/products/seuht7kqgvdogb6qmdx9.jpg',
        quantity: 1,
        unit_price: 260000.00,
        discount: 0.00,
        total_price: 260000.00,
        created_at: new Date('2024-11-16'),
        updated_at: new Date('2024-11-16')
      },

      // Order 2 - HB2024002 (PROCESSING)
      {
        order_id: 2,
        product_id: 1,
        product_name: 'Nhà Giả Kim',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734539779/heybook/products/cbzk40nxcvf3lc2yppgv.jpg',
        quantity: 1,
        unit_price: 120000.00,
        discount: 0.00,
        total_price: 120000.00,
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2024-12-01')
      },
      {
        order_id: 2,
        product_id: 6,
        product_name: 'Bộ Bút Chì Màu Chuyên Nghiệp 72 Màu',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734540126/heybook/products/seuht7kqgvdogb6qmdx9.jpg',
        quantity: 1,
        unit_price: 260000.00,
        discount: 0.00,
        total_price: 260000.00,
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2024-12-01')
      },

      // Order 3 - HB2024003 (SHIPPING)
      {
        order_id: 3,
        product_id: 3,
        product_name: 'Càn Khôn Đại Náo Thiên Cung',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734539872/heybook/products/wxtgozm1qsqpbwlv9ukj.jpg',
        quantity: 1,
        unit_price: 245000.00,
        discount: 0.00,
        total_price: 245000.00,
        created_at: new Date('2024-12-10'),
        updated_at: new Date('2024-12-10')
      },

      // Order 4 - HB2024004 (CONFIRMED)
      {
        order_id: 4,
        product_id: 2,
        product_name: 'Sapiens: Lược Sử Loài Người',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734539825/heybook/products/jw4bqiayc3i6asjqtdnm.jpg',
        quantity: 1,
        unit_price: 235000.00,
        discount: 0.00,
        total_price: 235000.00,
        created_at: new Date('2024-12-15'),
        updated_at: new Date('2024-12-15')
      },
      {
        order_id: 4,
        product_id: 7,
        product_name: 'Máy Tính Casio FX-580VN X',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734540179/heybook/products/vwqhscnw1zlqxmqjlnrs.jpg',
        quantity: 1,
        unit_price: 225000.00,
        discount: 0.00,
        total_price: 225000.00,
        created_at: new Date('2024-12-15'),
        updated_at: new Date('2024-12-15')
      },

      // Order 5 - HB2024005 (CANCELLED)
      {
        order_id: 5,
        product_id: 5,
        product_name: 'Bộ Thước Kẻ Học Sinh 4 Món',
        product_image: 'https://res.cloudinary.com/dqpo9h5s2/image/upload/v1734540077/heybook/products/l8dtuywrnhtyhxjxm6nw.jpg',
        quantity: 2,
        unit_price: 90000.00,
        discount: 0.00,
        total_price: 180000.00,
        created_at: new Date('2024-12-05'),
        updated_at: new Date('2024-12-05')
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_items', null, {})
  }
}
