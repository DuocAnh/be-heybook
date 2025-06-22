'use strict'
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword1 = await bcrypt.hash('admin123', 10)
    const hashedPassword2 = await bcrypt.hash('user123', 10)
    const hashedPassword3 = await bcrypt.hash('user456', 10)

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        email: 'admin@heybook.com',
        password: hashedPassword1,
        user_name: 'Admin',
        avatar: 'https://example.com/admin-avatar.jpg',
        is_active: true,
        verify_token: 'verified',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        email: 'user1@gmail.com',
        password: hashedPassword2,
        user_name: 'Nguyễn Văn A',
        avatar: 'https://example.com/user1-avatar.jpg',
        is_active: true,
        verify_token: 'verified',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        email: 'user2@gmail.com',
        password: hashedPassword3,
        user_name: 'Trần Thị B',
        avatar: null,
        is_active: true,
        verify_token: 'pending_verification_token',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {})
  }
}
