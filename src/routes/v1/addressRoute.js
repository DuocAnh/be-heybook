import express from 'express'
import { addressController } from '~/controllers/addressController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { createAddressValidation, updateAddressValidation } from '~/validations/addressValidation'

const Router = express.Router()

// Middleware validation
const validateCreateAddress = (req, res, next) => {
  const { error, value } = createAddressValidation.validate(req.body)
  if (error) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.details.map((detail) => detail.message)
    })
  }
  req.body = value
  next()
}

const validateUpdateAddress = (req, res, next) => {
  const { error, value } = updateAddressValidation.validate(req.body)
  if (error) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.details.map((detail) => detail.message)
    })
  }
  req.body = value
  next()
}

// Routes
Router.post('/', authMiddleware.isAuthorized, validateCreateAddress, addressController.createAddress)
Router.get('/', authMiddleware.isAuthorized, addressController.getUserAddresses)
Router.get('/default', authMiddleware.isAuthorized, addressController.getDefaultAddress)
Router.get('/:id', authMiddleware.isAuthorized, addressController.getAddressById)
Router.put('/:id', authMiddleware.isAuthorized, validateUpdateAddress, addressController.updateAddress)
Router.delete('/:id', authMiddleware.isAuthorized, addressController.deleteAddress)
Router.patch('/:id/set-default', authMiddleware.isAuthorized, addressController.setDefaultAddress)

export const addressRoute = Router
