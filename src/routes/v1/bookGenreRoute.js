import express from 'express'
import { bookGenreController } from '~/controllers/bookGenreController'
import { bookGenreValidation } from '~/validations/bookGenreValidation'

const Router = express.Router()

Router.route('/')
  .get(bookGenreController.getBookGenres)
  .post(bookGenreValidation.validate, bookGenreController.create)

Router.route('/:id')
  .put(bookGenreValidation.validate, bookGenreController.update)
  .delete(bookGenreController.deleteById)

export const bookGenreRoute = Router
