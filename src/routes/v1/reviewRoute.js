import express from 'express'
import { reviewController } from '~/controllers/reviewController'
import { reviewValidation } from '~/validations/reviewValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Tạo đánh giá mới (cần đăng nhập)
Router.post(
  '/',
  authMiddleware.isAuthorized,
  reviewValidation.createReviewValidation,
  reviewController.createReview
)

// Lấy danh sách đánh giá của sản phẩm (public)
Router.get('/product/:productId', reviewValidation.reviewQueryValidation, reviewController.getProductReviews)

// Lấy thống kê rating của sản phẩm (public)
Router.get('/product/:productId/stats', reviewController.getProductRatingStats)

// Kiểm tra user đã đánh giá sản phẩm chưa (cần đăng nhập)
Router.get('/product/:productId/check', authMiddleware.isAuthorized, reviewController.checkUserReview)

// Cập nhật đánh giá (cần đăng nhập)
Router.put(
  '/:reviewId',
  authMiddleware.isAuthorized,
  reviewValidation.updateReviewValidation,
  reviewController.updateReview
)

// Xóa đánh giá (cần đăng nhập)
Router.delete('/:reviewId', authMiddleware.isAuthorized, reviewController.deleteReview)

export const reviewRoute = Router
