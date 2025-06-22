import express from 'express'
import { cartController } from '~/controllers/cartController'
import { cartValidation } from '~/validations/cartValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Tất cả routes cart đều cần authentication
Router.use(authMiddleware.isAuthorized)

// Get cart - Lấy giỏ hàng hiện tại
Router.route('/').get(cartController.getCart)

// Add to cart - Thêm sản phẩm vào giỏ hàng
Router.route('/add').post(cartValidation.addToCart, cartController.addToCart)

// Update cart item - Cập nhật số lượng sản phẩm trong giỏ hàng
Router.route('/items/:id').put(cartValidation.updateCartItem, cartController.updateCartItem)

// Remove from cart - Xóa sản phẩm khỏi giỏ hàng
Router.route('/items/:id').delete(cartController.removeFromCart)

// Clear cart - Xóa toàn bộ giỏ hàng
Router.route('/clear').delete(cartController.clearCart)

// Apply coupon - Áp dụng mã giảm giá
Router.route('/coupon').post(cartValidation.applyCoupon, cartController.applyCoupon)

// Remove coupon - Xóa mã giảm giá
Router.route('/coupon').delete(cartController.removeCoupon)

export const cartRoute = Router
