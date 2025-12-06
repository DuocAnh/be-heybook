import { StatusCodes } from 'http-status-codes'
import { couponService } from '~/services/couponService'

const getCoupons = async (req, res, next) => {
  try {
    const result = await couponService.getCoupons(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getCouponById = async (req, res, next) => {
  try {
    const couponId = req.params.id
    const coupon = await couponService.getCouponById(couponId)
    res.status(StatusCodes.OK).json(coupon)
  } catch (error) {
    next(error)
  }
}

const getCouponByCode = async (req, res, next) => {
  try {
    const code = req.params.code
    const coupon = await couponService.getCouponByCode(code)
    res.status(StatusCodes.OK).json(coupon)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const createdCoupon = await couponService.create(req.body)
    res.status(StatusCodes.CREATED).json(createdCoupon)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const couponId = req.params.id
    const updatedCoupon = await couponService.update(couponId, req.body)
    res.status(StatusCodes.OK).json(updatedCoupon)
  } catch (error) {
    next(error)
  }
}

const deleteById = async (req, res, next) => {
  try {
    const couponId = req.params.id
    const result = await couponService.deleteById(couponId)
    res.status(StatusCodes.OK).json({
      message: 'Xóa mã giảm giá thành công!',
      deletedCount: result
    })
  } catch (error) {
    next(error)
  }
}

const applyCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body
    const result = await couponService.applyCoupon(code, orderAmount)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const couponController = {
  getCoupons,
  getCouponById,
  getCouponByCode,
  createNew,
  update,
  deleteById,
  applyCoupon
}
