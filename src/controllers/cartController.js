import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cart = await cartService.getOrCreateCart(userId)
    res.status(200).json(cart)
  } catch (error) {
    next(error)
  }
}

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID là bắt buộc!' })
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0!' })
    }

    const cart = await cartService.addToCart(userId, productId, quantity)
    res.status(200).json({
      message: 'Thêm sản phẩm vào giỏ hàng thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cartItemId = req.params.id
    const { quantity } = req.body

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0!' })
    }

    const cart = await cartService.updateCartItem(userId, cartItemId, quantity)
    res.status(200).json({
      message: 'Cập nhật số lượng thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cartItemId = req.params.id

    const cart = await cartService.removeFromCart(userId, cartItemId)
    res.status(200).json({
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cart = await cartService.clearCart(userId)
    res.status(200).json({
      message: 'Xóa toàn bộ giỏ hàng thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { couponCode } = req.body

    if (!couponCode) {
      return res.status(400).json({ message: 'Mã giảm giá là bắt buộc!' })
    }

    const cart = await cartService.applyCouponToCart(userId, couponCode)
    res.status(200).json({
      message: 'Áp dụng mã giảm giá thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user.id
    const cart = await cartService.removeCouponFromCart(userId)
    res.status(200).json({
      message: 'Xóa mã giảm giá thành công!',
      data: cart
    })
  } catch (error) {
    next(error)
  }
}

export const cartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
}
