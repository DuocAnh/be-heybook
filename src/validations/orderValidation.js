import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createOrder = async (req, res, next) => {
  const correctCondition = Joi.object({
    shippingAddress: Joi.string().trim().min(10).max(500).required().messages({
      'string.base': 'Địa chỉ giao hàng phải là chuỗi',
      'string.empty': 'Địa chỉ giao hàng không được để trống',
      'string.min': 'Địa chỉ giao hàng phải có ít nhất 10 ký tự',
      'string.max': 'Địa chỉ giao hàng không được vượt quá 500 ký tự',
      'any.required': 'Địa chỉ giao hàng là bắt buộc'
    }),
    recipientName: Joi.string().trim().min(1).max(100).required().messages({
      'string.base': 'Họ tên người nhận phải là chuỗi',
      'string.empty': 'Họ tên người nhận không được để trống',
      'string.min': 'Họ tên người nhận không được để trống',
      'string.max': 'Họ tên người nhận không được vượt quá 100 ký tự',
      'any.required': 'Họ tên người nhận là bắt buộc'
    }),
    recipientEmail: Joi.string().trim().email().max(255).required().messages({
      'string.base': 'Email người nhận phải là chuỗi',
      'string.empty': 'Email người nhận không được để trống',
      'string.email': 'Email người nhận không đúng định dạng',
      'string.max': 'Email người nhận không được vượt quá 255 ký tự',
      'any.required': 'Email người nhận là bắt buộc'
    }),
    recipientPhone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10,11}$/)
      .required()
      .messages({
        'string.base': 'Số điện thoại người nhận phải là chuỗi',
        'string.empty': 'Số điện thoại người nhận không được để trống',
        'string.pattern.base': 'Số điện thoại người nhận phải có 10-11 chữ số',
        'any.required': 'Số điện thoại người nhận là bắt buộc'
      }),
    paymentMethod: Joi.string().valid('COD', 'VNPAY').required().messages({
      'string.base': 'Phương thức thanh toán phải là chuỗi',
      'any.only': 'Phương thức thanh toán không hợp lệ (chỉ chấp nhận COD hoặc VNPAY)',
      'any.required': 'Phương thức thanh toán là bắt buộc'
    }),
    notes: Joi.string().trim().max(1000).optional().allow('').messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.max': 'Ghi chú không được vượt quá 1000 ký tự'
    }),
    saveAddress: Joi.boolean().optional().default(false).messages({
      'boolean.base': 'Lưu địa chỉ phải là boolean'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map((detail) => detail.message)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const updateOrderStatus = async (req, res, next) => {
  const correctCondition = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')
      .required()
      .messages({
        'string.base': 'Trạng thái phải là chuỗi',
        'any.only': 'Trạng thái không hợp lệ',
        'any.required': 'Trạng thái là bắt buộc'
      })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map((detail) => detail.message)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const cancelOrder = async (req, res, next) => {
  // Không cần validation gì cả vì không cần lý do hủy
  next()
}

export const orderValidation = {
  createOrder,
  updateOrderStatus,
  cancelOrder
}
