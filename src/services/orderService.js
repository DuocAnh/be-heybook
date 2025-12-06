import sequelize from '~/config/mySQL'
import { Op } from 'sequelize'
import { Order, OrderItem, Cart, CartItem, Product, User, Coupon, Address } from '~/models'
import ApiError from '~/utils/ApiError'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import VNPayProvider from '~/providers/VNPayProvider'
import { addressService } from './addressService'

const generateOrderNumber = async () => {
  const year = new Date().getFullYear()
  const prefix = `HB${year}`

  // Tìm order number cuối cùng trong năm
  const lastOrder = await Order.findOne({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['orderNumber', 'DESC']]
  })

  let nextNumber = 1
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace(prefix, ''))
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`
}

const createOrderFromCart = async (userId, orderData, clientIp = '127.0.0.1') => {
  try {
    const {
      recipientName,
      recipientEmail,
      recipientPhone,
      shippingAddress,
      paymentMethod,
      notes,
      saveAddress = false
    } = orderData

    // Validate recipient information
    if (!recipientName || !recipientEmail || !recipientPhone) {
      throw new ApiError(400, 'Thông tin người nhận không đầy đủ!')
    }

    // Validate shipping address
    if (!shippingAddress) {
      throw new ApiError(400, 'Vui lòng nhập địa chỉ giao hàng!')
    }

    // Lấy cart hiện tại
    const cart = await Cart.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false
        }
      ]
    })

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Giỏ hàng trống!')
    }

    // Kiểm tra stock cho tất cả sản phẩm
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new ApiError(400, `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} trong kho!`)
      }
    }

    const result = await sequelize.transaction(async (t) => {
      // Generate order number
      const orderNumber = await generateOrderNumber()

      // Tạo order
      const order = await Order.create(
        {
          orderNumber,
          userId,
          recipientName,
          recipientEmail,
          recipientPhone,
          subtotal: cart.totalAmount,
          discountAmount: cart.discountAmount,
          totalAmount: cart.finalAmount,
          couponId: cart.couponId,
          couponCode: cart.coupon?.code,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod,
          shippingAddress,
          notes
        },
        { transaction: t }
      )

      // Tạo order items và cập nhật stock
      for (const item of cart.items) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.coverImageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: item.totalPrice
          },
          { transaction: t }
        )

        // Giảm stock
        await Product.update(
          { stock: item.product.stock - item.quantity },
          { where: { id: item.productId }, transaction: t }
        )
      }

      // Cập nhật usage count cho coupon nếu có
      if (cart.couponId) {
        await Coupon.increment('usedCount', {
          by: 1,
          where: { id: cart.couponId },
          transaction: t
        })
      }

      // Chuyển cart sang trạng thái CONVERTED
      await cart.update({ status: 'CONVERTED' }, { transaction: t })

      return order
    })

    // Lưu địa chỉ nếu user yêu cầu
    if (saveAddress) {
      try {
        await addressService.createAddress(userId, {
          recipientName,
          recipientEmail,
          recipientPhone,
          address: shippingAddress,
          isDefault: false
        })
      } catch {
        // Không throw error nếu lưu địa chỉ thất bại
      }
    }

    // Trả về order với đầy đủ thông tin
    const orderResult = await getOrderById(result.id)

    // Nếu payment method là VNPAY, tạo payment URL
    if (paymentMethod === 'VNPAY') {
      const paymentUrl = VNPayProvider.createPaymentUrl({
        orderId: result.orderNumber,
        amount: result.totalAmount,
        orderInfo: `Thanh toán đơn hàng ${result.orderNumber}`,
        ipAddr: clientIp
      })

      return {
        ...orderResult.toJSON(),
        paymentUrl
      }
    }

    return orderResult
  } catch (error) {
    throw error
  }
}

const getOrderById = async (orderId, userId = null) => {
  try {
    const whereCondition = { id: orderId }
    if (userId) {
      whereCondition.userId = userId
    }

    const order = await Order.findOne({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'coverImageUrl', 'stock']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'userName', 'address']
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false,
          attributes: ['id', 'code', 'name', 'type', 'value']
        }
      ]
    })

    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng!')
    }

    return order
  } catch (error) {
    throw error
  }
}

const getUserOrders = async (userId, page = DEFAULT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE) => {
  try {
    const offset = (page - 1) * itemsPerPage

    const { rows: data, count } = await Order.findAndCountAll({
      where: { userId },
      limit: parseInt(itemsPerPage, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
      distinct: true,
      col: 'id',
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'coverImageUrl']
            }
          ]
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false,
          attributes: ['id', 'code', 'name']
        }
      ]
    })

    return {
      data,
      count,
      totalPages: Math.ceil(count / itemsPerPage),
      currentPage: parseInt(page)
    }
  } catch (error) {
    throw error
  }
}

const updateOrderStatus = async (orderId, status, userId = null) => {
  try {
    const whereCondition = { id: orderId }
    if (userId) {
      whereCondition.userId = userId
    }

    const order = await Order.findOne({ where: whereCondition })
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng!')
    }

    // Validate status transitions
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'RETURNED'],
      DELIVERED: ['RETURNED'],
      CANCELLED: [],
      RETURNED: []
    }

    if (!validTransitions[order.status].includes(status)) {
      throw new ApiError(400, `Không thể chuyển từ trạng thái ${order.status} sang ${status}!`)
    }

    const updateData = { status }

    // Set special timestamps
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
      // Nếu là COD và chuyển thành DELIVERED, tự động đánh dấu đã thanh toán
      if (order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING') {
        updateData.paymentStatus = 'PAID'
        updateData.paidAt = new Date()
      }
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
    }

    await order.update(updateData)
    return await getOrderById(orderId)
  } catch (error) {
    throw error
  }
}

const cancelOrder = async (orderId, userId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems'
        }
      ]
    })

    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng!')
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái PENDING hoặc CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new ApiError(400, 'Không thể hủy đơn hàng này!')
    }

    await sequelize.transaction(async (t) => {
      // Hoàn lại stock
      for (const item of order.orderItems) {
        await Product.increment('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t
        })
      }

      // Giảm usage count cho coupon nếu có
      if (order.couponId) {
        await Coupon.decrement('usedCount', {
          by: 1,
          where: { id: order.couponId },
          transaction: t
        })
      }

      // Cập nhật trạng thái đơn hàng
      await order.update(
        {
          status: 'CANCELLED',
          cancelledAt: new Date()
        },
        { transaction: t }
      )
    })

    return await getOrderById(orderId)
  } catch (error) {
    throw error
  }
}

// Admin functions
const getAllOrders = async (page = DEFAULT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, filters = {}) => {
  try {
    const offset = (page - 1) * itemsPerPage
    const whereCondition = {}

    // Apply filters
    if (filters.status) {
      whereCondition.status = filters.status
    }
    if (filters.paymentStatus) {
      whereCondition.paymentStatus = filters.paymentStatus
    }
    if (filters.paymentMethod) {
      whereCondition.paymentMethod = filters.paymentMethod
    }

    // Add search functionality
    if (filters.search) {
      whereCondition[Op.or] = [
        { orderNumber: { [Op.like]: `%${filters.search}%` } },
        { recipientName: { [Op.like]: `%${filters.search}%` } },
        { recipientEmail: { [Op.like]: `%${filters.search}%` } },
        { recipientPhone: { [Op.like]: `%${filters.search}%` } }
      ]
    }

    const { rows: data, count } = await Order.findAndCountAll({
      where: whereCondition,
      limit: parseInt(itemsPerPage, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
      distinct: true,
      col: 'id',
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'userName', 'address']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'coverImageUrl']
            }
          ]
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false,
          attributes: ['id', 'code', 'name']
        }
      ]
    })

    return {
      data,
      count,
      totalPages: Math.ceil(count / itemsPerPage),
      currentPage: parseInt(page)
    }
  } catch (error) {
    throw error
  }
}

const getOrderByNumber = async (orderNumber, userId) => {
  try {
    const order = await Order.findOne({
      where: {
        orderNumber,
        userId
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'coverImageUrl', 'stock']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'userName', 'address']
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false,
          attributes: ['id', 'code', 'name', 'type', 'value']
        }
      ]
    })

    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng!')
    }

    return order
  } catch (error) {
    throw error
  }
}

/**
 * Cập nhật trạng thái thanh toán theo mã đơn hàng (cho VNPay callback)
 */
const updatePaymentStatusByOrderNumber = async (
  orderNumber,
  responseCode,
  transactionNo,
  amount,
  payDate
) => {
  try {
    // Tìm đơn hàng theo orderNumber
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: OrderItem,
          as: 'orderItems'
        }
      ]
    })

    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng!')
    }

    // Kiểm tra số tiền
    const expectedAmount = order.totalAmount * 100 // VNPay amount format
    if (parseInt(amount) !== expectedAmount) {
      throw new ApiError(400, 'Số tiền không khớp!')
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      paymentStatus: responseCode === '00' ? 'PAID' : 'FAILED',
      vnpTransactionNo: transactionNo,
      vnpResponseCode: responseCode
    }

    // Xử lý theo kết quả thanh toán
    if (responseCode === '00') {
      // Thanh toán thành công
      // Parse payment date
      if (payDate) {
        // Format: yyyyMMddHHmmss
        const year = payDate.substring(0, 4)
        const month = payDate.substring(4, 6)
        const day = payDate.substring(6, 8)
        const hour = payDate.substring(8, 10)
        const minute = payDate.substring(10, 12)
        const second = payDate.substring(12, 14)
        updateData.paidAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
      }

      // Chuyển trạng thái đơn hàng sang CONFIRMED
      updateData.status = 'CONFIRMED'

      // Cập nhật đơn hàng
      await order.update(updateData)
    } else {
      // Thanh toán thất bại
      updateData.status = 'CANCELLED'
      updateData.cancelledAt = new Date()

      // Sử dụng transaction để đảm bảo tính nhất quán
      await sequelize.transaction(async (t) => {
        // Hoàn lại stock cho tất cả sản phẩm
        for (const item of order.orderItems) {
          await Product.increment('stock', {
            by: item.quantity,
            where: { id: item.productId },
            transaction: t
          })
        }

        // Giảm usage count cho coupon nếu có
        if (order.couponId) {
          await Coupon.decrement('usedCount', {
            by: 1,
            where: { id: order.couponId },
            transaction: t
          })
        }

        // Cập nhật trạng thái đơn hàng
        await order.update(updateData, { transaction: t })
      })
    }

    // Trả về đơn hàng đã cập nhật
    return await getOrderById(order.id)
  } catch (error) {
    throw error
  }
}

const getRevenueLast6Months = async () => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const revenueData = await Order.findAll({
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    where: {
      payment_status: 'PAID',
      created_at: {
        [Op.gte]: sixMonthsAgo
      }
    },
    group: [sequelize.literal("DATE_FORMAT(created_at, '%Y-%m')")],
    order: [sequelize.literal("DATE_FORMAT(created_at, '%Y-%m') ASC")]
  })

  return revenueData.map(row => ({
    month: row.get('month'),
    revenue: parseFloat(row.get('revenue'))
  }))
}
const getCurrentMonthStats = async () => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)

  const [totalOrders, successOrders, cancelledOrders, revenueData] = await Promise.all([
    Order.count({
      where: {
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }),
    Order.count({
      where: {
        payment_status: 'PAID',
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }),
    Order.count({
      where: {
        status: 'CANCELLED',
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    }),
    Order.sum('total_amount', {
      where: {
        payment_status: 'PAID',
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    })
  ])

  return {
    totalOrders,
    successOrders,
    cancelledOrders,
    revenue: revenueData || 0
  }
}



export const orderService = {
  createOrderFromCart,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderByNumber,
  updatePaymentStatusByOrderNumber,
  getRevenueLast6Months,
  getCurrentMonthStats
}
