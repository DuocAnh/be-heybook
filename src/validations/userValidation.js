import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
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
    displayName: Joi.string().trim().strict(),
    address: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Address must not exceed 500 characters'
    }),
    current_password: Joi.string()
      .pattern(PASSWORD_RULE)
      .message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
    new_password: Joi.string().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
  })

  try {
    // Lưu ý đối với trường hợp update, cho phép Unknown để không cần đầy đủ một số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const googleLogin = async (req, res, next) => {
  const correctCondition = Joi.object({
    googleToken: Joi.string().required().messages({
      'string.empty': 'Google token is required',
      'any.required': 'Google token is required'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

// Admin Validations
const createUserByAdmin = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    userName: Joi.string().trim().min(2).max(50).messages({
      'string.min': 'User name must be at least 2 characters',
      'string.max': 'User name must not exceed 50 characters'
    }),
    avatar: Joi.string().uri().allow(null, ''),
    address: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Address must not exceed 500 characters'
    }),
    isActive: Joi.boolean(),
    role: Joi.string().valid('CLIENT', 'USER', 'ADMIN').messages({
      'any.only': 'Role must be CLIENT, USER or ADMIN'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const updateUserByAdmin = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    userName: Joi.string().trim().min(2).max(50).messages({
      'string.min': 'User name must be at least 2 characters',
      'string.max': 'User name must not exceed 50 characters'
    }),
    avatar: Joi.string().uri().allow(null, ''),
    address: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Address must not exceed 500 characters'
    }),
    isActive: Joi.boolean(),
    role: Joi.string().valid('CLIENT', 'USER', 'ADMIN').messages({
      'any.only': 'Role must be CLIENT, USER or ADMIN'
    })
  })
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

const validateUserId = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.number().integer().positive().required().messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    })
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

const updateProfile = async (req, res, next) => {
  const correctCondition = Joi.object({
    userName: Joi.string().trim().min(2).max(50).messages({
      'string.min': 'User name must be at least 2 characters',
      'string.max': 'User name must not exceed 50 characters'
    }),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    address: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Address must not exceed 500 characters'
    }),
    avatar: Joi.string().uri().allow('').messages({
      'string.uri': 'Avatar must be a valid URL'
    })
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

const updatePassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentPassword: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(`Current password: ${PASSWORD_RULE_MESSAGE}`),
    newPassword: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(`New password: ${PASSWORD_RULE_MESSAGE}`)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(422, new Error(error).message))
  }
}

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
  googleLogin,
  // Admin validations
  createUserByAdmin,
  updateUserByAdmin,
  validateUserId,
  // New user profile validations
  updateProfile,
  updatePassword
}
