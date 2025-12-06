import Coupon from '~/models/Coupon'
import ApiError from '~/utils/ApiError'
import { Sequelize } from 'sequelize'

const getCoupons = async (queryFilters) => {
  try {
    const { page = 1, limit = 10, search, isActive, type, status } = queryFilters
    const offset = (page - 1) * limit

    const whereClause = {}
    const currentDate = new Date()

    // Build search conditions
    const searchConditions = []
    if (search) {
      searchConditions.push(
        { code: { [Sequelize.Op.like]: `%${search}%` } },
        { name: { [Sequelize.Op.like]: `%${search}%` } }
      )
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }

    if (type) {
      whereClause.type = type
    }

    // Filter for active status - chỉ lấy voucher thực sự có thể sử dụng
    if (status === 'active') {
      whereClause.isActive = true // Voucher phải được active
      whereClause.startDate = { [Sequelize.Op.lte]: currentDate } // Đã đến hạn sử dụng
      whereClause.endDate = { [Sequelize.Op.gte]: currentDate } // Chưa quá hạn

      // Thêm điều kiện cho voucher chưa sử dụng hết
      const usageLimitConditions = [
        { usageLimit: null }, // Không giới hạn số lần sử dụng
        {
          [Sequelize.Op.and]: [
            { usageLimit: { [Sequelize.Op.not]: null } },
            Sequelize.where(Sequelize.col('usedCount'), Sequelize.Op.lt, Sequelize.col('usageLimit'))
          ]
        }
      ]

      // Combine search and usage limit conditions properly
      if (searchConditions.length > 0) {
        whereClause[Sequelize.Op.and] = [
          { [Sequelize.Op.or]: searchConditions },
          { [Sequelize.Op.or]: usageLimitConditions }
        ]
      } else {
        whereClause[Sequelize.Op.or] = usageLimitConditions
      }
    } else if (searchConditions.length > 0) {
      // Only search conditions, no active status filter
      whereClause[Sequelize.Op.or] = searchConditions
    }

    const { count, rows } = await Coupon.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    })

    return {
      coupons: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    }
  } catch (error) {
    throw error
  }
}

const getCouponById = async (couponId) => {
  try {
    const coupon = await Coupon.findByPk(couponId)
    if (!coupon) {
      throw new ApiError(404, 'Không tìm thấy mã giảm giá!')
    }
    return coupon
  } catch (error) {
    throw error
  }
}

const getCouponByCode = async (code) => {
  try {
    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    })
    if (!coupon) {
      throw new ApiError(404, 'Mã giảm giá không tồn tại!')
    }
    return coupon
  } catch (error) {
    throw error
  }
}

const create = async (reqBody) => {
  try {
    const existCoupon = await Coupon.findOne({
      where: Sequelize.where(Sequelize.fn('UPPER', Sequelize.col('code')), reqBody.code.toUpperCase())
    })
    if (existCoupon) throw new ApiError(409, 'Mã giảm giá đã tồn tại!')

    if (reqBody.type === 'PERCENTAGE' && reqBody.value > 100) {
      throw new ApiError(422, 'Giá trị phần trăm không được vượt quá 100%')
    }

    const couponData = {
      ...reqBody,
      code: reqBody.code.toUpperCase()
    }

    const createdCoupon = await Coupon.create(couponData)
    return createdCoupon
  } catch (error) {
    throw error
  }
}

const update = async (couponId, reqBody) => {
  try {
    const existCoupon = await Coupon.findByPk(couponId)
    if (!existCoupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá!')

    if (reqBody.code) {
      const duplicateCoupon = await Coupon.findOne({
        where: {
          code: reqBody.code.toUpperCase(),
          id: { [Sequelize.Op.ne]: couponId }
        }
      })
      if (duplicateCoupon) throw new ApiError(409, 'Mã giảm giá đã tồn tại!')
    }

    if (reqBody.type === 'PERCENTAGE' && reqBody.value > 100) {
      throw new ApiError(422, 'Giá trị phần trăm không được vượt quá 100%')
    }

    if (reqBody.endDate && reqBody.startDate && new Date(reqBody.endDate) <= new Date(reqBody.startDate)) {
      throw new ApiError(422, 'Ngày kết thúc phải sau ngày bắt đầu')
    }

    const updateData = { ...reqBody }
    if (reqBody.code) {
      updateData.code = reqBody.code.toUpperCase()
    }

    await Coupon.update(updateData, {
      where: { id: couponId }
    })

    const updatedCoupon = await Coupon.findByPk(couponId)
    return updatedCoupon
  } catch (error) {
    throw error
  }
}

const deleteById = async (couponId) => {
  try {
    const existCoupon = await Coupon.findByPk(couponId)
    if (!existCoupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá!')

    const deletedCount = await Coupon.destroy({
      where: { id: couponId }
    })
    if (!deletedCount) {
      throw new ApiError(409, 'Xóa thất bại!')
    }
    return deletedCount
  } catch (error) {
    throw error
  }
}

const applyCoupon = async (code, orderAmount) => {
  try {
    const coupon = await getCouponByCode(code)

    if (!coupon.isActive) {
      throw new ApiError(400, 'Mã giảm giá đã bị vô hiệu hóa!')
    }

    const currentDate = new Date()
    if (currentDate < new Date(coupon.startDate)) {
      throw new ApiError(400, 'Mã giảm giá chưa có hiệu lực!')
    }

    if (currentDate > new Date(coupon.endDate)) {
      throw new ApiError(400, 'Mã giảm giá đã hết hạn!')
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'Mã giảm giá đã hết lượt sử dụng!')
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new ApiError(
        400,
        `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã giảm giá này`
      )
    }

    let discountAmount = 0
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.value) / 100
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount
      }
    } else {
      // FIXED_AMOUNT
      discountAmount = coupon.value
      // Apply maxDiscountAmount limit for FIXED_AMOUNT as well
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount
      }
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount
      }
    }

    return {
      coupon,
      discountAmount: Math.round(discountAmount),
      finalAmount: orderAmount - Math.round(discountAmount)
    }
  } catch (error) {
    throw error
  }
}

const incrementUsedCount = async (couponId) => {
  try {
    await Coupon.increment('usedCount', {
      where: { id: couponId }
    })
  } catch (error) {
    throw error
  }
}

export const couponService = {
  getCoupons,
  getCouponById,
  getCouponByCode,
  create,
  update,
  deleteById,
  applyCoupon,
  incrementUsedCount
}
