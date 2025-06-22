import Joi from 'joi'

/**
 * Validation cho tạo đánh giá mới
 */
const createReviewValidation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      productId: Joi.number().integer().positive().required().messages({
        'number.base': 'productId phải là số',
        'number.integer': 'productId phải là số nguyên',
        'number.positive': 'productId phải là số dương',
        'any.required': 'productId là bắt buộc'
      }),
      rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': 'Rating phải là số',
        'number.integer': 'Rating phải là số nguyên',
        'number.min': 'Rating phải từ 1 đến 5',
        'number.max': 'Rating phải từ 1 đến 5',
        'any.required': 'Rating là bắt buộc'
      }),
      comment: Joi.string().max(1000).optional().messages({
        'string.base': 'Comment phải là chuỗi',
        'string.max': 'Comment không được vượt quá 1000 ký tự'
      })
    })

    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessages = error.details?.map((detail) => detail.message) || [error.message]
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ!',
      errors: errorMessages
    })
  }
}

/**
 * Validation cho cập nhật đánh giá
 */
const updateReviewValidation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': 'Rating phải là số',
        'number.integer': 'Rating phải là số nguyên',
        'number.min': 'Rating phải từ 1 đến 5',
        'number.max': 'Rating phải từ 1 đến 5',
        'any.required': 'Rating là bắt buộc'
      }),
      comment: Joi.string().max(1000).optional().messages({
        'string.base': 'Comment phải là chuỗi',
        'string.max': 'Comment không được vượt quá 1000 ký tự'
      })
    })

    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessages = error.details?.map((detail) => detail.message) || [error.message]
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ!',
      errors: errorMessages
    })
  }
}

/**
 * Validation cho query parameters
 */
const reviewQueryValidation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Page phải là số',
        'number.integer': 'Page phải là số nguyên',
        'number.min': 'Page phải lớn hơn 0'
      }),
      itemsPerPage: Joi.number().integer().min(1).max(100).optional().messages({
        'number.base': 'ItemsPerPage phải là số',
        'number.integer': 'ItemsPerPage phải là số nguyên',
        'number.min': 'ItemsPerPage phải lớn hơn 0',
        'number.max': 'ItemsPerPage không được vượt quá 100'
      })
    })

    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessages = error.details?.map((detail) => detail.message) || [error.message]
    return res.status(400).json({
      message: 'Tham số truy vấn không hợp lệ!',
      errors: errorMessages
    })
  }
}

export const reviewValidation = {
  createReviewValidation,
  updateReviewValidation,
  reviewQueryValidation
}
