import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const validate = async (req, res, next) => {
  const correctCondition = Joi.object({
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

export const bookGenreValidation = {
  validate
}
