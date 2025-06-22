'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('product_images', [
      { product_id: 1, image_url: 'https://example.com/harry-potter-1-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 1, image_url: 'https://example.com/harry-potter-1-img2.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 2, image_url: 'https://example.com/dac-nhan-tam-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 3, image_url: 'https://example.com/sapiens-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 3, image_url: 'https://example.com/sapiens-img2.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 4, image_url: 'https://example.com/hoa-vang-co-xanh-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 5, image_url: 'https://example.com/atomic-habits-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 6, image_url: 'https://example.com/but-bi-tl027-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 7, image_url: 'https://example.com/tap-vo-200-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 8, image_url: 'https://example.com/bo-compa-img1.jpg', created_at: new Date(), updated_at: new Date() },
      { product_id: 9, image_url: 'https://example.com/thuoc-ke-30cm-img1.jpg', created_at: new Date(), updated_at: new Date() }
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_images', null, {})
  }
}
