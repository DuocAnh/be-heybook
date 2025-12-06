'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'address', {
      allowNull: true,
      type: Sequelize.STRING(500)
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'address')
  }
}
