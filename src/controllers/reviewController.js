import { reviewService } from '~/services/reviewService'

/**
 * Tạo đánh giá mới
 */
const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { productId, rating, comment } = req.body

    if (!productId || !rating) {
      return res.status(400).json({ message: 'productId và rating là bắt buộc!' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 đến 5!' })
    }

    const review = await reviewService.createReview(userId, productId, rating, comment)

    res.status(201).json({
      message: 'Tạo đánh giá thành công!',
      data: review
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Lấy danh sách đánh giá của sản phẩm
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params
    const { page = 1, itemsPerPage = 10 } = req.query

    const reviews = await reviewService.getProductReviews(productId, page, itemsPerPage)

    res.status(200).json({
      message: 'Lấy danh sách đánh giá thành công!',
      data: reviews.data,
      count: reviews.count,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.count / itemsPerPage),
        itemsPerPage: parseInt(itemsPerPage)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Cập nhật đánh giá
 */
const updateReview = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (!rating) {
      return res.status(400).json({ message: 'Rating là bắt buộc!' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 đến 5!' })
    }

    const review = await reviewService.updateReview(reviewId, userId, rating, comment)

    res.status(200).json({
      message: 'Cập nhật đánh giá thành công!',
      data: review
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Xóa đánh giá
 */
const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { reviewId } = req.params

    await reviewService.deleteReview(reviewId, userId)

    res.status(200).json({
      message: 'Xóa đánh giá thành công!'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Lấy thống kê rating của sản phẩm
 */
const getProductRatingStats = async (req, res, next) => {
  try {
    const { productId } = req.params

    const stats = await reviewService.getProductRatingStats(productId)

    res.status(200).json({
      message: 'Lấy thống kê rating thành công!',
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Kiểm tra user đã đánh giá sản phẩm chưa
 */
const checkUserReview = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { productId } = req.params

    const review = await reviewService.checkUserReview(userId, productId)

    res.status(200).json({
      message: 'Kiểm tra đánh giá thành công!',
      data: review
    })
  } catch (error) {
    next(error)
  }
}

export const reviewController = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getProductRatingStats,
  checkUserReview
}
