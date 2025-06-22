const { exec } = require('child_process')

// Danh sách seeders theo thứ tự dependencies
const seeders = [
  { name: 'Categories', file: '20250616000001-demo-categories.js' },
  { name: 'Book Genres', file: '20250616000002-demo-book-genres.js' },
  { name: 'Products', file: '20250616000003-demo-products.js' },
  { name: 'Product Images', file: '20250616000006-demo-product-images.js' },
  { name: 'Users', file: '20250616000007-demo-users.js' },
  { name: 'Reviews', file: '20250620000001-demo-reviews.js' },
  { name: 'Coupons', file: '20250620000008-demo-coupons.js' },
  { name: 'Carts', file: '20250620000009-demo-carts.js' },
  { name: 'Cart Items', file: '20250620000011-demo-cart-items.js' },
  { name: 'Orders', file: '20250620000012-demo-orders.js' },
  { name: 'Order Items', file: '20250620000013-demo-order-items.js' }
]

function runSeeder(seederFile) {
  return new Promise((resolve, reject) => {
    const command = `npx sequelize-cli db:seed --seed ${seederFile}`
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function runAllSeeders() {
  // eslint-disable-next-line no-console
  console.log('🌱 Bắt đầu chạy seeders...\n')
  
  for (let i = 0; i < seeders.length; i++) {
    const seeder = seeders[i]
    try {
      // eslint-disable-next-line no-console
      console.log(`${i + 1}. Seeding ${seeder.name}...`)
      await runSeeder(seeder.file)
      // eslint-disable-next-line no-console
      console.log(`✅ ${seeder.name} - Hoàn thành\n`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`❌ Lỗi khi chạy seeder ${seeder.name}:`, error.message)
      process.exit(1)
    }
  }
  
  // eslint-disable-next-line no-console
  console.log('✅ Hoàn thành seeding tất cả bảng!')
  // eslint-disable-next-line no-console
  console.log('📊 Dữ liệu demo đã được tạo:')
  // eslint-disable-next-line no-console
  console.log('   - Categories: 4 danh mục')
  // eslint-disable-next-line no-console
  console.log('   - Book Genres: 10 thể loại sách')
  // eslint-disable-next-line no-console
  console.log('   - Products: ~7 sản phẩm')
  // eslint-disable-next-line no-console
  console.log('   - Users: 3 người dùng (1 admin, 2 user)')
  // eslint-disable-next-line no-console
  console.log('   - Reviews: Đánh giá sản phẩm')
  // eslint-disable-next-line no-console
  console.log('   - Coupons: 5 mã giảm giá')
  // eslint-disable-next-line no-console
  console.log('   - Carts & Cart Items: Giỏ hàng với các trạng thái khác nhau')
  // eslint-disable-next-line no-console
  console.log('   - Orders & Order Items: 5 đơn hàng với các trạng thái khác nhau')
}

// Chạy seeders
// eslint-disable-next-line no-console
runAllSeeders().catch(console.error)
