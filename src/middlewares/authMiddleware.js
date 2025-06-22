import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import User from '~/models/User'
import ApiError from '~/utils/ApiError'

/**
 * Middleware xác thực người dùng đã đăng nhập
 * Kiểm tra JWT token từ cookie và gán thông tin user vào req.user
 */
const isAuthorized = async (req, res, next) => {
  try {
    // Lấy accessToken từ cookie
    const clientAccessToken = req.cookies?.accessToken

    // Nếu không có token, trả về lỗi unauthorized
    if (!clientAccessToken) {
      throw new ApiError(401, 'Unauthorized! (token not found)')
    }

    // Verify token
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    // Lấy thông tin user từ database
    const user = await User.findOne({
      where: {
        id: accessTokenDecoded.id,
        email: accessTokenDecoded.email
      }
    })

    if (!user) {
      throw new ApiError(401, 'User not found!')
    }

    // Gán thông tin user vào req để các middleware/controller tiếp theo sử dụng
    req.user = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
      isActive: user.isActive
    }

    // Lưu thông tin decode để backward compatibility
    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    // Nếu là lỗi JWT (token hết hạn, không hợp lệ, etc.)
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token!'))
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(410, 'Need to refresh token.'))
    } else {
      next(error)
    }
  }
}

/**
 * Middleware kiểm tra quyền admin
 * Phải được sử dụng sau middleware isAuthorized
 */
const isAdmin = async (req, res, next) => {
  try {
    // Kiểm tra xem req.user có tồn tại không (đảm bảo đã qua middleware isAuthorized)
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized! Please login first.')
    }

    // Kiểm tra role của user
    if (req.user.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden! Admin access required.')
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware kiểm tra quyền admin staff (ADMIN hoặc USER)
 * Phải được sử dụng sau middleware isAuthorized
 */
const isAdminOrUser = async (req, res, next) => {
  try {
    // Kiểm tra xem req.user có tồn tại không (đảm bảo đã qua middleware isAuthorized)
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized! Please login first.')
    }

    // Kiểm tra role của user - cho phép ADMIN hoặc USER
    if (req.user.role !== 'ADMIN' && req.user.role !== 'USER') {
      throw new ApiError(403, 'Forbidden! Admin or User access required.')
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const authMiddleware = {
  isAuthorized,
  isAdmin,
  isAdminOrUser
}
