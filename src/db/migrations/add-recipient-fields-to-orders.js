module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'recipient_name', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '',
      comment: 'Name of the person receiving the order'
    })

    await queryInterface.addColumn('orders', 'recipient_email', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '',
      comment: 'Email of the person receiving the order'
    })

    await queryInterface.addColumn('orders', 'recipient_phone', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: '',
      comment: 'Phone number of the person receiving the order'
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'recipient_name')
    await queryInterface.removeColumn('orders', 'recipient_email')
    await queryInterface.removeColumn('orders', 'recipient_phone')
  }
}
