import express from 'express'
import { userRoute } from '~/routes/v1/userRoute'
import { categoryRoute } from './categoryRoute'
import { bookGenreRoute } from './bookGenreRoute'
import { productRoute } from './productRoute'
import { couponRoute } from './couponRoute'
import { cartRoute } from './cartRoute'
import { orderRoute } from './orderRoute'
import { reviewRoute } from './reviewRoute'
import { addressRoute } from './addressRoute'

const Router = express.Router()

// Check API v1/status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs V1 are ready to use.' })
})

// User API
Router.use('/users', userRoute)

Router.use('/categories', categoryRoute)

Router.use('/book-genres', bookGenreRoute)

Router.use('/products', productRoute)

Router.use('/coupons', couponRoute)

Router.use('/cart', cartRoute)

Router.use('/orders', orderRoute)

Router.use('/reviews', reviewRoute)

Router.use('/addresses', addressRoute)

export const APIs_V1 = Router
