import { Sequelize } from 'sequelize'
import BookGenre from '~/models/BookGenre'
import ApiError from '~/utils/ApiError'
import { Op } from 'sequelize'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const getBookGenres = async (page, itemsPerPage, queryFilter) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const offset = (page - 1) * itemsPerPage

    const whereClause = queryFilter ? { name: { [Op.like]: `%${queryFilter}%` } } : {}

    const { rows: data, count } = await BookGenre.findAndCountAll({
      where: whereClause,
      limit: parseInt(itemsPerPage, 10),
      offset: parseInt(offset, 10),
      order: [['updatedAt', 'DESC']]
    })
    return { data, count }
  } catch (error) {
    throw error
  }
}

const create = async (reqBody) => {
  try {
    const existBookGenre = await BookGenre.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), reqBody.name.toLowerCase())
    })
    if (existBookGenre) throw new ApiError(409, 'Thể loại sách đã tồn tại!')

    const createdBookGenre = await BookGenre.create(reqBody)
    return createdBookGenre
  } catch (error) {
    throw error
  }
}

const update = async (bookGenreId, reqBody) => {
  try {
    const existBookGenre = await BookGenre.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), reqBody.name.toLowerCase())
    })
    if (existBookGenre) throw new ApiError(409, 'Thể loại sách đã tồn tại!')

    const updatedBookGenre = await BookGenre.update(reqBody, {
      where: { id: bookGenreId }
    })
    return updatedBookGenre
  } catch (error) {
    throw error
  }
}

const deleteById = async (bookGenreId) => {
  try {
    const deletedBookGenre = await BookGenre.destroy({
      where: { id: bookGenreId }
    })
    if (!deletedBookGenre) {
      throw new ApiError(409, 'Xóa thất bại!')
    }
    return deletedBookGenre
  } catch (error) {
    throw error
  }
}

export const bookGenreService = {
  getBookGenres,
  create,
  update,
  deleteById
}
