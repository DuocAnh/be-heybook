import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const validate = async (req, res, next) => {
  const correctCondition = Joi.object({
    // name: Joi.string().required().max(50).trim().messages({
    //   'any.required': 'Tên danh mục là bắt buộc',
    //   'string.empty': 'Tên danh mục không cho phép trống',
    //   'string.max': 'Tên danh mục phải ít hơn hoặc bằng 50 ký tự',
    //   'string.trim': 'Tên danh mục không có khoảng trống ở đầu và cuối'
    // }),
    name: Joi.string().required().min(3).max(50).trim()
  }).required()

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: false
    })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

export const categoryValidation = {
  validate
}
