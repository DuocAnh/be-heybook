'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Sách',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Văn phòng phẩm',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Dụng cụ học tập',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Phụ kiện',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {})
  }
}
