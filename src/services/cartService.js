import { Cart, CartItem, Product, ProductImage, Coupon } from '~/models'
import { couponService } from './couponService'
import ApiError from '~/utils/ApiError'

const getOrCreateCart = async (userId) => {
  try {
    let cart = await Cart.findOne({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'discount', 'stock', 'coverImageUrl'],
              include: [
                {
                  model: ProductImage,
                  as: 'productImages',
                  attributes: ['imageUrl']
                }
              ]
            }
          ]
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false
        }
      ]
    })

    if (!cart) {
      cart = await Cart.create({
        userId,
        totalAmount: 0,
        discountAmount: 0,
        finalAmount: 0,
        status: 'ACTIVE'
      })
    }

    return cart
  } catch (error) {
    throw error
  }
}

const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new ApiError(404, 'Sản phẩm không tồn tại!')
    }

    // Kiểm tra stock
    if (product.stock < quantity) {
      throw new ApiError(400, `Chỉ còn ${product.stock} sản phẩm trong kho!`)
    }

    // Lấy hoặc tạo cart
    const cart = await getOrCreateCart(userId)

    // Kiểm tra xem sản phẩm đã có trong cart chưa
    const existingCartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId
      }
    })

    if (existingCartItem) {
      // Cập nhật quantity
      const newQuantity = existingCartItem.quantity + quantity

      // Kiểm tra stock với quantity mới
      if (product.stock < newQuantity) {
        throw new ApiError(
          400,
          `Chỉ có thể thêm tối đa ${product.stock - existingCartItem.quantity} sản phẩm nữa!`
        )
      }

      const totalPrice = (newQuantity * product.price * (100 - product.discount)) / 100

      await existingCartItem.update({
        quantity: newQuantity,
        totalPrice: totalPrice
      })
    } else {
      // Tạo mới cart item
      const totalPrice = (quantity * product.price * (100 - product.discount)) / 100

      await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
        unitPrice: product.price,
        discount: product.discount,
        totalPrice: totalPrice
      })
    }

    // Cập nhật tổng tiền cart
    await updateCartTotals(cart.id)

    // Trả về cart đầy đủ thông tin
    return await getCartWithItems(cart.id)
  } catch (error) {
    throw error
  }
}

const updateCartItem = async (userId, cartItemId, quantity) => {
  try {
    // Tìm cart item và kiểm tra quyền sở hữu
    const cartItem = await CartItem.findOne({
      where: { id: cartItemId },
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { userId, status: 'ACTIVE' }
        },
        {
          model: Product,
          as: 'product'
        }
      ]
    })

    if (!cartItem) {
      throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng!')
    }

    // Kiểm tra stock
    if (cartItem.product.stock < quantity) {
      throw new ApiError(400, `Chỉ còn ${cartItem.product.stock} sản phẩm trong kho!`)
    }

    // Cập nhật quantity và totalPrice
    const totalPrice = (quantity * cartItem.unitPrice * (100 - cartItem.discount)) / 100

    await cartItem.update({
      quantity: quantity,
      totalPrice: totalPrice
    })

    // Cập nhật tổng tiền cart
    await updateCartTotals(cartItem.cart.id)

    return await getCartWithItems(cartItem.cart.id)
  } catch (error) {
    throw error
  }
}

const removeFromCart = async (userId, cartItemId) => {
  try {
    // Tìm cart item và kiểm tra quyền sở hữu
    const cartItem = await CartItem.findOne({
      where: { id: cartItemId },
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { userId, status: 'ACTIVE' }
        }
      ]
    })

    if (!cartItem) {
      throw new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng!')
    }

    const cartId = cartItem.cart.id
    await cartItem.destroy()

    // Cập nhật tổng tiền cart
    await updateCartTotals(cartId)

    return await getCartWithItems(cartId)
  } catch (error) {
    throw error
  }
}

const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({
      where: { userId, status: 'ACTIVE' }
    })

    if (!cart) {
      throw new ApiError(404, 'Không tìm thấy giỏ hàng!')
    }

    // Xóa tất cả items trong cart
    await CartItem.destroy({
      where: { cartId: cart.id }
    })

    // Reset cart totals
    await cart.update({
      totalAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
      couponId: null
    })

    return await getCartWithItems(cart.id)
  } catch (error) {
    throw error
  }
}

const applyCouponToCart = async (userId, couponCode) => {
  try {
    const cart = await Cart.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [
        {
          model: CartItem,
          as: 'items'
        }
      ]
    })

    if (!cart) {
      throw new ApiError(404, 'Không tìm thấy giỏ hàng!')
    }

    if (!cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Giỏ hàng trống!')
    }

    // Áp dụng coupon
    const couponResult = await couponService.applyCoupon(couponCode, cart.totalAmount)

    // Cập nhật cart với coupon
    await cart.update({
      couponId: couponResult.coupon.id,
      discountAmount: couponResult.discountAmount,
      finalAmount: cart.totalAmount - couponResult.discountAmount
    })

    return await getCartWithItems(cart.id)
  } catch (error) {
    throw error
  }
}

const removeCouponFromCart = async (userId) => {
  try {
    const cart = await Cart.findOne({
      where: { userId, status: 'ACTIVE' }
    })

    if (!cart) {
      throw new ApiError(404, 'Không tìm thấy giỏ hàng!')
    }

    await cart.update({
      couponId: null,
      discountAmount: 0,
      finalAmount: cart.totalAmount
    })

    return await getCartWithItems(cart.id)
  } catch (error) {
    throw error
  }
}

const getCartWithItems = async (cartId) => {
  try {
    const cart = await Cart.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'discount', 'stock', 'coverImageUrl', 'type'],
              include: [
                {
                  model: ProductImage,
                  as: 'productImages',
                  attributes: ['imageUrl']
                }
              ]
            }
          ]
        },
        {
          model: Coupon,
          as: 'coupon',
          required: false,
          attributes: ['id', 'code', 'name', 'type', 'value']
        }
      ]
    })

    return cart
  } catch (error) {
    throw error
  }
}

const updateCartTotals = async (cartId) => {
  try {
    const cart = await Cart.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items'
        },
        {
          model: Coupon,
          as: 'coupon'
        }
      ]
    })

    if (!cart) return

    // Tính tổng tiền
    const totalAmount = cart.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)

    // Tính lại discount nếu có coupon
    let discountAmount = 0
    let finalAmount = totalAmount
    let couponId = cart.couponId

    if (cart.couponId && cart.coupon) {
      try {
        const couponResult = await couponService.applyCoupon(cart.coupon.code, totalAmount)
        discountAmount = couponResult.discountAmount
        finalAmount = totalAmount - discountAmount
      } catch {
        // Nếu coupon không còn hợp lệ, xóa coupon khỏi cart
        couponId = null
        discountAmount = 0
        finalAmount = totalAmount
      }
    }

    // Luôn cập nhật cart với totalAmount mới
    await cart.update({
      totalAmount: totalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      couponId: couponId
    })
  } catch (error) {
    throw error
  }
}

export const cartService = {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart,
  getCartWithItems
}
