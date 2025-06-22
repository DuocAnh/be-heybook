import crypto from 'crypto'
import { env } from '~/config/environment'
import querystring from 'qs'
import dateFormat from 'dayjs'

const sortObject = (params) => {
  return Object.entries(params)
    .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
    .reduce((result, item) => {
      result = {
        ...result,
        [item[0]]: encodeURIComponent(item[1].toString().replace(/ /g, '+'))
      }

      return result
    }, {})
}

class VNPayProvider {
  constructor() {
    this.tmnCode = env.VNPAY_TMN_CODE
    this.secretKey = env.VNPAY_HASH_SECRET
    this.vnpUrl = env.VNPAY_URL
    this.returnUrl = env.VNPAY_RETURN_URL
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl({ orderId, amount, orderInfo, ipAddr }) {
    // const ipAddr =
    //   req.headers['x-forwarded-for'] ||
    //   req.connection.remoteAddress ||
    //   req.socket.remoteAddress ||
    //   req.connection.socket.remoteAddress

    let vnpUrl = this.vnpUrl

    const date = new Date()

    const createDate = dateFormat(date).format('YYYYMMDDHHmmss')
    const expiredDate = dateFormat(date).add(10, 'm').format('YYYYMMDDHHmmss')

    const currCode = 'VND'
    let vnp_Params = {}
    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = this.tmnCode
    vnp_Params['vnp_Locale'] = 'vn'
    vnp_Params['vnp_CurrCode'] = currCode
    vnp_Params['vnp_TxnRef'] = orderId
    vnp_Params['vnp_OrderInfo'] = orderInfo
    vnp_Params['vnp_OrderType'] = 'other'
    vnp_Params['vnp_Amount'] = amount * 100
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl
    vnp_Params['vnp_IpAddr'] = ipAddr
    vnp_Params['vnp_CreateDate'] = createDate
    vnp_Params['vnp_ExpireDate'] = expiredDate

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', this.secretKey)
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

    return vnpUrl
  }
}

export default new VNPayProvider()
