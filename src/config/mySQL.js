import { Sequelize } from 'sequelize'
import { env } from '~/config/environment'

// Tạo đối tượng Sequelize với cấu hình timezone và chuyển đổi bằng
const sequelize = new Sequelize(env.DATABASE_NAME, 'root', env.DATABASE_PASSWORD, {
  host: env.APP_HOST,
  port: env.DATABASE_PORT,
  dialect: 'mysql',
  timezone: '+07:00',
  dialectOptions: {
    dateStrings: true, // Buộc trả về date/time như string
    typeCast(field, next) {
      // Chỉ typeCast cho DATETIME/TIMESTAMP
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        return field.string()
      }
      return next()
    }
  }
})

// Hàm kiểm tra kết nối
export const CONNECT_DB = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

export const CLOSE_DB = async () => {
  try {
    await sequelize.close()
    console.log('Database connection closed successfully.')
  } catch (error) {
    console.error('Error while closing database connection:', error)
  }
}
export default sequelize
