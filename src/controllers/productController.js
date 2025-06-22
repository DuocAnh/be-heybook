import { productService } from '~/services/productService'

const create = async (req, res, next) => {
  try {
    console.log(req.body)
    console.log(req.file)
    const productFile = req.file
    const createProduct = await productService.create(req.body, productFile)
    res.status(201).json(createProduct)
  } catch (error) {
    next(error)
  }
}

const getProducts = async (req, res, next) => {
  try {
    const { page, itemsPerPage, search } = req.query

    const products = await productService.getProducts(page, itemsPerPage, search)
    res.status(201).json(products)
  } catch (error) {
    next(error)
  }
}

const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id
    const product = await productService.getProductById(productId)
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    console.log(req.body)
    const productId = req.params.id
    const productFile = req.file
    const updatedProduct = await productService.update(productId, req.body, productFile)
    res.status(201).json(updatedProduct)
  } catch (error) {
    next(error)
  }
}

const deleteById = async (req, res, next) => {
  try {
    const productId = req.params.id
    const deletedProduct = await productService.deleteById(productId)
    res.status(201).json(deletedProduct)
  } catch (error) {
    next(error)
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories()
    res.status(201).json(categories)
  } catch (error) {
    next(error)
  }
}

const getBookGenres = async (req, res, next) => {
  try {
    const bookGenres = await productService.getBookGenres()
    res.status(201).json(bookGenres)
  } catch (error) {
    next(error)
  }
}

const searchAndFilterProducts = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      itemsPerPage: req.query.itemsPerPage,
      search: req.query.search,
      type: req.query.type,
      bookGenreId: req.query.bookGenreId,
      language: req.query.language,
      categoryId: req.query.categoryId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    }

    const products = await productService.searchAndFilterProducts(filters)
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

export const productController = {
  create,
  getProducts,
  getProductById,
  update,
  deleteById,
  getCategories,
  getBookGenres,
  searchAndFilterProducts
}
