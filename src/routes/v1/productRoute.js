import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/categories').get(productController.getCategories)
Router.route('/book-genres').get(productController.getBookGenres)
Router.route('/search').get(productValidation.validateSearch, productController.searchAndFilterProducts)

Router.route('/')
  .get(productController.getProducts)
  .post(
    multerUploadMiddleware.upload.fields([
      { name: 'coverImageUrl', maxCount: 1 },
      { name: 'productImages', maxCount: 10 }
    ]),
    productValidation.validate,
    productController.create
  )
Router.route('/trend-products').get(productController.getProductTrend)

Router.route('/:id')
  .get(productController.getProductById)
  .put(
    multerUploadMiddleware.upload.fields([
      { name: 'coverImageUrl', maxCount: 1 },
      { name: 'productImages', maxCount: 10 }
    ]),
    productValidation.validate,
    productController.update
  )
  .delete(productController.deleteById)

export const productRoute = Router
