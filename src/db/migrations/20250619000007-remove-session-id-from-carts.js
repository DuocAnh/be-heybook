'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    try {
      // Remove session_id index from carts table
      await queryInterface.removeIndex('carts', ['session_id'])
    } catch {
      // Index might not exist
    }
    
    try {
      // Remove session_id column from carts table
      await queryInterface.removeColumn('carts', 'session_id')
    } catch {
      // Column might not exist
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back session_id column and index
    await queryInterface.addColumn('carts', 'session_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'For guest users'
    })
    await queryInterface.addIndex('carts', ['session_id'])
  }
}
