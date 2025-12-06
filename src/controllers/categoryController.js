import { categoryService } from '~/services/categoryService'
// import ApiError from '~/utils/ApiError'

const getCategories = async (req, res, next) => {
  try {
    const { page, itemsPerPage, search } = req.query
    const queryFilter = search

    const categories = await categoryService.getCategories(page, itemsPerPage, queryFilter)
    res.status(200).json(categories)
  } catch (error) {
    next(error)
  }
}

const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const category = await categoryService.getCategoryById(categoryId)
    res.status(200).json(category)
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const createdCategory = await categoryService.create(req.body)
    res.status(201).json(createdCategory)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const updatedCategory = await categoryService.update(categoryId, req.body)
    res.status(200).json(updatedCategory)
  } catch (error) {
    next(error)
  }
}

const deleteById = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const deletedCategory = await categoryService.deleteById(categoryId)
    res.status(204).json(deletedCategory)
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  getCategories,
  getCategoryById,
  create,
  update,
  deleteById
}
