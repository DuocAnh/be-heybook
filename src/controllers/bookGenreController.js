import { bookGenreService } from '~/services/bookGenreService'
// import ApiError from '~/utils/ApiError'

const getBookGenres = async (req, res, next) => {
  try {
    const { page, itemsPerPage, search } = req.query

    const bookGenres = await bookGenreService.getBookGenres(page, itemsPerPage, search)
    res.status(200).json(bookGenres)
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const createdBookGenres = await bookGenreService.create(req.body)
    res.status(201).json(createdBookGenres)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const bookGenreId = req.params.id
    const updatedBookGenre = await bookGenreService.update(bookGenreId, req.body)
    res.status(200).json(updatedBookGenre)
  } catch (error) {
    next(error)
  }
}

const deleteById = async (req, res, next) => {
  try {
    const bookGenreId = req.params.id
    const deletedBookGenre = await bookGenreService.deleteById(bookGenreId)
    res.status(204).json(deletedBookGenre)
  } catch (error) {
    next(error)
  }
}

export const bookGenreController = {
  getBookGenres,
  create,
  update,
  deleteById
}
