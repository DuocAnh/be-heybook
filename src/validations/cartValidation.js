import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const addToCart = async (req, res, next) => {
  const correctCondition = Joi.object({
    productId: Joi.number().integer().min(1).required().messages({
      'number.base': 'Product ID phải là số',
      'number.integer': 'Product ID phải là số nguyên',
      'number.min': 'Product ID phải lớn hơn 0',
      'any.required': 'Product ID là bắt buộc'
    }),
    quantity: Joi.number().integer().min(1).max(999).optional().default(1).messages({
      'number.base': 'Số lượng phải là số',
      'number.integer': 'Số lượng phải là số nguyên',
      'number.min': 'Số lượng phải lớn hơn 0',
      'number.max': 'Số lượng không được vượt quá 999'
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

const updateCartItem = async (req, res, next) => {
  const correctCondition = Joi.object({
    quantity: Joi.number().integer().min(1).max(999).required().messages({
      'number.base': 'Số lượng phải là số',
      'number.integer': 'Số lượng phải là số nguyên',
      'number.min': 'Số lượng phải lớn hơn 0',
      'number.max': 'Số lượng không được vượt quá 999',
      'any.required': 'Số lượng là bắt buộc'
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

const applyCoupon = async (req, res, next) => {
  const correctCondition = Joi.object({
    couponCode: Joi.string().trim().min(1).max(50).required().messages({
      'string.base': 'Mã giảm giá phải là chuỗi',
      'string.empty': 'Mã giảm giá không được để trống',
      'string.min': 'Mã giảm giá không được để trống',
      'string.max': 'Mã giảm giá không được vượt quá 50 ký tự',
      'any.required': 'Mã giảm giá là bắt buộc'
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

export const cartValidation = {
  addToCart,
  updateCartItem,
  applyCoupon
}
