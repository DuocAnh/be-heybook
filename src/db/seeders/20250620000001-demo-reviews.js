'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Tạo một số đánh giá mẫu
    await queryInterface.bulkInsert('reviews', [
      {
        user_id: 1,
        product_id: 1,
        rating: 5,
        comment: 'Sách rất hay, nội dung bổ ích và dễ hiểu. Tôi rất thích!',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        product_id: 1,
        rating: 4,
        comment: 'Nội dung tốt nhưng có một số phần hơi khó hiểu.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3,
        product_id: 1,
        rating: 5,
        comment: 'Đây là một cuốn sách tuyệt vời! Rất khuyến khích mọi người đọc.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 1,
        product_id: 2,
        rating: 4,
        comment: 'Sách hay, tác giả viết rất cuốn hút.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        product_id: 3,
        rating: 3,
        comment: 'Sách bình thường, không có gì đặc biệt.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3,
        product_id: 4,
        rating: 5,
        comment: 'Bút viết rất mượt, giá cả hợp lý.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 1,
        product_id: 4,
        rating: 4,
        comment: 'Chất lượng tốt, đóng gói cẩn thận.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        product_id: 5,
        rating: 4,
        comment: 'Tập vở chất lượng, giấy dày và mịn.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', null, {})
  }
}
