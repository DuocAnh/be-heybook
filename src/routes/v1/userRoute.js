import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// User routes
Router.route('/register').post(userValidation.createNew, userController.createNew)

Router.route('/login').post(userValidation.login, userController.login)

Router.route('/google-login').post(userValidation.googleLogin, userController.googleLogin)

Router.route('/logout').delete(userController.logout)

Router.route('/refresh-token').get(userController.refreshToken)

Router.route('/profile')
  .get(authMiddleware.isAuthorized, userController.getProfile)
  .put(authMiddleware.isAuthorized, userValidation.update, userController.update)

// New profile management routes
Router.route('/profile/update').put(
  authMiddleware.isAuthorized,
  userValidation.updateProfile,
  userController.updateProfile
)

Router.route('/profile/change-password').put(
  authMiddleware.isAuthorized,
  userValidation.updatePassword,
  userController.updatePassword
)

// Admin routes - yêu cầu xác thực và quyền admin
Router.route('/admin/users')
  .get(authMiddleware.isAuthorized, authMiddleware.isAdmin, userController.getAllUsers)
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.createUserByAdmin,
    userController.createUserByAdmin
  )

Router.route('/admin/users/:userId')
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateUserId,
    userValidation.updateUserByAdmin,
    userController.updateUserByAdmin
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateUserId,
    userController.deleteUser
  )

export const userRoute = Router
