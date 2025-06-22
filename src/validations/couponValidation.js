import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().min(3).max(50).messages({
      'any.required': 'Mã giảm giá là bắt buộc',
      'string.min': 'Mã giảm giá phải có ít nhất 3 ký tự',
      'string.max': 'Mã giảm giá không được quá 50 ký tự'
    }),
    name: Joi.string().required().min(3).max(255).messages({
      'any.required': 'Tên mã giảm giá là bắt buộc',
      'string.min': 'Tên mã giảm giá phải có ít nhất 3 ký tự',
      'string.max': 'Tên mã giảm giá không được quá 255 ký tự'
    }),
    description: Joi.string().optional().allow(''),
    type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').required().messages({
      'any.required': 'Loại mã giảm giá là bắt buộc',
      'any.only': 'Loại mã giảm giá phải là PERCENTAGE hoặc FIXED_AMOUNT'
    }),
    value: Joi.number().positive().required().messages({
      'any.required': 'Giá trị giảm giá là bắt buộc',
      'number.positive': 'Giá trị giảm giá phải lớn hơn 0'
    }),
    minOrderAmount: Joi.number().min(0).optional().default(0),
    maxDiscountAmount: Joi.number().positive().optional(),
    usageLimit: Joi.number().integer().positive().optional(),
    startDate: Joi.date().required().messages({
      'any.required': 'Ngày bắt đầu là bắt buộc'
    }),
    endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
      'any.required': 'Ngày kết thúc là bắt buộc',
      'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu'
    }),
    isActive: Joi.boolean().optional().default(true)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().min(3).max(50).messages({
      'string.min': 'Mã giảm giá phải có ít nhất 3 ký tự',
      'string.max': 'Mã giảm giá không được quá 50 ký tự'
    }),
    name: Joi.string().min(3).max(255).messages({
      'string.min': 'Tên mã giảm giá phải có ít nhất 3 ký tự',
      'string.max': 'Tên mã giảm giá không được quá 255 ký tự'
    }),
    description: Joi.string().optional().allow(''),
    type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').messages({
      'any.only': 'Loại mã giảm giá phải là PERCENTAGE hoặc FIXED_AMOUNT'
    }),
    value: Joi.number().positive().messages({
      'number.positive': 'Giá trị giảm giá phải lớn hơn 0'
    }),
    minOrderAmount: Joi.number().min(0),
    maxDiscountAmount: Joi.number().positive(),
    usageLimit: Joi.number().integer().positive(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isActive: Joi.boolean()
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const applyCoupon = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().messages({
      'any.required': 'Mã giảm giá là bắt buộc'
    }),
    orderAmount: Joi.number().positive().required().messages({
      'any.required': 'Tổng tiền đơn hàng là bắt buộc',
      'number.positive': 'Tổng tiền đơn hàng phải lớn hơn 0'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

export const couponValidation = {
  createNew,
  update,
  applyCoupon
}
