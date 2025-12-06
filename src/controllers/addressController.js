import { addressService } from '~/services/addressService'

const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addressData = req.body

    const address = await addressService.createAddress(userId, addressData)

    res.status(201).json({
      message: 'Thêm địa chỉ thành công!',
      data: address
    })
  } catch (error) {
    next(error)
  }
}

const getUserAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 50 } = req.query

    const result = await addressService.getUserAddresses(userId, { page, limit })

    res.status(200).json({
      data: result.addresses,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

const getAddressById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addressId = req.params.id

    const address = await addressService.getAddressById(addressId, userId)

    res.status(200).json({
      data: address
    })
  } catch (error) {
    next(error)
  }
}

const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addressId = req.params.id
    const addressData = req.body

    const address = await addressService.updateAddress(addressId, userId, addressData)

    res.status(200).json({
      message: 'Cập nhật địa chỉ thành công!',
      data: address
    })
  } catch (error) {
    next(error)
  }
}

const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addressId = req.params.id

    await addressService.deleteAddress(addressId, userId)

    res.status(200).json({
      message: 'Xóa địa chỉ thành công!'
    })
  } catch (error) {
    next(error)
  }
}

const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id
    const addressId = req.params.id

    const address = await addressService.setDefaultAddress(addressId, userId)

    res.status(200).json({
      message: 'Đặt địa chỉ mặc định thành công!',
      data: address
    })
  } catch (error) {
    next(error)
  }
}

const getDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id

    const address = await addressService.getDefaultAddress(userId)

    res.status(200).json({
      data: address
    })
  } catch (error) {
    next(error)
  }
}

export const addressController = {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
}
