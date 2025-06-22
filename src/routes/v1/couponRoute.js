import express from 'express'
import { couponValidation } from '~/validations/couponValidation'
import { couponController } from '~/controllers/couponController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(couponController.getCoupons)
  .post(authMiddleware.isAuthorized, couponValidation.createNew, couponController.createNew)

Router.route('/:id')
  .get(couponController.getCouponById)
  .put(authMiddleware.isAuthorized, couponValidation.update, couponController.update)
  .delete(authMiddleware.isAuthorized, couponController.deleteById)

Router.route('/code/:code').get(couponController.getCouponByCode)

Router.route('/apply').post(couponValidation.applyCoupon, couponController.applyCoupon)

export const couponRoute = Router
