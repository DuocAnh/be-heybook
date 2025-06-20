import { userService } from '~/services/userService'
import ms from 'ms'
import { pickUser } from '~/utils/formatters'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.register(req.body)
    res.status(201).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(200).json(result)
  } catch {
    next()
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    /**
     * Xử lý trả về HTTP-only cookie cho phía trình duyệt
     * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
     * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án.
     * Lưu ý thời gian sống của cookie khác với cái thời gian sống của token
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: ms('14 days')
    })

    res.status(200).json(pickUser(result))
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    // Xóa cookie – đơn giản là làm ngược lại so với việc gán cookie ở hàm login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({ loggedOut: true })
  } catch {
    next()
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: ms('14 days')
    })

    res.status(200).json(result)
  } catch {
    next(new ApiError(403, 'Please Sign In! (Error from refresh Token)'))
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    // console.log('Controller > userAvatarFile: ', userAvatarFile)
    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(200).json(updatedUser)
  } catch {
    next()
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}
