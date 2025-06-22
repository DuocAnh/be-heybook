import { Address } from '~/models'
import ApiError from '~/utils/ApiError'
import sequelize from '~/config/mySQL'
import { Op } from 'sequelize'

const createAddress = async (userId, addressData) => {
  const { recipientName, recipientEmail, recipientPhone, address, isDefault = false } = addressData

  // Validate required fields
  if (!recipientName || !recipientEmail || !recipientPhone || !address) {
    throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin địa chỉ!')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipientEmail)) {
    throw new ApiError(400, 'Email không hợp lệ!')
  }

  // Validate phone format (Vietnamese phone number)
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
  if (!phoneRegex.test(recipientPhone)) {
    throw new ApiError(400, 'Số điện thoại không hợp lệ!')
  }

  return await sequelize.transaction(async (t) => {
    let shouldSetDefault = isDefault

    // Nếu đặt làm địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (shouldSetDefault) {
      await Address.update(
        { isDefault: false },
        {
          where: { userId },
          transaction: t
        }
      )
    } else {
      // Nếu đây là địa chỉ đầu tiên của user thì tự động set làm mặc định
      const existingAddressCount = await Address.count({
        where: { userId },
        transaction: t
      })

      if (existingAddressCount === 0) {
        shouldSetDefault = true
      }
    }

    const newAddress = await Address.create(
      {
        userId,
        recipientName,
        recipientEmail,
        recipientPhone,
        address,
        isDefault: shouldSetDefault
      },
      { transaction: t }
    )

    return newAddress
  })
}

const getUserAddresses = async (userId, { page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit

  const { count, rows: addresses } = await Address.findAndCountAll({
    where: { userId },
    order: [
      ['isDefault', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit: parseInt(limit),
    offset: parseInt(offset)
  })

  return {
    addresses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  }
}

const getAddressById = async (addressId, userId) => {
  const address = await Address.findOne({
    where: {
      id: addressId,
      userId
    }
  })

  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ!')
  }

  return address
}

const updateAddress = async (addressId, userId, addressData) => {
  const { recipientName, recipientEmail, recipientPhone, address, isDefault } = addressData

  // Validate email format if provided
  if (recipientEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      throw new ApiError(400, 'Email không hợp lệ!')
    }
  }

  // Validate phone format if provided
  if (recipientPhone) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    if (!phoneRegex.test(recipientPhone)) {
      throw new ApiError(400, 'Số điện thoại không hợp lệ!')
    }
  }

  return await sequelize.transaction(async (t) => {
    const existingAddress = await Address.findOne({
      where: {
        id: addressId,
        userId
      },
      transaction: t
    })

    if (!existingAddress) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ!')
    }

    // Nếu đặt làm địa chỉ mặc định, bỏ default của các địa chỉ khác
    if (isDefault && !existingAddress.isDefault) {
      await Address.update(
        { isDefault: false },
        {
          where: {
            userId,
            id: { [Op.ne]: addressId }
          },
          transaction: t
        }
      )
    }

    const updateData = {}
    if (recipientName !== undefined) updateData.recipientName = recipientName
    if (recipientEmail !== undefined) updateData.recipientEmail = recipientEmail
    if (recipientPhone !== undefined) updateData.recipientPhone = recipientPhone
    if (address !== undefined) updateData.address = address
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const [affectedRows] = await Address.update(updateData, {
      where: {
        id: addressId,
        userId
      },
      transaction: t
    })

    if (affectedRows === 0) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ để cập nhật!')
    }

    const updatedAddress = await Address.findByPk(addressId, { transaction: t })
    return updatedAddress
  })
}

const deleteAddress = async (addressId, userId) => {
  return await sequelize.transaction(async (t) => {
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId
      },
      transaction: t
    })

    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ!')
    }

    const wasDefault = address.isDefault

    await address.destroy({ transaction: t })

    // Nếu địa chỉ vừa xóa là địa chỉ mặc định, đặt địa chỉ đầu tiên còn lại làm mặc định
    if (wasDefault) {
      const remainingAddresses = await Address.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 1,
        transaction: t
      })

      if (remainingAddresses.length > 0) {
        await remainingAddresses[0].update({ isDefault: true }, { transaction: t })
      }
    }
  })
}

const setDefaultAddress = async (addressId, userId) => {
  return await sequelize.transaction(async (t) => {
    const address = await Address.findOne({
      where: {
        id: addressId,
        userId
      },
      transaction: t
    })

    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ!')
    }

    if (address.isDefault) {
      throw new ApiError(400, 'Địa chỉ này đã là địa chỉ mặc định!')
    }

    // Bỏ default của tất cả địa chỉ khác
    await Address.update(
      { isDefault: false },
      {
        where: { userId },
        transaction: t
      }
    )

    // Đặt địa chỉ này làm mặc định
    await address.update({ isDefault: true }, { transaction: t })

    return address
  })
}

const getDefaultAddress = async (userId) => {
  const defaultAddress = await Address.findOne({
    where: {
      userId,
      isDefault: true
    }
  })

  return defaultAddress
}

export const addressService = {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
}
