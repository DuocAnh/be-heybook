import express from 'express'
import path from 'path'
import { env } from '~/config/environment'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mySQL'
import cookieParser from 'cookie-parser'
import exitHook from 'async-exit-hook'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import http from 'http'
import { Server } from 'socket.io'
import { initSocketServer } from '~/sockets'


const START_SERVER = () => {
  const app = express()

  // Fix Cache from disk của ExpressJS
  // https://stackoverflow.com/a/53240717/832417
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  // Handle CORS
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  })

  initSocketServer(io) // 👉 Gọi logic socket bạn đã viết

  server.listen(env.APP_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `3. Hi ${env.AUTHOR}, Back-end Server is running successfully at ${env.APP_HOST}:${env.APP_PORT}`
    )
  })

  // Thực hiện cleanup trước khi dừng server
  // exitHook(() => {
  //   console.log('4. Server is shutting down...')
  //   CLOSE_DB()
  //   console.log('5. Disconnected from MySQL')
  // })
}

  ; (async () => {
    try {
      console.log('1. Connecting to MySQL...')
      await CONNECT_DB()
      console.log('2. Connected to MySQL')

      // Khởi động server back-end sau khi đã connect database thành công
      START_SERVER()
    } catch (error) {
      console.error(error)
      process.exit(0)
    }
  })()
