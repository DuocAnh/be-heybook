import { Sequelize, Op } from 'sequelize'
import sequelize from '~/config/mySQL'
import {
  BookDetail,
  StationeryDetail,
  Product,
  ProductImage,
  BookGenre,
  Category,
  Review,
  OrderItem,
  Order
} from '~/models'
import { UploadImageProvider } from '~/providers/UploadImageProvider'
import ApiError from '~/utils/ApiError'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const getProducts = async (page, itemsPerPage, queryFilter) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const offset = (page - 1) * itemsPerPage
    const whereClause = queryFilter ? { name: { [Op.like]: `%${queryFilter}%` } } : {}

    const { rows: data, count } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(itemsPerPage, 10),
      offset: parseInt(offset, 10),
      // order: [['updatedAt', 'DESC']],

      distinct: true,
      col: 'id',

      attributes: [
        'id',
        'name',
        'price',
        'discount',
        'stock',
        'description',
        'coverImageUrl',
        'dimension',
        'type',
        'categoryId',
        'createdAt',
        'updatedAt'
      ],

      include: [
        {
          model: BookDetail,
          as: 'bookDetail',
          required: false,
          attributes: [
            'bookGenreId',
            'author',
            'translator',
            'language',
            'publisher',
            'publishYear',
            'pageCount'
          ],
          on: Sequelize.literal('Product.id = bookDetail.product_id AND Product.type = "BOOK"')
        },
        {
          model: StationeryDetail,
          as: 'stationeryDetail',
          required: false,
          attributes: ['brand', 'placeProduction', 'color', 'material'],
          on: Sequelize.literal('Product.id = stationeryDetail.product_id AND Product.type = "STATIONERY"')
        },
        {
          model: Category,
          as: 'category',
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'productImages',
          required: false
        }
      ]
    })

    return { data, count }
  } catch (error) {
    throw error
  }
}

const getProductById = async (productId) => {
  try {
    // 1) Lấy product + các related details (không aggregate)
    const product = await Product.findByPk(productId, {
      attributes: [
        'id',
        'name',
        'price',
        'discount',
        'stock',
        'description',
        'coverImageUrl',
        'dimension',
        'type',
        'categoryId',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: BookDetail,
          as: 'bookDetail',
          required: false,
          attributes: [
            'product_id',
            'bookGenreId',
            'author',
            'translator',
            'language',
            'publisher',
            'publishYear',
            'pageCount'
          ],
          // Nếu bạn muốn ràng buộc theo type, giữ literal; nếu không, có thể bỏ on
          on: sequelize.literal('Product.id = bookDetail.product_id AND Product.type = "BOOK"')
        },
        {
          model: StationeryDetail,
          as: 'stationeryDetail',
          required: false,
          attributes: ['product_id', 'brand', 'placeProduction', 'color', 'material'],
          on: sequelize.literal('Product.id = stationeryDetail.product_id AND Product.type = "STATIONERY"')
        },
        {
          model: Category,
          as: 'category',
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'productImages',
          required: false,
          attributes: ['id', 'imageUrl'] // sửa theo schema của bạn nếu cần
        }
      ]
    })

    if (!product) return null

    // 2) Tính aggregates từ Review riêng
    const stats = await Review.findOne({
      where: {
        [Op.or]: [
          { productId: productId }, // camelCase FK (nếu model mapping)
          { product_id: productId } // snake_case FK (nếu DB dùng snake_case)
        ]
      },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('rating')), 0), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    })

    const avgRating = stats && stats.avgRating !== null ? parseFloat(stats.avgRating) : 0
    const totalReviews = stats && stats.totalReviews !== null ? parseInt(stats.totalReviews, 10) : 0

    // 3) Tính tổng số lượng đã bán (không bao gồm order có status = 'RETURNED')
    // Lưu ý:
    // - Mình giả sử model của bảng order_items là OrderItem
    // - OrderItem.hasOne/.belongsTo(Order) và alias trong association là 'order' (nếu khác hãy đổi `as`)
    // - Bảng order_items dùng cột product_id và quantity
    const sales = await OrderItem.findOne({
      where: {
        [Op.or]: [
          { product_id: productId }, // snake_case column
          { productId: productId } // camelCase mapping nếu có
        ]
      },
      include: [
        {
          model: Order,
          as: 'order', // đổi theo alias association của bạn nếu khác
          required: true, // chỉ tính các order có bản ghi order liên quan
          attributes: [],
          where: {
            // loại bỏ các order có status = 'RETURNED'
            status: { [Op.notIn]: ['RETURNED'] }
          }
        }
      ],
      attributes: [
        // COALESCE(SUM(quantity), 0) as totalSold
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('quantity')), 0), 'totalSold']
      ],
      raw: true
    })

    const totalSold = sales && sales.totalSold !== null ? parseInt(sales.totalSold, 10) : 0

    // 4) Ghép kết quả và trả về (chuyển product sang plain object)
    const productJson = product.toJSON ? product.toJSON() : product

    return {
      ...productJson,
      avgRating,
      totalReviews,
      totalSold
    }
  } catch (error) {
    // tuỳ project bạn có thể log error ở đây
    throw error
  }
}

const create = async (reqBody, coverImageFile, productImageFiles) => {
  try {
    const existProduct = await Product.findOne({
      attributes: ['name'],
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), reqBody.name.toLowerCase()),
      raw: true
    })
    if (existProduct) throw new ApiError(409, 'Sản phẩm đã tồn tại!')

    // Upload cover image (required)
    if (!coverImageFile) {
      throw new ApiError(422, 'Cover image is required')
    }
    const uploadResult = await UploadImageProvider.uploadImage(
      coverImageFile.buffer,
      'coverImages',
      coverImageFile.originalname
    )
    const coverImageUrl = uploadResult.fileUrl

    // Upload product images
    const uploadedProductImages = []
    if (productImageFiles && productImageFiles.length > 0) {
      for (const file of productImageFiles) {
        const uploadResult = await UploadImageProvider.uploadImage(
          file.buffer,
          'productImages',
          file.originalname
        )
        uploadedProductImages.push({ imageUrl: uploadResult.fileUrl })
      }
    }

    const product = await sequelize.transaction(async (t) => {
      // Tạo mảng include động
      const include = [{ model: ProductImage, as: 'productImages' }]

      // Chuẩn bị data chính
      const data = {
        categoryId: reqBody.categoryId,
        name: reqBody.name,
        price: reqBody.price,
        discount: reqBody.discount,
        stock: reqBody.stock,
        description: reqBody.description,
        coverImageUrl: coverImageUrl,
        dimension: reqBody.dimension,
        type: reqBody.type,
        // Use uploaded product images or fallback to reqBody.productImages (if provided as URLs)
        productImages: uploadedProductImages.length > 0 
          ? uploadedProductImages 
          : (reqBody.productImages || []).map((i) => ({ imageUrl: i.imageUrl }))
      }

      // Nếu là sách thì đóng gói bookDetail và include model
      if (reqBody.type === 'BOOK') {
        data.bookDetail = {
          bookGenreId: reqBody.bookDetail.bookGenreId,
          author: reqBody.bookDetail.author,
          translator: reqBody.bookDetail.translator,
          language: reqBody.bookDetail.language,
          publisher: reqBody.bookDetail.publisher,
          publishYear: reqBody.bookDetail.publishYear,
          pageCount: reqBody.bookDetail.pageCount
        }
        include.push({ model: BookDetail, as: 'bookDetail' })
      }

      // Nếu là văn phòng phẩm thì đóng gói stationeryDetail và include model
      if (reqBody.type === 'STATIONERY') {
        data.stationeryDetail = {
          brand: reqBody.stationeryDetail.brand,
          placeProduction: reqBody.stationeryDetail.placeProduction,
          color: reqBody.stationeryDetail.color,
          material: reqBody.stationeryDetail.material
          // … thêm các field khác nếu có
        }
        include.push({ model: StationeryDetail, as: 'stationeryDetail' })
      }

      // Cuối cùng tạo record
      return Product.create(data, {
        include,
        transaction: t
      })
    })
    return product
  } catch (error) {
    throw error
  }
}

const update = async (productId, reqBody, coverImageFile, productImageFiles) => {
  try {
    // Lấy product cũ
    const oldProduct = await Product.findByPk(productId)
    if (oldProduct === reqBody) throw new ApiError(404, 'Không tìm thấy sản phẩm!')
    if (!oldProduct) throw new ApiError(404, 'Không tìm thấy sản phẩm!')

    // Upload cover image
    let coverImageUrl
    if (coverImageFile) {
      const uploadResult = await UploadImageProvider.uploadImage(
        coverImageFile.buffer,
        'coverImages',
        coverImageFile.originalname
      )
      coverImageUrl = uploadResult.fileUrl
    } else {
      coverImageUrl = oldProduct.coverImageUrl
    }

    // Upload product images
    const uploadedProductImages = []
    if (productImageFiles && productImageFiles.length > 0) {
      for (const file of productImageFiles) {
        const uploadResult = await UploadImageProvider.uploadImage(
          file.buffer,
          'productImages',
          file.originalname
        )
        uploadedProductImages.push({ imageUrl: uploadResult.fileUrl })
      }
    }

    // Nếu type không đổi, chỉ update trong cùng model
    if (reqBody.type === oldProduct.type) {
      return await sequelize.transaction(async (t) => {
        // 1. Cập nhật trường chung
        await Product.update(
          {
            categoryId: reqBody.categoryId,
            name: reqBody.name,
            price: reqBody.price,
            discount: reqBody.discount,
            stock: reqBody.stock,
            description: reqBody.description,
            coverImageUrl: coverImageUrl,
            dimension: reqBody.dimension,
            type: reqBody.type
          },
          {
            where: { id: productId },
            transaction: t
          }
        )

        // 2. Cập nhật riêng detail
        if (reqBody.type === 'BOOK') {
          await BookDetail.update(
            {
              bookGenreId: reqBody.bookDetail.bookGenreId,
              author: reqBody.bookDetail.author,
              translator: reqBody.bookDetail.translator,
              language: reqBody.bookDetail.language,
              publisher: reqBody.bookDetail.publisher,
              publishYear: reqBody.bookDetail.publishYear,
              pageCount: reqBody.bookDetail.pageCount
            },
            {
              where: { productId }, // foreignKey của BookDetail
              transaction: t
            }
          )
        } else {
          await StationeryDetail.update(
            {
              brand: reqBody.stationeryDetail.brand,
              placeProduction: reqBody.stationeryDetail.placeProduction,
              color: reqBody.stationeryDetail.color,
              material: reqBody.stationeryDetail.material
            },
            {
              where: { productId },
              transaction: t
            }
          )
        }

        // 3. Xử lý product images
        // Merge new uploaded files with existing URLs from reqBody
        const allProductImages = [...uploadedProductImages]
        if (reqBody.productImages && Array.isArray(reqBody.productImages)) {
          reqBody.productImages.forEach((img) => {
            const imageUrl = typeof img === 'string' ? img : img.imageUrl
            if (imageUrl) {
              allProductImages.push({ imageUrl })
            }
          })
        }

        if (allProductImages.length > 0 || uploadedProductImages.length > 0 || (reqBody.productImages && Array.isArray(reqBody.productImages))) {
          // Xóa product images cũ
          await ProductImage.destroy({
            where: { productId },
            transaction: t
          })
          // Tạo product images mới (merged from files and URLs)
          if (allProductImages.length > 0) {
            await ProductImage.bulkCreate(
              allProductImages.map((img) => ({ ...img, productId })),
              { transaction: t }
            )
          }
        }

        // 4. Trả về đối tượng đầy đủ với include
        return await Product.findByPk(productId, {
          include: [
            { model: ProductImage, as: 'productImages' },
            { model: BookDetail, as: 'bookDetail' },
            { model: StationeryDetail, as: 'stationeryDetail' }
          ],
          transaction: t
        })
      })
    }
    // Nếu type thay đổi
    else {
      const product = await sequelize.transaction(async (t) => {
        // 1. Xóa detail cũ
        if (oldProduct.type === 'BOOK') {
          await BookDetail.destroy({ where: { productId }, transaction: t })
        } else if (oldProduct.type === 'STATIONERY') {
          await StationeryDetail.destroy({ where: { productId }, transaction: t })
        }

        // 2. Cập nhật phần chung của product
        await Product.update(
          {
            categoryId: reqBody.categoryId,
            name: reqBody.name,
            price: reqBody.price,
            discount: reqBody.discount,
            stock: reqBody.stock,
            description: reqBody.description,
            coverImageUrl,
            dimension: reqBody.dimension,
            type: reqBody.type
          },
          { where: { id: productId }, transaction: t }
        )

        // 3. Tạo detail mới tùy theo type mới
        if (reqBody.type === 'BOOK') {
          await BookDetail.create(
            {
              productId,
              bookGenreId: reqBody.bookDetail.bookGenreId,
              author: reqBody.bookDetail.author,
              translator: reqBody.bookDetail.translator,
              language: reqBody.bookDetail.language,
              publisher: reqBody.bookDetail.publisher,
              publishYear: reqBody.bookDetail.publishYear,
              pageCount: reqBody.bookDetail.pageCount
            },
            { transaction: t }
          )
        } else if (reqBody.type === 'STATIONERY') {
          await StationeryDetail.create(
            {
              productId,
              brand: reqBody.stationeryDetail.brand,
              placeProduction: reqBody.stationeryDetail.placeProduction,
              color: reqBody.stationeryDetail.color,
              material: reqBody.stationeryDetail.material
            },
            { transaction: t }
          )
        }

        // 4. Xử lý product images
        // Merge new uploaded files with existing URLs from reqBody
        const allProductImagesTypeChange = [...uploadedProductImages]
        if (reqBody.productImages && Array.isArray(reqBody.productImages)) {
          reqBody.productImages.forEach((img) => {
            const imageUrl = typeof img === 'string' ? img : img.imageUrl
            if (imageUrl) {
              allProductImagesTypeChange.push({ imageUrl })
            }
          })
        }

        if (allProductImagesTypeChange.length > 0 || uploadedProductImages.length > 0 || (reqBody.productImages && Array.isArray(reqBody.productImages))) {
          // Xóa product images cũ
          await ProductImage.destroy({
            where: { productId },
            transaction: t
          })
          // Tạo product images mới (merged from files and URLs)
          if (allProductImagesTypeChange.length > 0) {
            await ProductImage.bulkCreate(
              allProductImagesTypeChange.map((img) => ({ ...img, productId })),
              { transaction: t }
            )
          }
        }

        // 5. Trả về object mới với include
        return Product.findByPk(productId, {
          include: [
            { model: ProductImage, as: 'productImages' },
            { model: BookDetail, as: 'bookDetail' },
            { model: StationeryDetail, as: 'stationeryDetail' }
          ],
          transaction: t
        })
      })

      return product
    }
  } catch (err) {
    throw err
  }
}

const deleteById = async (productId) => {
  // 1. Lấy trước sản phẩm (để biết có tồn tại & nếu cần, trả về dữ liệu cũ)
  const product = await Product.findByPk(productId)
  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm!')
  }

  // 2. Xóa trong transaction
  await sequelize.transaction(async (t) => {
    // Xóa ảnh liên quan
    await ProductImage.destroy({
      where: { productId },
      transaction: t
    })

    // Xóa chi tiết sách nếu có
    await BookDetail.destroy({
      where: { productId },
      transaction: t
    })

    // Xóa chi tiết văn phòng phẩm nếu có
    await StationeryDetail.destroy({
      where: { productId },
      transaction: t
    })

    // Cuối cùng xóa record chính
    const count = await Product.destroy({
      where: { id: productId },
      transaction: t
    })

    if (count === 0) {
      // Trong trường hợp hiếm, nếu không xóa được
      throw new ApiError(500, 'Xóa sản phẩm thất bại!')
    }
  })

  // 3. Trả về dữ liệu cũ (nếu cần)
  return product
}

const getCategories = async () => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [
        // nếu name = 'Sách' thì trả 0 (lên đầu), còn lại 1
        // prettier-ignore
        [Sequelize.literal('CASE WHEN name = \'Sách\' THEN 0 ELSE 1 END'), 'ASC'],
        ['name', 'ASC']
      ]
    })
    return categories
  } catch (error) {
    throw error
  }
}

const getBookGenres = async () => {
  try {
    const bookGenres = await BookGenre.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    })
    return bookGenres
  } catch (error) {
    throw error
  }
}

const searchAndFilterProducts = async (filters) => {
  try {
    const {
      page = DEFAULT_PAGE,
      itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
      search,
      type,
      bookGenreId,
      language,
      categoryId,
      minPrice,
      maxPrice
    } = filters

    const offset = (page - 1) * itemsPerPage

    // Build where clause cho Product
    const whereClause = {}

    // Search theo tên sản phẩm
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` }
    }

    // Filter theo type (BOOK hoặc STATIONERY)
    if (type) {
      whereClause.type = type
    }

    // Filter theo categoryId (cho STATIONERY)
    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    // Filter theo giá - tính theo giá sau discount
    const hasMinPrice = minPrice !== undefined && minPrice !== null && minPrice !== '' && !isNaN(minPrice)
    const hasMaxPrice = maxPrice !== undefined && maxPrice !== null && maxPrice !== '' && !isNaN(maxPrice)

    if (hasMinPrice || hasMaxPrice) {
      // Tính giá thực tế sau discount: price * (100 - discount) / 100
      const finalPriceFormula = 'price * (100 - discount) / 100'

      if (hasMinPrice && hasMaxPrice) {
        whereClause[Op.and] = [
          Sequelize.literal(`${finalPriceFormula} >= ${parseFloat(minPrice)}`),
          Sequelize.literal(`${finalPriceFormula} <= ${parseFloat(maxPrice)}`)
        ]
      } else if (hasMinPrice) {
        whereClause[Op.and] = [Sequelize.literal(`${finalPriceFormula} >= ${parseFloat(minPrice)}`)]
      } else if (hasMaxPrice) {
        whereClause[Op.and] = [Sequelize.literal(`${finalPriceFormula} <= ${parseFloat(maxPrice)}`)]
      }
    }

    // Build include array
    const includeArray = [
      {
        model: Category,
        as: 'category',
        required: false,
        attributes: ['id', 'name']
      },
      {
        model: ProductImage,
        as: 'productImages',
        required: false
      }
    ]

    // Include BookDetail với điều kiện filter
    const bookDetailInclude = {
      model: BookDetail,
      as: 'bookDetail',
      required: false,
      attributes: [
        'bookGenreId',
        'author',
        'translator',
        'language',
        'publisher',
        'publishYear',
        'pageCount'
      ],
      include: [
        {
          model: BookGenre,
          as: 'bookGenre',
          required: false,
          attributes: ['id', 'name']
        }
      ]
    }

    // Nếu có filter theo bookGenreId hoặc language cho BOOK
    if (bookGenreId || language) {
      const bookDetailWhere = {}
      if (bookGenreId) {
        bookDetailWhere.bookGenreId = bookGenreId
      }
      if (language) {
        bookDetailWhere.language = { [Op.like]: `%${language}%` }
      }
      bookDetailInclude.where = bookDetailWhere
      bookDetailInclude.required = true // Bắt buộc có BookDetail khi filter
    }

    includeArray.push(bookDetailInclude)

    // Include StationeryDetail
    includeArray.push({
      model: StationeryDetail,
      as: 'stationeryDetail',
      required: false,
      attributes: ['brand', 'placeProduction', 'color', 'material']
    })

    const { rows: data, count } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(itemsPerPage, 10),
      offset: parseInt(offset, 10),
      order: [['updatedAt', 'DESC']],
      attributes: [
        'id',
        'name',
        'price',
        'discount',
        'stock',
        'description',
        'coverImageUrl',
        'dimension',
        'type',
        'categoryId',
        'createdAt',
        'updatedAt'
      ],
      include: includeArray,
      distinct: true // Tránh duplicate khi có join
    })

    return { data, count }
  } catch (error) {
    throw error
  }
}

const getTopTrendingProducts = async () => {
  try {
    const products = await Product.findAll({
      limit: 8,
      attributes: [
        'id',
        'name',
        'price',
        'discount',
        'stock',
        'description',
        'coverImageUrl',
        'dimension',
        'type',
        'categoryId',
        'createdAt',
        'updatedAt',
        [
          Sequelize.literal(`(
            SELECT COALESCE(SUM(oi.quantity), 0)
            FROM order_items AS oi
            WHERE oi.product_id = Product.id
          )`),
          'soldQuantity'
        ]
      ],
      order: [[Sequelize.literal('soldQuantity'), 'DESC']],
      include: [
        {
          model: BookDetail,
          as: 'bookDetail',
          required: false,
          attributes: [
            'bookGenreId',
            'author',
            'translator',
            'language',
            'publisher',
            'publishYear',
            'pageCount'
          ]
        },
        {
          model: StationeryDetail,
          as: 'stationeryDetail',
          required: false,
          attributes: ['brand', 'placeProduction', 'color', 'material']
        },
        {
          model: Category,
          as: 'category',
          required: false,
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'productImages',
          required: false
        }
      ]
    })

    return products
  } catch (error) {
    console.error('🔥 Error in getTopTrendingProducts:', error)
    throw error
  }
}

export const productService = {
  create,
  getProducts,
  getProductById,
  update,
  deleteById,
  getCategories,
  getBookGenres,
  searchAndFilterProducts,
  getTopTrendingProducts
}
