import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// User routes - cần authentication
Router.use(authMiddleware.isAuthorized)

// Create order from cart - Tạo đơn hàng từ giỏ hàng
Router.route('/').post(orderValidation.createOrder, orderController.createOrder)

// Get user's orders - Lấy danh sách đơn hàng của user
Router.route('/').get(orderController.getUserOrders)

// Get specific order - Lấy chi tiết đơn hàng
Router.route('/:id').get(orderController.getOrderById)

// Get order by order number - Lấy đơn hàng theo mã đơn hàng
Router.route('/number/:orderNumber').get(orderController.getOrderByNumber)

// Cancel order - Hủy đơn hàng (không cần lý do)
Router.route('/:id/cancel').put(orderController.cancelOrder)

// Update payment status by order number - Cập nhật trạng thái thanh toán theo mã đơn hàng
Router.route('/payment/:orderNumber').put(orderController.updatePaymentStatusByOrderNumber)

// Admin routes - cần quyền admin hoặc user
Router.route('/admin/all').get(
  authMiddleware.isAuthorized,
  authMiddleware.isAdminOrUser,
  orderController.getAllOrders
)

Router.route('/admin/:id').get(
  authMiddleware.isAuthorized,
  authMiddleware.isAdminOrUser,
  orderController.getOrderByIdAdmin
)

Router.route('/admin/:id/status').put(
  authMiddleware.isAuthorized,
  authMiddleware.isAdminOrUser,
  orderValidation.updateOrderStatus,
  orderController.updateOrderStatus
)
Router.route('/admin/revenue/last-6-months').get(
  authMiddleware.isAuthorized,
  authMiddleware.isAdminOrUser,
  orderController.getRevenueLast6Months
)
Router.route('/admin/stats/current-month').get(
  authMiddleware.isAuthorized,
  authMiddleware.isAdminOrUser,
  orderController.getCurrentMonthStats
)

export const orderRoute = Router
