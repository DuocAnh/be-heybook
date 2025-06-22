import Joi from 'joi'

export const createAddressValidation = Joi.object({
  recipientName: Joi.string().required().trim().min(2).max(255).messages({
    'string.empty': 'Tên người nhận không được để trống',
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
    'string.max': 'Tên người nhận không được quá 255 ký tự',
    'any.required': 'Tên người nhận là bắt buộc'
  }),

  recipientEmail: Joi.string().required().email().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),

  recipientPhone: Joi.string()
    .required()
    .pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'any.required': 'Số điện thoại là bắt buộc'
    }),

  address: Joi.string().required().trim().min(10).max(500).messages({
    'string.empty': 'Địa chỉ không được để trống',
    'string.min': 'Địa chỉ phải có ít nhất 10 ký tự',
    'string.max': 'Địa chỉ không được quá 500 ký tự',
    'any.required': 'Địa chỉ là bắt buộc'
  }),

  isDefault: Joi.boolean().default(false)
})

export const updateAddressValidation = Joi.object({
  recipientName: Joi.string().trim().min(2).max(255).messages({
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
    'string.max': 'Tên người nhận không được quá 255 ký tự'
  }),

  recipientEmail: Joi.string().email().messages({
    'string.email': 'Email không hợp lệ'
  }),

  recipientPhone: Joi.string()
    .pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ'
    }),

  address: Joi.string().trim().min(10).max(500).messages({
    'string.min': 'Địa chỉ phải có ít nhất 10 ký tự',
    'string.max': 'Địa chỉ không được quá 500 ký tự'
  }),

  isDefault: Joi.boolean()
})
