import { Product, Review, User } from '~/models'
import { ApiError } from '~/utils/ApiError'
import sequelize from '~/config/mySQL'

const DEFAULT_PAGE = 1
const DEFAULT_ITEMS_PER_PAGE = 10

/**
 * Tạo đánh giá mới
 */
const createReview = async (userId, productId, rating, comment) => {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new ApiError(404, 'Sản phẩm không tồn tại!')
    }

    // Kiểm tra user đã đánh giá sản phẩm này chưa
    const existingReview = await Review.findOne({
      where: { userId, productId }
    })
    if (existingReview) {
      throw new ApiError(400, 'Bạn đã đánh giá sản phẩm này rồi!')
    }

    // Tạo đánh giá mới
    const review = await Review.create({
      userId,
      productId,
      rating,
      comment
    })

    // Lấy review với thông tin user
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'avatar']
        }
      ]
    })

    return createdReview
  } catch (error) {
    throw error
  }
}

/**
 * Lấy danh sách đánh giá của sản phẩm
 */
const getProductReviews = async (productId, page = DEFAULT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE) => {
  try {
    const offset = (page - 1) * itemsPerPage

    const { rows: data, count } = await Review.findAndCountAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(itemsPerPage),
      offset: parseInt(offset)
    })

    return { data, count }
  } catch (error) {
    throw error
  }
}

/**
 * Cập nhật đánh giá
 */
const updateReview = async (reviewId, userId, rating, comment) => {
  try {
    const review = await Review.findOne({
      where: { id: reviewId, userId }
    })

    if (!review) {
      throw new ApiError(404, 'Không tìm thấy đánh giá hoặc bạn không có quyền sửa!')
    }

    await review.update({ rating, comment })

    // Lấy review đã cập nhật với thông tin user
    const updatedReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'avatar']
        }
      ]
    })

    return updatedReview
  } catch (error) {
    throw error
  }
}

/**
 * Xóa đánh giá
 */
const deleteReview = async (reviewId, userId) => {
  try {
    const review = await Review.findOne({
      where: { id: reviewId, userId }
    })

    if (!review) {
      throw new ApiError(404, 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa!')
    }

    await review.destroy()
    return review
  } catch (error) {
    throw error
  }
}

/**
 * Lấy rating trung bình và số lượng đánh giá của sản phẩm
 */
const getProductRatingStats = async (productId) => {
  try {
    const stats = await Review.findAll({
      where: { productId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 4 THEN 1 END')), 'fourStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 3 THEN 1 END')), 'threeStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 2 THEN 1 END')), 'twoStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 1 THEN 1 END')), 'oneStar']
      ],
      raw: true
    })

    const result = stats[0]
    return {
      avgRating: parseFloat(result.avgRating) || 0,
      totalReviews: parseInt(result.totalReviews) || 0,
      ratingDistribution: {
        5: parseInt(result.fiveStars) || 0,
        4: parseInt(result.fourStars) || 0,
        3: parseInt(result.threeStars) || 0,
        2: parseInt(result.twoStars) || 0,
        1: parseInt(result.oneStar) || 0
      }
    }
  } catch (error) {
    throw error
  }
}

/**
 * Kiểm tra user đã đánh giá sản phẩm chưa
 */
const checkUserReview = async (userId, productId) => {
  try {
    const review = await Review.findOne({
      where: { userId, productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'avatar']
        }
      ]
    })

    return review
  } catch (error) {
    throw error
  }
}

export const reviewService = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getProductRatingStats,
  checkUserReview
}
