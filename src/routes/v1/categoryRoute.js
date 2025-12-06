import express from 'express'
import { categoryController } from '~/controllers/categoryController'
import { categoryValidation } from '~/validations/categoryValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, categoryController.getCategories)
  .post(categoryValidation.validate, categoryController.create)

Router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(categoryValidation.validate, categoryController.update)
  .delete(categoryController.deleteById)

export const categoryRoute = Router
