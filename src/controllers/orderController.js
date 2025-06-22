import { orderService } from '~/services/orderService'

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id
    const orderData = req.body
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1'

    const order = await orderService.createOrderFromCart(userId, orderData, clientIp)

    // Kiểm tra nếu có paymentUrl (VNPay) thì trả về message khác
    const message = order.paymentUrl ? 'Đặt hàng thành công! Vui lòng thanh toán.' : 'Đặt hàng thành công!'

    res.status(201).json({
      message,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const userId = req.user.id

    const order = await orderService.getOrderById(orderId, userId)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const getOrderByNumber = async (req, res, next) => {
  try {
    const orderNumber = req.params.orderNumber
    const userId = req.user.id

    const order = await orderService.getOrderByNumber(orderNumber, userId)
    res.status(200).json({
      data: order
    })
  } catch (error) {
    next(error)
  }
}

const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { page, itemsPerPage } = req.query

    const orders = await orderService.getUserOrders(userId, page, itemsPerPage)
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

const cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const userId = req.user.id

    const order = await orderService.cancelOrder(orderId, userId)
    res.status(200).json({
      message: 'Hủy đơn hàng thành công!',
      data: order
    })
  } catch (error) {
    next(error)
  }
}

// Admin controllers
const getAllOrders = async (req, res, next) => {
  try {
    const { page, itemsPerPage, status, paymentStatus, paymentMethod, search } = req.query

    const filters = {
      status,
      paymentStatus,
      paymentMethod,
      search
    }

    const orders = await orderService.getAllOrders(page, itemsPerPage, filters)
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

const getOrderByIdAdmin = async (req, res, next) => {
  try {
    const orderId = req.params.id

    const order = await orderService.getOrderById(orderId)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id
    const { status } = req.body

    const order = await orderService.updateOrderStatus(orderId, status)
    res.status(200).json({
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      data: order
    })
  } catch (error) {
    next(error)
  }
}

// VNPay payment controllers
const updatePaymentStatusByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params
    const { responseCode, transactionNo, amount, payDate } = req.body

    const result = await orderService.updatePaymentStatusByOrderNumber(
      orderNumber,
      responseCode,
      transactionNo,
      amount,
      payDate
    )

    res.status(200).json({
      message: 'Cập nhật trạng thái thanh toán thành công!',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatusByOrderNumber
}
