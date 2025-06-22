import User from '~/models/User'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import ApiError from '~/utils/ApiError'
import { JwtProvider } from '~/providers/JwtProvider'
import { pickUser } from '~/utils/formatters'
import { env } from '~/config/environment'
import { OAuth2Client } from 'google-auth-library'
import { Op } from 'sequelize'

const register = async (reqBody) => {
  try {
    const existUser = await User.findOne({
      where: { email: reqBody.email }
    })
    if (existUser) {
      throw new ApiError(409, 'Email already exists!')
    }

    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm càng lâu
      userName: nameFromEmail,
      verifyToken: uuidv4(),
      isActive: false,
      role: 'CLIENT'
    }
    const createdUser = await User.create(newUser)

    return createdUser.toJSON()
  } catch (error) {
    throw new Error(error.message)
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await User.findOne({
      where: { email: reqBody.email }
    })

    if (!existUser) throw new ApiError(406, 'Email hoặc mật khẩu không chính xác!')

    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(406, 'Email hoặc mật khẩu không chính xác!')
    }
    // Tạo token đăng nhập trả về phía FE
    // Tạo thông tin đính kèm JWT token bao gồm _id và email user
    const userInfo = {
      id: existUser.id,
      email: existUser.email
    }
    // Tạo ra 2 loại token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      15
      // env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const getProfile = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verifyToken'] }
    })

    if (!user) {
      throw new ApiError(404, 'User not found!')
    }

    return pickUser(user)
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã mã refresh token xem nó hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // Đoạn này chỉ lấy thông tin unique để tạo accessToken mới
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE, // Chuỗi ký accessToken
      // 5
      env.ACCESS_TOKEN_LIFE // Thời gian sống của accessToken
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const googleLogin = async (googleToken) => {
  try {
    // Nếu không có GOOGLE_CLIENT_ID, ném lỗi
    if (!env.GOOGLE_CLIENT_ID) {
      throw new ApiError(500, 'Google Client ID not configured')
    }

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

    // Xác thực Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    if (!email) {
      throw new ApiError(400, 'Cannot get email from Google token')
    }

    // Kiểm tra user đã tồn tại chưa
    let existUser = await User.findOne({
      where: { email: email }
    })

    // Nếu chưa tồn tại, tạo user mới
    if (!existUser) {
      const newUser = {
        email: email,
        password: bcryptjs.hashSync(uuidv4(), 8), // Random password cho Google user
        userName: name || email.split('@')[0],
        avatar: picture || null,
        verifyToken: 'google_verified',
        isActive: true, // Google user mặc định đã active
        role: 'CLIENT'
      }
      existUser = await User.create(newUser)
    }

    // Tạo token đăng nhập
    const userInfo = {
      id: existUser.id,
      email: existUser.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(401, 'Invalid Google token')
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await User.findByPk(userId)
    if (!existUser) {
      throw new ApiError(404, 'User not found!')
    }

    const updateData = {}
    if (reqBody.userName) updateData.userName = reqBody.userName
    if (reqBody.address !== undefined) updateData.address = reqBody.address
    if (reqBody.email && reqBody.email !== existUser.email) {
      // Kiểm tra email trùng lặp
      const emailExists = await User.findOne({
        where: { email: reqBody.email }
      })
      if (emailExists) {
        throw new ApiError(409, 'Email already exists!')
      }
      updateData.email = reqBody.email
    }

    // Xử lý avatar nếu có file upload
    if (userAvatarFile) {
      // Import UploadImageProvider nếu chưa có
      const { UploadImageProvider } = await import('~/providers/UploadImageProvider')
      const uploadResult = await UploadImageProvider.streamUpload(userAvatarFile.buffer, 'users')
      updateData.avatar = uploadResult.secure_url
    }

    await User.update(updateData, {
      where: { id: userId }
    })

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verifyToken'] }
    })

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

// Admin Functions
const getAllUsers = async (page = 1, limit = 10, searchTerm = '') => {
  try {
    const offset = (page - 1) * limit

    const whereClause = {}
    if (searchTerm) {
      whereClause[Op.or] = [
        { email: { [Op.like]: `%${searchTerm}%` } },
        { userName: { [Op.like]: `%${searchTerm}%` } }
      ]
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'verifyToken'] }
    })

    return {
      data: rows,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    }
  } catch (error) {
    throw error
  }
}

const createUserByAdmin = async (reqBody) => {
  try {
    const existUser = await User.findOne({
      where: { email: reqBody.email }
    })
    if (existUser) {
      throw new ApiError(409, 'Email already exists!')
    }

    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      userName: reqBody.userName || reqBody.email.split('@')[0],
      avatar: reqBody.avatar || null,
      address: reqBody.address || null,
      verifyToken: uuidv4(),
      isActive: reqBody.isActive !== undefined ? reqBody.isActive : true,
      role: reqBody.role || 'CLIENT'
    }

    const createdUser = await User.create(newUser)
    const userResponse = createdUser.toJSON()
    delete userResponse.password
    delete userResponse.verifyToken

    return userResponse
  } catch (error) {
    throw error
  }
}

const updateUserByAdmin = async (userId, reqBody) => {
  try {
    const existUser = await User.findByPk(userId)
    if (!existUser) {
      throw new ApiError(404, 'User not found!')
    }

    // Kiểm tra email trùng lặp nếu có thay đổi email
    if (reqBody.email && reqBody.email !== existUser.email) {
      const emailExists = await User.findOne({
        where: { email: reqBody.email }
      })
      if (emailExists) {
        throw new ApiError(409, 'Email already exists!')
      }
    }

    const updateData = {}
    if (reqBody.email) updateData.email = reqBody.email
    if (reqBody.userName) updateData.userName = reqBody.userName
    if (reqBody.avatar) updateData.avatar = reqBody.avatar
    if (reqBody.address !== undefined) updateData.address = reqBody.address
    if (reqBody.isActive !== undefined) updateData.isActive = reqBody.isActive
    if (reqBody.role) {
      const validRoles = ['CLIENT', 'USER', 'ADMIN']
      if (!validRoles.includes(reqBody.role)) {
        throw new ApiError(400, 'Invalid role! Valid roles are: CLIENT, USER, ADMIN')
      }
      updateData.role = reqBody.role
    }
    if (reqBody.password) {
      updateData.password = bcryptjs.hashSync(reqBody.password, 8)
    }

    await User.update(updateData, {
      where: { id: userId }
    })

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verifyToken'] }
    })

    return updatedUser
  } catch (error) {
    throw error
  }
}

const deleteUser = async (userId) => {
  try {
    const existUser = await User.findByPk(userId)
    if (!existUser) {
      throw new ApiError(404, 'User not found!')
    }

    // Hard delete - xóa hoàn toàn khỏi database
    await User.destroy({
      where: { id: userId }
    })

    return { message: 'User has been deleted permanently' }
  } catch (error) {
    throw error
  }
}

const updateProfile = async (userId, reqBody) => {
  try {
    const existUser = await User.findByPk(userId)
    if (!existUser) {
      throw new ApiError(404, 'User not found!')
    }

    const updateData = {}

    if (reqBody.userName) {
      updateData.userName = reqBody.userName
    }

    if (reqBody.address !== undefined) {
      updateData.address = reqBody.address
    }

    if (reqBody.avatar) {
      updateData.avatar = reqBody.avatar
    }

    if (reqBody.email && reqBody.email !== existUser.email) {
      const emailExists = await User.findOne({
        where: { email: reqBody.email }
      })
      if (emailExists) {
        throw new ApiError(409, 'Email already exists!')
      }
      updateData.email = reqBody.email
    }

    await User.update(updateData, {
      where: { id: userId }
    })

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verifyToken'] }
    })

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const updatePassword = async (userId, reqBody) => {
  try {
    const { currentPassword, newPassword } = reqBody

    const existUser = await User.findByPk(userId)
    if (!existUser) {
      throw new ApiError(404, 'User not found!')
    }

    if (!bcryptjs.compareSync(currentPassword, existUser.password)) {
      throw new ApiError(400, 'Current password is incorrect!')
    }

    if (bcryptjs.compareSync(newPassword, existUser.password)) {
      throw new ApiError(400, 'New password must be different from current password!')
    }

    const hashedNewPassword = bcryptjs.hashSync(newPassword, 8)

    await User.update({ password: hashedNewPassword }, { where: { id: userId } })

    return { message: 'Password updated successfully' }
  } catch (error) {
    throw error
  }
}

export const userService = {
  register,
  login,
  refreshToken,
  googleLogin,
  update,
  // Admin functions
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUser,
  // New user profile functions
  updateProfile,
  updatePassword,
  getProfile
}
