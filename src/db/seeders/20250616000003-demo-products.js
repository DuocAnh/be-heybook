'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('products', [
      {
        id: 1,
        category_id: 1,
        name: 'Harry Potter và Hòn đá Phù thủy',
        price: 150000,
        discount: 10.00,
        stock: 50,
        description: 'Cuốn sách đầu tiên trong series Harry Potter của J.K. Rowling',
        cover_image_url: 'https://example.com/harry-potter-1.jpg',
        dimension: '19.5 x 13 cm',
        type: 'BOOK',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        category_id: 1,
        name: 'Đắc Nhân Tâm',
        price: 89000,
        discount: 15.00,
        stock: 100,
        description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử',
        cover_image_url: 'https://example.com/dac-nhan-tam.jpg',
        dimension: '20 x 14 cm',
        type: 'BOOK',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        category_id: 1,
        name: 'Sapiens: Lược sử loài người',
        price: 299000,
        discount: 20.00,
        stock: 30,
        description: 'Tác phẩm của Yuval Noah Harari về lịch sử nhân loại',
        cover_image_url: 'https://example.com/sapiens.jpg',
        dimension: '21 x 14 cm',
        type: 'BOOK',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        category_id: 1,
        name: 'Tôi thấy hoa vàng trên cỏ xanh',
        price: 85000,
        discount: 0.00,
        stock: 75,
        description: 'Tiểu thuyết của Nguyễn Nhật Ánh',
        cover_image_url: 'https://example.com/hoa-vang-co-xanh.jpg',
        dimension: '18 x 13 cm',
        type: 'BOOK',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        category_id: 1,
        name: 'Atomic Habits',
        price: 199000,
        discount: 25.00,
        stock: 40,
        description: 'Sách về xây dựng thói quen tích cực',
        cover_image_url: 'https://example.com/atomic-habits.jpg',
        dimension: '20 x 13 cm',
        type: 'BOOK',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        category_id: 2,
        name: 'Bút bi Thiên Long TL-027',
        price: 5000,
        discount: 0.00,
        stock: 200,
        description: 'Bút bi cao cấp viết mượt',
        cover_image_url: 'https://example.com/but-bi-tl027.jpg',
        dimension: '14 cm',
        type: 'STATIONERY',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        category_id: 2,
        name: 'Tập vở 200 trang ô li',
        price: 15000,
        discount: 5.00,
        stock: 150,
        description: 'Tập vở chất lượng cao',
        cover_image_url: 'https://example.com/tap-vo-200.jpg',
        dimension: '25 x 18 cm',
        type: 'STATIONERY',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 8,
        category_id: 3,
        name: 'Bộ compa học sinh',
        price: 45000,
        discount: 10.00,
        stock: 80,
        description: 'Bộ dụng cụ vẽ hình học đầy đủ',
        cover_image_url: 'https://example.com/bo-compa.jpg',
        dimension: '20 x 15 cm',
        type: 'STATIONERY',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        category_id: 3,
        name: 'Thước kẻ 30cm',
        price: 8000,
        discount: 0.00,
        stock: 120,
        description: 'Thước nhựa trong suốt chất lượng cao',
        cover_image_url: 'https://example.com/thuoc-ke-30cm.jpg',
        dimension: '30 cm',
        type: 'STATIONERY',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {})
  }
}
