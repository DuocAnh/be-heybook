'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('book_genres', [
      { name: 'Tiểu thuyết', created_at: new Date(), updated_at: new Date() },
      { name: 'Khoa học viễn tưởng', created_at: new Date(), updated_at: new Date() },
      { name: 'Lãng mạn', created_at: new Date(), updated_at: new Date() },
      { name: 'Trinh thám', created_at: new Date(), updated_at: new Date() },
      { name: 'Kinh dị', created_at: new Date(), updated_at: new Date() },
      { name: 'Phiêu lưu', created_at: new Date(), updated_at: new Date() },
      { name: 'Tâm lý học', created_at: new Date(), updated_at: new Date() },
      { name: 'Kinh tế', created_at: new Date(), updated_at: new Date() },
      { name: 'Công nghệ', created_at: new Date(), updated_at: new Date() },
      { name: 'Lịch sử', created_at: new Date(), updated_at: new Date() },
      { name: 'Văn học cổ điển', created_at: new Date(), updated_at: new Date() },
      { name: 'Self-help', created_at: new Date(), updated_at: new Date() },
      { name: 'Thiếu nhi', created_at: new Date(), updated_at: new Date() }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('book_genres', null, {})
  }
}
